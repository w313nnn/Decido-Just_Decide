import React, { useState } from 'react';
import { FoodCategory, FoodPreference } from '../types/food';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Wand2,
  Check,
  Star,
  NotebookPen,
  Banknote,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parsePromptWithGemini } from '../services/aiHelperService';

interface GlareButtonProps {
  onClick: () => void;
  label?: string;
}

function GlareButton({ onClick, label = 'Describe in words' }: GlareButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex items-center justify-center text-amber-900 h-[36px] px-5 rounded-[40px] bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 cursor-pointer overflow-hidden transition-colors duration-150 shadow-xs mx-auto"
    >
      <Star className="w-3.5 h-3.5 mr-2 text-amber-600 fill-amber-500" />
      <span className="font-semibold tracking-tight text-[12.5px]">{label}</span>
      <motion.div
        animate={{ x: isHovered ? ['-150%', '150%'] : ['-150%', '150%'] }}
        transition={{
          duration: 0.85,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: isHovered ? 0.7 : 2.5,
        }}
        className="absolute top-0 bottom-0 w-[50px] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10"
      />
    </motion.button>
  );
}

interface DecideFlowProps {
  onDecide: (category: FoodCategory, budget: number, preference: FoodPreference, naturalNote?: string) => void;
  defaultBudgets: { food: number; drink: number; dessert: number };
}

