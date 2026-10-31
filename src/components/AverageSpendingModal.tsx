/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, ChevronRight } from 'lucide-react';
import { CategoryData } from './StatsView';
import { FoodCategory } from '../types/food';

interface AverageSpendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeframeLabel: string;
  totalDecisions: number;
  totalSpent: number;
  avgPerMeal: number;
  foodStat?: CategoryData;
  drinkStat?: CategoryData;
  dessertStat?: CategoryData;
  onCategoryClick?: (category: FoodCategory) => void;
}

export const AverageSpendingModal: React.FC<AverageSpendingModalProps> = ({
  isOpen,
  onClose,
  timeframeLabel,
  totalDecisions,
  totalSpent,
  avgPerMeal,
  foodStat,
  drinkStat,
  dessertStat,
  onCategoryClick,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="avg-spending-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200/90 p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 mb-4 pr-8">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 id="avg-spending-modal-title" className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Average Per Meal Details
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {timeframeLabel} Spending Breakdown
              </p>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto space-y-4 pr-0.5 flex-1">
            {/* Hero Average Box */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-500/10 border border-amber-200/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider block">
                Overall Average Per Meal
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-sm font-extrabold text-amber-700">RM</span>
                <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  {avgPerMeal.toFixed(2)}
                </span>
              </div>
              <span className="text-xs text-stone-500 font-medium mt-1 block">
                Calculated from {totalDecisions} {totalDecisions === 1 ? 'meal' : 'meals'} totalling RM {totalSpent.toFixed(2)}
              </span>
            </div>

            {/* Overall Totals Section */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Overall Totals
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5">
                  <span className="text-xs font-semibold text-stone-500 block">Total Decisions</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-stone-900">{totalDecisions}</span>
                    <span className="text-xs text-stone-400 font-medium">items</span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5">
                  <span className="text-xs font-semibold text-stone-500 block">Total Spent</span>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xs font-bold text-stone-400">RM</span>
                    <span className="text-2xl font-black text-stone-900">{totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Spending by Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Average Spending by Category
                </span>
                {onCategoryClick && (
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Tap to view decisions
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {/* Food / Meals */}
                <div
                  onClick={() => onCategoryClick?.('food')}
                  className={`bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all ${
                    onCategoryClick
                      ? 'hover:border-amber-400 hover:shadow-xs hover:bg-amber-50 cursor-pointer group'
                      : ''
                  }`}
                  role={onCategoryClick ? 'button' : undefined}
                  tabIndex={onCategoryClick ? 0 : undefined}
                  title={onCategoryClick ? 'Click to view Meals & Food decisions' : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      🍚
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          Meals & Food
                        </span>
                        {onCategoryClick && (
                          <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {foodStat?.count || 0} {foodStat?.count === 1 ? 'item' : 'items'} · RM {(foodStat?.totalSpent || 0).toFixed(2)} total
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">Average</span>
                    <span className="text-base font-black text-amber-900">
                      RM {(foodStat?.avgPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Drinks */}
                <div
                  onClick={() => onCategoryClick?.('drink')}
                  className={`bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all ${
                    onCategoryClick
                      ? 'hover:border-sky-400 hover:shadow-xs hover:bg-sky-50 cursor-pointer group'
                      : ''
                  }`}
                  role={onCategoryClick ? 'button' : undefined}
                  tabIndex={onCategoryClick ? 0 : undefined}
                  title={onCategoryClick ? 'Click to view Drinks & Beverages decisions' : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      🧋
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          Drinks & Beverages
                        </span>
                        {onCategoryClick && (
                          <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {drinkStat?.count || 0} {drinkStat?.count === 1 ? 'item' : 'items'} · RM {(drinkStat?.totalSpent || 0).toFixed(2)} total
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">Average</span>
                    <span className="text-base font-black text-sky-900">
                      RM {(drinkStat?.avgPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Desserts */}
                <div
                  onClick={() => onCategoryClick?.('dessert')}
                  className={`bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all ${
                    onCategoryClick
                      ? 'hover:border-rose-400 hover:shadow-xs hover:bg-rose-50 cursor-pointer group'
                      : ''
                  }`}
                  role={onCategoryClick ? 'button' : undefined}
                  tabIndex={onCategoryClick ? 0 : undefined}
                  title={onCategoryClick ? 'Click to view Desserts & Sweets decisions' : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      🍰
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          Desserts & Sweets
                        </span>
                        {onCategoryClick && (
                          <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-rose-700 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {dessertStat?.count || 0} {dessertStat?.count === 1 ? 'item' : 'items'} · RM {(dessertStat?.totalSpent || 0).toFixed(2)} total
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">Average</span>
                    <span className="text-base font-black text-rose-900">
                      RM {(dessertStat?.avgPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer text-center"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
