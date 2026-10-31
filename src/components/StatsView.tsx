/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DecisionRecord, FoodCategory } from '../types/food';
import { BarChart3, Calendar, Utensils, Coffee, IceCream, TrendingUp, RotateCcw, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AverageSpendingModal } from './AverageSpendingModal';
import { CategoryDetailModal } from './CategoryDetailModal';

interface StatsViewProps {
  history: DecisionRecord[];
  onResetSeed: () => void;
  onGoToDecide: () => void;
}

type TimeframeOption = '30days' | '7days' | 'all';

export interface CategoryData {
  category: FoodCategory;
  label: string;
  emoji: string;
  count: number;
  percentage: number;
  totalSpent: number;
  avgPrice: number;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  barGradient: string;
  icon: React.ReactNode;
}

export const StatsView: React.FC<StatsViewProps> = ({
  history,
  onResetSeed,
  onGoToDecide,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30days');
  const [activeCategory, setActiveCategory] = useState<FoodCategory | null>(null);
  const [isSpendingModalOpen, setIsSpendingModalOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<FoodCategory | null>(null);

  // Filter history by selected timeframe
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    if (timeframe === '30days') {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      return history.filter((r) => now - new Date(r.decidedAt).getTime() <= thirtyDaysMs);
    }
    if (timeframe === '7days') {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      return history.filter((r) => now - new Date(r.decidedAt).getTime() <= sevenDaysMs);
    }
    return history;
  }, [history, timeframe]);

  // Aggregate category stats
  const { categoryStats, totalDecisions, totalSpent } = useMemo(() => {
    let foodCount = 0;
    let drinkCount = 0;
    let dessertCount = 0;
    let foodSpent = 0;
    let drinkSpent = 0;
    let dessertSpent = 0;

    filteredHistory.forEach((item) => {
      const price = Number(item.price) || 0;
      if (item.category === 'drink') {
        drinkCount++;
        drinkSpent += price;
      } else if (item.category === 'dessert') {
        dessertCount++;
        dessertSpent += price;
      } else {
        foodCount++;
        foodSpent += price;
      }
    });

    const total = filteredHistory.length;
    const allSpent = foodSpent + drinkSpent + dessertSpent;

    const stats: CategoryData[] = [
      {
        category: 'food',
        label: 'Meals & Food',
        emoji: '🍚',
        count: foodCount,
        percentage: total > 0 ? Math.round((foodCount / total) * 100) : 0,
        totalSpent: foodSpent,
        avgPrice: foodCount > 0 ? foodSpent / foodCount : 0,
        colorClass: 'text-amber-800',
        bgLightClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        barGradient: 'from-amber-600 to-amber-500',
        icon: <Utensils className="w-3.5 h-3.5 text-amber-700" />,
      },
      {
        category: 'drink',
        label: 'Drinks & Beverages',
        emoji: '🧋',
        count: drinkCount,
        percentage: total > 0 ? Math.round((drinkCount / total) * 100) : 0,
        totalSpent: drinkSpent,
        avgPrice: drinkCount > 0 ? drinkSpent / drinkCount : 0,
        colorClass: 'text-sky-800',
        bgLightClass: 'bg-sky-50',
        borderClass: 'border-sky-200',
        barGradient: 'from-sky-600 to-sky-500',
        icon: <Coffee className="w-3.5 h-3.5 text-sky-700" />,
      },
      {
        category: 'dessert',
        label: 'Desserts & Sweets',
        emoji: '🍧',
        count: dessertCount,
        percentage: total > 0 ? Math.round((dessertCount / total) * 100) : 0,
        totalSpent: dessertSpent,
        avgPrice: dessertCount > 0 ? dessertSpent / dessertCount : 0,
        colorClass: 'text-rose-800',
        bgLightClass: 'bg-rose-50',
        borderClass: 'border-rose-200',
        barGradient: 'from-rose-500 to-rose-400',
        icon: <IceCream className="w-3.5 h-3.5 text-rose-700" />,
      },
    ];

    return {
      categoryStats: stats,
      totalDecisions: total,
      totalSpent: allSpent,
    };
  }, [filteredHistory]);

  const maxCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Food Stats
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[10px] tracking-wide uppercase">
              <Calendar className="w-3 h-3 text-amber-700" />
              {timeframe === '30days' ? 'Last 30 Days' : timeframe === '7days' ? 'Last 7 Days' : 'All Time'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Your meal category breakdown and habits over time
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="inline-flex p-1 bg-stone-200/70 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('30days')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              timeframe === '30days'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('7days')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              timeframe === '7days'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {totalDecisions === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200/60">
            📊
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">
            No decisions logged {timeframe === '30days' ? 'in the last 30 days' : 'in this period'}
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mb-5 leading-relaxed">
            Start deciding your meals with Decido or load sample student meals to see your category distribution.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onResetSeed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
              <span>Load Sample Log</span>
            </button>
            <button
              type="button"
              onClick={onGoToDecide}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Make Decision</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Average Per Meal Card (Click to open details popup window) */}
          <div
            onClick={() => setIsSpendingModalOpen(true)}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer select-none group"
            title="Click to view spending details and category breakdown"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Average Per Meal
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-amber-100 transition-colors">
                    <span>Tap for details</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-bold text-stone-400">RM</span>
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {(totalSpent / (totalDecisions || 1)).toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 font-medium ml-2">
                    · {totalDecisions} {totalDecisions === 1 ? 'decision' : 'decisions'} (RM {totalSpent.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Action icon badge */}
              <div className="w-9 h-9 rounded-xl bg-stone-50 group-hover:bg-amber-500 group-hover:text-white text-stone-400 border border-stone-200/60 group-hover:border-amber-500 flex items-center justify-center transition-all shrink-0 shadow-2xs">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Popup Window Dialog for Spending Details & Category Averages */}
          <AverageSpendingModal
            isOpen={isSpendingModalOpen}
            onClose={() => setIsSpendingModalOpen(false)}
            timeframeLabel={timeframe === '30days' ? 'Last 30 Days' : timeframe === '7days' ? 'Last 7 Days' : 'All Time'}
            totalDecisions={totalDecisions}
            totalSpent={totalSpent}
            avgPerMeal={totalSpent / (totalDecisions || 1)}
            foodStat={categoryStats.find((c) => c.category === 'food')}
            drinkStat={categoryStats.find((c) => c.category === 'drink')}
            dessertStat={categoryStats.find((c) => c.category === 'dessert')}
            onCategoryClick={(cat) => {
              setIsSpendingModalOpen(false);
              setSelectedCategoryDetail(cat);
            }}
          />

          {/* Interactive Category Decision Details Modal */}
          <CategoryDetailModal
            isOpen={selectedCategoryDetail !== null}
            onClose={() => setSelectedCategoryDetail(null)}
            category={selectedCategoryDetail || 'food'}
            allHistory={history}
            timeframeFilter={timeframe}
          />

          {/* Main Bar Chart Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-700" />
                  <span>Category Distribution ({timeframe === '30days' ? 'Last 30 Days' : timeframe === '7days' ? 'Last 7 Days' : 'All Time'})</span>
                </h3>
                <span className="text-[11px] text-stone-500">
                  Comparison by frequency of chosen food category
                </span>
              </div>
            </div>

            {/* Vertical Bar Chart Graphic */}
            <div className="pt-6 pb-2 px-2">
              <div className="h-48 flex items-end justify-around gap-4 sm:gap-8 border-b border-stone-200 pb-2 relative">
                {/* Horizontal reference guide gridlines */}
                <div className="absolute inset-x-0 top-0 border-b border-dashed border-stone-100 pointer-events-none" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-stone-100 pointer-events-none" />

                {categoryStats.map((item) => {
                  const heightPercent = maxCount > 0 ? Math.max((item.count / maxCount) * 100, 6) : 6;
                  const isSelected = activeCategory === item.category;

                  return (
                    <div
                      key={item.category}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer max-w-[90px]"
                      onClick={() => setActiveCategory(isSelected ? null : item.category)}
                    >
                      {/* Top label value on hover or static */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-1.5 flex flex-col items-center"
                      >
                        <span className="text-xs font-black text-stone-900">
                          {item.count}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400">
                          {item.percentage}%
                        </span>
                      </motion.div>

                      {/* Bar Pillar */}
                      <div className="w-full h-28 sm:h-32 bg-stone-100/90 rounded-t-xl overflow-hidden relative flex items-end shadow-inner">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`w-full rounded-t-xl bg-gradient-to-t ${item.barGradient} transition-all duration-200 ${
                            isSelected ? 'ring-2 ring-amber-500 shadow-md brightness-105' : 'group-hover:opacity-95'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

                {/* X-Axis Labels below the border line */}
                <div className="flex items-center justify-around gap-4 sm:gap-8 pt-3">
                  {categoryStats.map((item) => (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() => setActiveCategory(activeCategory === item.category ? null : item.category)}
                      className={`flex-1 text-center transition-transform hover:scale-105 cursor-pointer max-w-[90px] ${
                        activeCategory === item.category ? 'font-bold text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      <div className="text-lg leading-none mb-1">{item.emoji}</div>
                      <span className="text-xs font-semibold capitalize block truncate">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
            </div>

            {/* Selected category quick breakdown or general note */}
            {activeCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center justify-between gap-3"
              >
                {(() => {
                  const sel = categoryStats.find((c) => c.category === activeCategory);
                  if (!sel) return null;
                  return (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{sel.emoji}</span>
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 block truncate">{sel.label}</span>
                          <span className="text-stone-500 text-[11px] block truncate">
                            {sel.count} of {totalDecisions} orders ({sel.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className="text-stone-900 font-bold block">RM {sel.totalSpent.toFixed(2)}</span>
                          <span className="text-[10px] text-stone-500">avg RM {sel.avgPrice.toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryDetail(sel.category)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                          title={`Check ${sel.label} decision details`}
                        >
                          <span>Details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>

          {/* Interactive Category Details Breakdown List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Category Breakdown
              </h3>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Tap category to view decisions
              </span>
            </div>

            {categoryStats.map((item) => (
              <div
                key={item.category}
                onClick={() => setSelectedCategoryDetail(item.category)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCategoryDetail(item.category);
                  }
                }}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 hover:border-amber-400 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer select-none group flex flex-col gap-2"
                title={`Click to check ${item.label} decisions details, prices, dates & filters`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl ${item.bgLightClass} ${item.borderClass} border flex items-center justify-center text-sm font-bold shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                      {item.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400">
                          ({item.count} {item.count === 1 ? 'choice' : 'choices'})
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="text-[10px] text-stone-500">
                        Total RM {item.totalSpent.toFixed(2)} · Avg RM {item.avgPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-stone-900">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.barGradient} transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Decision recency insight tip */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="font-semibold">Recency Tip:</strong> Decido uses this distribution to balance your meals so you don't repeat the same food category or stall too many days in a row!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
