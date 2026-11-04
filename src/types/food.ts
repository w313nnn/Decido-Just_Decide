export type FoodCategory = 'food' | 'drink' | 'dessert';

export type FoodPreference =
  | 'anything'
  | 'spicy'
  | 'soup'
  | 'rice'
  | 'noodles'
  | 'light'
  | 'sweet'
  | 'refreshing'
  | 'comfort';

export type DietaryTag = 'halal' | 'pork-free' | 'vegetarian' | 'beef-free';

export interface Campus {
  id: string;
  name: string;
  shortCode: string;
  universityName: string;
  town: string;
  state: string;
  isAvailable: boolean;
  landmark: string;
}

export interface FoodItem {
  id: string;
  name: string;
  malayName?: string;
  category: FoodCategory;
  subcategory: string;
  price: number;
  priceMin?: number;
  priceMax?: number;
  spicyLevel: 0 | 1 | 2 | 3; // 0 = not spicy, 3 = very spicy
  soupOrDry: 'soup' | 'dry' | 'gravy' | 'beverage' | 'snack';
  carbsType?: 'rice' | 'noodles' | 'bread' | 'none';
  dietary: DietaryTag[];
  campusId: string;
  locationName: string;
  walkingMinutesFromCampus: number;
  description: string;
  emoji: string;
  popularityScore: number; // 1-10
}

export interface DecisionRecord {
  id: string;
  foodItemId: string;
  foodItemName: string;
  emoji: string;
  category: FoodCategory;
  price: number;
  locationName: string;
  decidedAt: string; // ISO date-time string
  reason: string;
  campusId: string;
}

export interface UserPreferences {
  campusId: string;
  defaultBudgetFood: number;
  defaultBudgetDrink: number;
  defaultBudgetDessert: number;
  dietaryRestrictions: DietaryTag[];
  dislikedItems: string[];
  showSwipeGuidance?: boolean;
}

export interface RecommendationRequest {
  category: FoodCategory;
  budget: number;
  preference: FoodPreference;
  campusId?: string;
  excludeItemIds?: string[];
  naturalLanguageNote?: string;
}

export interface RecommendationResult {
  item: FoodItem;
  score: number;
  reason: string;
  recencyNote?: string;
  remainingCandidatesCount: number;
}