export const DecideFlow: React.FC<DecideFlowProps> = ({ onDecide, defaultBudgets }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<FoodCategory>('food');
  const [budget, setBudget] = useState<number>(defaultBudgets.food);
  const [preference, setPreference] = useState<FoodPreference>('anything');

  // Natural language toggle & input
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Quick budget presets: RM5 to RM20 increases by RM5, above RM20 gap is RM10 (RM5, RM10, RM15, RM20, RM30)
  const quickPickPresets = [5, 10, 15, 20, 30];

  // Update budget when category changes
  const handleCategorySelect = (newCat: FoodCategory) => {
    setCategory(newCat);
    if (newCat === 'food') {
      setBudget(defaultBudgets.food || 10);
    } else if (newCat === 'drink') {
      setBudget(defaultBudgets.drink || 5);
    } else {
      setBudget(defaultBudgets.dessert || 5);
    }
    setPreference('anything');
  };

  const handleNextStep1 = () => {
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onDecide(category, Math.min(30, Math.max(5, budget)), preference);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const parsed = await parsePromptWithGemini(aiPrompt.trim());
      if (parsed.category) setCategory(parsed.category);
      if (parsed.budget && parsed.budget > 0) setBudget(parsed.budget);
      if (parsed.preference) setPreference(parsed.preference);

      setAiMessage(parsed.summary);

      // Trigger recommendation right away
      onDecide(
        parsed.category || category,
        parsed.budget && parsed.budget > 0 ? parsed.budget : budget,
        parsed.preference || preference,
        aiPrompt.trim()
      );
    } catch {
      setAiMessage('Could not parse clearly, using closest options.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step Progress Indicator Bar */}
      <div className="mb-4 bg-white/70 border border-stone-200/80 rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center justify-between">
        {[
          { num: 1, label: 'Decide', icon: NotebookPen },
          { num: 2, label: 'Budget', icon: Banknote },
          { num: 3, label: 'Feeling', icon: RefreshCw },
        ].map((s, idx) => {
          const isCurrent = currentStep === s.num;
          const isDone = currentStep > s.num;
          const StepIcon = s.icon;
          return (
            <React.Fragment key={s.num}>
              {idx > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    isDone ? 'bg-amber-600' : 'bg-stone-200'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num as 1 | 2 | 3);
                }}
                disabled={s.num > currentStep}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isDone
                    ? 'text-stone-700 hover:text-stone-900 cursor-pointer hover:bg-stone-50'
                    : 'text-stone-400 cursor-not-allowed opacity-60'
                }`}
                title={s.label}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors relative ${
                    isCurrent
                      ? 'bg-white text-amber-700 shadow-xs'
                      : isDone
                      ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300/80'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  <StepIcon className="w-3 h-3 stroke-[2.2]" />
                  {isDone && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-600 text-white rounded-full flex items-center justify-center ring-1 ring-white">
                      <Check className="w-1.5 h-1.5 stroke-[3.5]" />
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Container Card for Current Page */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ================= PAGE 1: STEP 1 ================= */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Step 1 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  What do you want to decide?
                </h2>
              </div>

              {/* Category Options Grid (Clean, no small captions) */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'food' as FoodCategory, label: 'Food', emoji: '🍚' },
                  { id: 'drink' as FoodCategory, label: 'Drink', emoji: '🥤' },
                  { id: 'dessert' as FoodCategory, label: 'Dessert', emoji: '🍰' },
                ].map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`py-5 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-sm ring-2 ring-amber-600'
                          : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-3xl mb-1.5 select-none">{cat.emoji}</span>
                      <span className="text-base font-bold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation CTA */}
              <button
                type="button"
                onClick={handleNextStep1}
                className="w-full h-12 px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-2xl shadow-sm shadow-amber-600/20 flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ================= PAGE 2: STEP 2 ================= */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                    Step 2 of 3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    What&apos;s your budget today?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 hover:text-stone-900 text-xs font-semibold rounded-xl border border-stone-200/80 transition-all cursor-pointer shadow-2xs shrink-0 mt-0.5 group"
                  title="Reverse to Step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700 group-hover:-rotate-45 transition-transform" />
                  <span>Reverse</span>
                </button>
              </div>

              {/* Input Box */}
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xl select-none">
                  RM
                </span>
                <input
                  id="budget-input"
                  type="number"
                  min="5"
                  max="30"
                  step="1"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full pl-14 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-3xl font-extrabold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                  placeholder="10"
                  required
                />
              </div>

              {/* Quick Pick Presets */}
              <div className="mb-6">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-stone-600">Quick pick:</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {quickPickPresets.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudget(amt)}
                      className={`py-2 text-xs rounded-xl transition-all font-bold text-center cursor-pointer ${
                        budget === amt
                          ? 'bg-amber-700 text-white shadow-sm ring-1 ring-amber-700'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      RM {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-12 px-5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-semibold rounded-2xl flex items-center justify-center gap-1.5 text-sm transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="flex-1 h-12 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-2xl shadow-sm shadow-amber-600/20 flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= PAGE 3: STEP 3 ================= */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                    Step 3 of 3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    What are you feeling today?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 hover:text-stone-900 text-xs font-semibold rounded-xl border border-stone-200/80 transition-all cursor-pointer shadow-2xs shrink-0 mt-0.5 group"
                  title="Reverse to Step 2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700 group-hover:-rotate-45 transition-transform" />
                  <span>Reverse</span>
                </button>
              </div>

              {/* Craving Options (Max 2 lines, 2-3 options per row across the system) */}
              <div className="mb-6">
                {(() => {
                  const options: { id: FoodPreference; label: string; icon: string }[] =
                    category === 'food'
                      ? [
                          { id: 'anything', label: 'Anything', icon: '🍳' },
                          { id: 'spicy', label: 'Spicy', icon: '🌶️' },
                          { id: 'soup', label: 'Soup', icon: '🍲' },
                          { id: 'rice', label: 'Rice', icon: '🍚' },
                          { id: 'noodles', label: 'Noodles', icon: '🍜' },
                          { id: 'light', label: 'Light / Clean', icon: '🥗' },
                        ]
                      : category === 'drink'
                      ? [
                          { id: 'anything', label: 'Anything', icon: '🥤' },
                          { id: 'refreshing', label: 'Refreshing', icon: '🍋' },
                          { id: 'comfort', label: 'Kopi Kaw', icon: '☕' },
                          { id: 'sweet', label: 'Milk Tea / Boba', icon: '🧋' },
                          { id: 'light', label: 'Soya / Herbal', icon: '🥛' },
                        ]
                      : [
                          { id: 'anything', label: 'Anything', icon: '🍰' },
                          { id: 'refreshing', label: 'Ice Cream', icon: '🍦' },
                          { id: 'soup', label: 'Warm Tong Sui', icon: '🥣' },
                          { id: 'sweet', label: 'Cendol / Shaved', icon: '🍧' },
                          { id: 'light', label: 'Fritter Snack', icon: '🍌' },
                        ];

                  const isFive = options.length === 5;

                  return (
                    <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                      {options.map((pref, idx) => {
                        const colSpan = isFive
                          ? idx < 3
                            ? 'col-span-2'
                            : 'col-span-3'
                          : 'col-span-2';

                        return (
                          <button
                            key={pref.id}
                            type="button"
                            onClick={() => setPreference(pref.id)}
                            className={`${colSpan} py-3 px-2 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              preference === pref.id
                                ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-600 font-bold'
                                : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                            }`}
                          >
                            <span className="text-base select-none shrink-0">{pref.icon}</span>
                            <span className="leading-tight text-center">{pref.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Natural Request option */}
              <div className="mb-6 pt-3 border-t border-stone-100 flex flex-col items-center">
                {!isAiMode ? (
                  <GlareButton
                    onClick={() => setIsAiMode(true)}
                    label="Describe in words"
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Natural Prompt</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAiMode(false)}
                        className="text-[11px] text-stone-500 hover:text-stone-700 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Tired today, want spicy noodles under RM12"
                        className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAiSubmit}
                        disabled={isAiLoading || !aiPrompt.trim()}
                        className="px-3 py-2 text-xs bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        {isAiLoading ? 'Parsing...' : 'Apply & Decide'}
                      </button>
                    </div>
                    {aiMessage && (
                      <p className="text-[11px] text-stone-600 italic">
                        {aiMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons: Back and Submit */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-12 px-5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-semibold rounded-2xl flex items-center justify-center gap-1.5 text-sm transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="flex-1 h-12 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-2xl shadow-sm shadow-amber-600/20 flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Decide for me</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
