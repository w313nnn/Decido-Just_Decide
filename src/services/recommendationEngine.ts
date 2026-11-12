import { FoodItem, RecommendationRequest, RecommendationResult } from '../types/food';
import { SUNGAI_LONG_FOOD_DATABASE } from '../data/sungaiLongFood';
import { getDaysAgo, getHistory } from './historyService';
import { getPreferences } from './preferencesService';

interface ScoredCandidate {
  item: FoodItem;
  score: number;
  reason: string;
  recencyNote?: string;
}

export function getRecommendation(request: RecommendationRequest): RecommendationResult | null {
  const { category, budget, preference, campusId = 'utar-sungai-long', excludeItemIds = [] } = request;
  if (!Number.isFinite(budget) || budget < 1 || budget > 100) return null;
  const history = getHistory().filter(record => record.campusId === campusId);
  const preferences = getPreferences();

  // 1. Base Database filtering by Campus and Category
  let pool = SUNGAI_LONG_FOOD_DATABASE.filter(
    (item) => item.campusId === campusId && item.category === category
  );

  if (pool.length === 0) {
    return null;
  }

  // Budgets, restrictions, dislikes and skipped items are hard constraints.
  pool = pool.filter(item => !excludeItemIds.includes(item.id) &&
    !preferences.dislikedItems.includes(item.id) && item.price <= budget &&
    preferences.dietaryRestrictions.every(tag => item.dietary.includes(tag)));
  if (!pool.length) return null;
  const candidatePool = pool;
  const isBudgetStretched = false;

  // 4. Analyze recent meals from history to find patterns
  const recentMeals = history.slice(0, 10);
  const eatenToday = recentMeals.filter((h) => getDaysAgo(h.decidedAt) === 0);
  const eatenYesterday = recentMeals.filter((h) => getDaysAgo(h.decidedAt) === 1);
  const eaten2To3Days = recentMeals.filter((h) => {
    const d = getDaysAgo(h.decidedAt);
    return d >= 2 && d <= 3;
  });

  // Check carbs of yesterday's food meal
  const yesterdayFoodRecord = eatenYesterday.find((h) => h.category === 'food');
  let yesterdayFoodItem: FoodItem | undefined;
  if (yesterdayFoodRecord) {
    yesterdayFoodItem = SUNGAI_LONG_FOOD_DATABASE.find(
      (item) => item.id === yesterdayFoodRecord.foodItemId
    );
  }

  // 5. Score Candidates
  const scored: ScoredCandidate[] = candidatePool.map((item) => {
    let score = item.popularityScore * 5; // Base popularity 40 - 50
    let reason = '';
    let recencyNote = '';

    // --- Recency Penalty / Bonus Calculation ---
    const isEatenToday = eatenToday.some((h) => h.foodItemId === item.id);
    const isEatenYesterday = eatenYesterday.some((h) => h.foodItemId === item.id);
    const isEaten2or3Days = eaten2To3Days.some((h) => h.foodItemId === item.id);
    const lastEatenRecord = recentMeals.find((h) => h.foodItemId === item.id);

    if (isEatenToday) {
      // Strongly avoid if eaten today
      score -= 100;
      recencyNote = 'Eaten today';
    } else if (isEatenYesterday) {
      // Strongly reduce score if eaten yesterday
      score -= 50;
      recencyNote = 'Eaten yesterday';
    } else if (isEaten2or3Days) {
      // Slightly reduce score if eaten 2-3 days ago
      score -= 20;
      recencyNote = 'Eaten 2-3 days ago';
    } else if (!lastEatenRecord) {
      // Never eaten recently: variety bonus!
      score += 25;
      recencyNote = "Haven't had this recently";
    }

    // Carbs variety logic: if had rice yesterday, give noodles a healthy nudge
    if (yesterdayFoodItem?.carbsType === 'rice' && item.carbsType === 'noodles') {
      score += 12;
    } else if (yesterdayFoodItem?.carbsType === 'noodles' && item.carbsType === 'rice') {
      score += 12;
    }

    // --- Preference Match ---
    let preferenceMatched = false;
    switch (preference) {
      case 'spicy':
        if (item.spicyLevel >= 1) {
          score += 35 + item.spicyLevel * 5;
          preferenceMatched = true;
        } else {
          score -= 15;
        }
        break;

      case 'soup':
        if (item.soupOrDry === 'soup') {
          score += 40;
          preferenceMatched = true;
        } else {
          score -= 10;
        }
        break;

      case 'rice':
        if (item.carbsType === 'rice') {
          score += 40;
          preferenceMatched = true;
        }
        break;

      case 'noodles':
        if (item.carbsType === 'noodles') {
          score += 40;
          preferenceMatched = true;
        }
        break;

      case 'light':
        if (
          item.price <= 7.5 ||
          item.subcategory === 'Soy & Herbal' ||
          item.dietary.includes('vegetarian') ||
          item.soupOrDry === 'soup'
        ) {
          score += 35;
          preferenceMatched = true;
        }
        break;

      case 'refreshing':
        if (item.subcategory === 'Juice' || item.subcategory === 'Ice Cream' || item.id === 'sl-mixue-lemonade' || item.id === 'sl-coconut-shake') {
          score += 40;
          preferenceMatched = true;
        }
        break;

      case 'sweet':
        if (category === 'dessert' || item.subcategory === 'Milk Tea' || item.subcategory === 'Ice Cream') {
          score += 35;
          preferenceMatched = true;
        }
        break;

      case 'comfort':
        if (category === 'drink' ? /coffee|kopi|teh/i.test(item.name) : item.popularityScore >= 9.0) {
          score += 30;
          preferenceMatched = true;
        }
        break;

      case 'anything':
      default:
        // Give a slight variety spread
        score += Math.random() * 8;
        break;
    }

    // --- Budget Alignment Score ---
    if (!isBudgetStretched) {
      const budgetSurplus = budget - item.price;
      // Ideal meals use good value within budget
      if (budgetSurplus >= 0) {
        score += 15;
        if (budgetSurplus <= 2.5) {
          // Maximizes budget nicely
          score += 8;
        }
      }
    } else {
      // Penalize for exceeding budget, prioritize lowest price available
      score -= (item.price - budget) * 15;
    }

    // Proximity convenience bonus (close to campus)
    if (item.walkingMinutesFromCampus <= 3) {
      score += 5;
    }

    // --- Construct Short, Clean Explainable Reason ---
    if (isBudgetStretched) {
      reason = `Closest option at RM${item.price.toFixed(2)}`;
    } else if (yesterdayFoodItem && yesterdayFoodItem.carbsType === 'rice' && item.carbsType === 'noodles') {
      reason = `Switched to noodles after rice yesterday`;
    } else if (yesterdayFoodItem && yesterdayFoodItem.carbsType === 'noodles' && item.carbsType === 'rice') {
      reason = `Switched to rice after noodles yesterday`;
    } else if (preferenceMatched && preference === 'spicy') {
      reason = `Spicy craving within your budget`;
    } else if (preferenceMatched && preference === 'soup') {
      reason = `Soup within your budget`;
    } else if (preferenceMatched && preference === 'noodles') {
      reason = `Noodle craving within your budget`;
    } else if (preferenceMatched && preference === 'rice') {
      reason = `Hearty rice within your budget`;
    } else if (preferenceMatched && preference === 'light') {
      reason = `A lighter option within your budget`;
    } else if (item.walkingMinutesFromCampus <= 2) {
      reason = `Within your budget; a short walk from campus`;
    } else {
      reason = `Within your budget`;
    }

    return { item, score, reason, recencyNote };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Take the best candidate
  const best = scored[0];

  return {
    item: best.item,
    score: Math.round(best.score),
    reason: best.reason,
    recencyNote: best.recencyNote,
    remainingCandidatesCount: Math.max(0, scored.length - 1),
  };
}

