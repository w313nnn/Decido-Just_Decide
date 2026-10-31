import { FoodCategory, FoodPreference } from '../types/food';
import { GoogleGenAI, Type } from '@google/genai';

export interface ParsedStudentPrompt {
  budget?: number;
  category?: FoodCategory;
  preference?: FoodPreference;
  summary: string;
}

// Fallback rule-based parser that guarantees instant, deterministic natural language extraction
// even without internet or without an API key.
export function parsePromptLocally(text: string): ParsedStudentPrompt {
  const lower = text.toLowerCase();

  // 1. Budget extraction (e.g. "RM12", "RM 10", "15 ringgit", "under 10", "budget 8")
  let budget: number | undefined;
  const rmMatch = lower.match(/(?:rm|budget|under|below|\$)\s*(\d+(?:\.\d+)?)/i);
  if (rmMatch && rmMatch[1]) {
    budget = parseFloat(rmMatch[1]);
  } else {
    const numMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:ringgit|myr|bucks)/i);
    if (numMatch && numMatch[1]) {
      budget = parseFloat(numMatch[1]);
    }
  }

  // 2. Category extraction
  let category: FoodCategory = 'food';
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('kopi') || lower.includes('coffee') || lower.includes('tea') || lower.includes('boba')) {
    category = 'drink';
  } else if (lower.includes('dessert') || lower.includes('tong sui') || lower.includes('ice cream') || lower.includes('cendol') || lower.includes('sweet')) {
    category = 'dessert';
  }

  // 3. Preference extraction
  let preference: FoodPreference = 'anything';
  if (lower.includes('spicy') || lower.includes('pedas') || lower.includes('chilli') || lower.includes('sambal')) {
    preference = 'spicy';
  } else if (lower.includes('soup') || lower.includes('broth') || lower.includes('sup') || lower.includes('warm')) {
    preference = 'soup';
  } else if (lower.includes('noodle') || lower.includes('mee') || lower.includes('kuey teow') || lower.includes('bihun') || lower.includes('ramen')) {
    preference = 'noodles';
  } else if (lower.includes('rice') || lower.includes('nasi') || lower.includes('fried rice') || lower.includes('zap fan')) {
    preference = 'rice';
  } else if (lower.includes('light') || lower.includes('healthy') || lower.includes('vege') || lower.includes('clean') || lower.includes('not oily')) {
    preference = 'light';
  } else if (lower.includes('refreshing') || lower.includes('cold') || lower.includes('iced') || lower.includes('lemon')) {
    preference = 'refreshing';
  } else if (lower.includes('sweet') || lower.includes('sugar')) {
    preference = 'sweet';
  } else if (lower.includes('comfort') || lower.includes('tired') || lower.includes('heavy') || lower.includes('stress')) {
    preference = 'comfort';
  }

  return {
    budget,
    category,
    preference,
    summary: `Extracted: ${category} · ${preference} · ${budget ? `RM${budget}` : 'flexible budget'}`,
  };
}

export async function parsePromptWithGemini(userPrompt: string): Promise<ParsedStudentPrompt> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any)?.env?.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return parsePromptLocally(userPrompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an AI assisting a Malaysian university student decision assistant at UTAR Sungai Long.
Extract structured meal preferences from this student's prompt:
"${userPrompt}"

Analyze:
1. budget: numeric budget in RM (e.g. 10, 12.5), or null if not stated.
2. category: "food", "drink", or "dessert".
3. preference: one of "anything", "spicy", "soup", "rice", "noodles", "light", "sweet", "refreshing", "comfort".
4. shortSummary: a 4-7 word summary.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            budget: { type: Type.NUMBER, nullable: true },
            category: { type: Type.STRING, enum: ['food', 'drink', 'dessert'] },
            preference: {
              type: Type.STRING,
              enum: ['anything', 'spicy', 'soup', 'rice', 'noodles', 'light', 'sweet', 'refreshing', 'comfort'],
            },
            shortSummary: { type: Type.STRING },
          },
          required: ['category', 'preference', 'shortSummary'],
        },
      },
    });

    const text = response.text;
    if (text) {
      const data = JSON.parse(text);
      return {
        budget: typeof data.budget === 'number' && data.budget > 0 ? data.budget : parsePromptLocally(userPrompt).budget,
        category: (data.category as FoodCategory) || 'food',
        preference: (data.preference as FoodPreference) || 'anything',
        summary: data.shortSummary || parsePromptLocally(userPrompt).summary,
      };
    }
  } catch (err) {
    console.warn('Gemini API call skipped or errored, falling back to local extractor:', err);
  }

  return parsePromptLocally(userPrompt);
}
