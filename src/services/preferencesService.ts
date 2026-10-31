import { UserPreferences } from '../types/food';

const PREFS_STORAGE_KEY = 'makanmana_user_preferences_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  campusId: 'utar-sungai-long',
  defaultBudgetFood: 10,
  defaultBudgetDrink: 5,
  defaultBudgetDessert: 5,
  dietaryRestrictions: [],
  dislikedItems: [],
  showSwipeGuidance: true,
};

export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
