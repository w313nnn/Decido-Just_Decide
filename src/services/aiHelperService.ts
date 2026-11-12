import { FoodCategory, FoodPreference } from '../types/food';
export interface ParsedStudentPrompt { budget?: number; category?: FoodCategory; preference?: FoodPreference; summary: string; }
// This optional shortcut runs locally. No private API key belongs in a browser bundle.
export function parsePromptLocally(text: string): ParsedStudentPrompt {
  const lower = text.toLowerCase();
  const amount = lower.match(/(?:\brm|\bmyr|\bbudget|\bunder|\bbelow|\$)\s*(\d+(?:\.\d+)?)/i)
    || lower.match(/(\d+(?:\.\d+)?)\s*(?:ringgit|myr|bucks)\b/i);
  const value = amount ? Number(amount[1]) : undefined;
  const budget = Number.isFinite(value) && value! >= 1 && value! <= 100 ? value : undefined;
  let category: FoodCategory | undefined;
  if (/\b(dessert|tong sui|ice cream|cendol)\b/.test(lower)) category = 'dessert';
  else if (/\b(drink|beverage|kopi|coffee|tea|boba)\b/.test(lower)) category = 'drink';
  else if (/\b(food|rice|nasi|noodles?|mee|lunch|dinner|breakfast)\b/.test(lower)) category = 'food';
  let preference: FoodPreference = 'anything';
  if (/\b(not spicy|non-spicy|no chilli|no chili)\b/.test(lower)) preference = 'anything';
  else if (/\b(spicy|pedas|chilli|sambal)\b/.test(lower)) preference = 'spicy';
  else if (/\b(soup|broth|sup)\b/.test(lower)) preference = 'soup';
  else if (/\b(noodles?|mee|kuey teow|bihun|ramen)\b/.test(lower)) preference = 'noodles';
  else if (/\b(rice|nasi|zap fan)\b/.test(lower)) preference = 'rice';
  else if (/\b(light|vegetarian|vege)\b/.test(lower)) preference = 'light';
  else if (/\b(refreshing|cold|iced|lemon)\b/.test(lower)) preference = 'refreshing';
  else if (/\b(sweet|sugar)\b/.test(lower)) preference = 'sweet';
  else if (/\b(comfort|coffee|kopi)\b/.test(lower)) preference = 'comfort';
  return { budget, category, preference, summary: 'Check the choices below before finding a suggestion.' };
}
export async function parsePromptWithGemini(text: string): Promise<ParsedStudentPrompt> {
  return parsePromptLocally(text);
}
