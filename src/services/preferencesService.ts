import { DietaryTag, UserPreferences } from '../types/food';
import { readStored, writeStored } from './storage';
export const DEFAULT_PREFERENCES: UserPreferences = {
  campusId: 'utar-sungai-long', defaultBudgetFood: 10, defaultBudgetDrink: 5,
  defaultBudgetDessert: 5, dietaryRestrictions: [], dislikedItems: [], showSwipeGuidance: true,
};
const tags: DietaryTag[] = ['halal', 'pork-free', 'vegetarian', 'beef-free'];
function validBudget(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 100 ? value : fallback;
}
function normalize(value: Partial<UserPreferences> | null): UserPreferences {
  const p = value && typeof value === 'object' ? value : {};
  return {
    campusId: 'utar-sungai-long',
    defaultBudgetFood: validBudget(p.defaultBudgetFood, 10),
    defaultBudgetDrink: validBudget(p.defaultBudgetDrink, 5),
    defaultBudgetDessert: validBudget(p.defaultBudgetDessert, 5),
    dietaryRestrictions: Array.isArray(p.dietaryRestrictions) ? p.dietaryRestrictions.filter(t => tags.includes(t)) : [],
    dislikedItems: Array.isArray(p.dislikedItems) ? p.dislikedItems.filter(t => typeof t === 'string') : [],
    showSwipeGuidance: p.showSwipeGuidance !== false,
  };
}
export function getPreferences(): UserPreferences { return normalize(readStored('preferences', null)); }
export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const updated = normalize({ ...getPreferences(), ...prefs });
  writeStored('preferences', updated);
  return updated;
}
