/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Utensils,
  Coffee,
  IceCream,
  ChevronDown,
} from 'lucide-react';
import { DecisionRecord, FoodCategory } from '../types/food';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: FoodCategory;
  allHistory: DecisionRecord[];
  timeframeFilter?: '30days' | '7days' | 'all';
}

type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';
type PriceFilterOption = 'all' | 'under-8' | '8-15' | 'above-15';
type TimeframeFilterOption = 'all' | '30days' | '7days' | 'today';

const CATEGORY_CONFIG: Record<
  FoodCategory,
  {
    label: string;
    emoji: string;
    themeColor: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    icon: React.ReactNode;
  }
> = {
  food: {
    label: 'Meals & Food',
    emoji: '🍚',
    themeColor: 'amber',
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-800',
    borderBadge: 'border-amber-200',
    icon: <Utensils className="w-4 h-4 text-amber-700" />,
  },
  drink: {
    label: 'Drinks & Beverages',
    emoji: '🧋',
    themeColor: 'sky',
    bgBadge: 'bg-sky-50',
    textBadge: 'text-sky-800',
    borderBadge: 'border-sky-200',
    icon: <Coffee className="w-4 h-4 text-sky-700" />,
  },
  dessert: {
    label: 'Desserts & Sweets',
    emoji: '🍰',
    themeColor: 'rose',
    bgBadge: 'bg-rose-50',
    textBadge: 'text-rose-800',
    borderBadge: 'border-rose-200',
    icon: <IceCream className="w-4 h-4 text-rose-700" />,
  },
};

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  allHistory,
  timeframeFilter = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [priceFilter, setPriceFilter] = useState<PriceFilterOption>('all');
  const [timeframe, setTimeframe] = useState<TimeframeFilterOption>(
    timeframeFilter === '30days' ? '30days' : timeframeFilter === '7days' ? '7days' : 'all'
  );
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(new Set());

  const toggleRecordExpand = (recordId: string) => {
    setExpandedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  // Keyboard shortcut for escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Total un-filtered category stats for baseline reference
  const baseCategoryItems = useMemo(() => {
    return allHistory.filter((item) => item.category === category);
  }, [allHistory, category]);

  const baseTotalSpent = useMemo(() => {
    return baseCategoryItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  }, [baseCategoryItems]);

  const baseAvgPrice = useMemo(() => {
    return baseCategoryItems.length > 0 ? baseTotalSpent / baseCategoryItems.length : 0;
  }, [baseCategoryItems, baseTotalSpent]);

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    const now = Date.now();
    let records = allHistory.filter((item) => item.category === category);

    // 1. Timeframe filter
    if (timeframe === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      records = records.filter((r) => new Date(r.decidedAt).getTime() >= startOfDay.getTime());
    } else if (timeframe === '7days') {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      records = records.filter((r) => now - new Date(r.decidedAt).getTime() <= sevenDaysMs);
    } else if (timeframe === '30days') {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      records = records.filter((r) => now - new Date(r.decidedAt).getTime() <= thirtyDaysMs);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.foodItemName.toLowerCase().includes(q) ||
          r.locationName.toLowerCase().includes(q) ||
          (r.reason && r.reason.toLowerCase().includes(q))
      );
    }

    // 3. Price filter
    if (priceFilter === 'under-8') {
      records = records.filter((r) => r.price < 8);
    } else if (priceFilter === '8-15') {
      records = records.filter((r) => r.price >= 8 && r.price <= 15);
    } else if (priceFilter === 'above-15') {
      records = records.filter((r) => r.price > 15);
    }

    // 4. Sorting
    records = [...records].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.decidedAt).getTime() - new Date(b.decidedAt).getTime();
      }
      if (sortBy === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'price-asc') {
        return (a.price || 0) - (b.price || 0);
      }
      return 0;
    });

    return records;
  }, [allHistory, category, timeframe, searchQuery, priceFilter, sortBy]);

  // Filtered stats summary
  const filteredTotalSpent = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  }, [filteredRecords]);

  const filteredAvgPrice = useMemo(() => {
    return filteredRecords.length > 0 ? filteredTotalSpent / filteredRecords.length : 0;
  }, [filteredRecords, filteredTotalSpent]);

  const hasActiveFilters = searchQuery.trim() !== '' || priceFilter !== 'all' || timeframe !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setTimeframe('all');
    setSortBy('date-desc');
  };

  const currentConfig = CATEGORY_CONFIG[category];

  const formatDecisionDateTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const calendarDate = date.toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const timeStr = date.toLocaleTimeString('en-MY', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      return {
        calendarDate,
        timeStr,
      };
    } catch {
      return {
        calendarDate: 'Past date',
        timeStr: '',
      };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-detail-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200/90 overflow-hidden max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between gap-3 bg-stone-50/60">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl ${currentConfig.bgBadge} ${currentConfig.borderBadge} border flex items-center justify-center text-2xl shrink-0 shadow-2xs`}
              >
                {currentConfig.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    id="category-detail-modal-title"
                    className="text-base sm:text-lg font-bold text-stone-900 tracking-tight"
                  >
                    {currentConfig.label}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentConfig.bgBadge} ${currentConfig.textBadge} border ${currentConfig.borderBadge}`}
                  >
                    Details
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                  {baseCategoryItems.length} {baseCategoryItems.length === 1 ? 'decision logged' : 'decisions logged'} · RM{' '}
                  {baseTotalSpent.toFixed(2)} total
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar for Selected Category */}
          <div className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-stone-50 to-amber-50/20 border-b border-stone-100 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Decisions</span>
              <span className="text-sm font-black text-stone-900">{filteredRecords.length}</span>
              {hasActiveFilters && filteredRecords.length !== baseCategoryItems.length && (
                <span className="text-[9px] text-stone-400 block">of {baseCategoryItems.length}</span>
              )}
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Spent</span>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-[10px] font-bold text-stone-400">RM</span>
                <span className="text-sm font-black text-stone-900">{filteredTotalSpent.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Average Price</span>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-[10px] font-bold text-amber-600">RM</span>
                <span className="text-sm font-black text-amber-900">{filteredAvgPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar Controls */}
          <div className="px-4 sm:px-5 py-3 border-b border-stone-100 bg-white space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${currentConfig.label.toLowerCase()} or stalls...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills row: Timeframe, Price & Sort */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              {/* Timeframe pill selector */}
              <div className="inline-flex items-center bg-stone-100 p-0.5 rounded-lg shrink-0">
                <span className="px-1.5 text-[10px] font-bold text-stone-400 uppercase">Time:</span>
                {(['all', '30days', '7days', 'today'] as TimeframeFilterOption[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 text-[11px] rounded-md font-semibold transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {tf === 'all' ? 'All' : tf === '30days' ? '30d' : tf === '7days' ? '7d' : 'Today'}
                  </button>
                ))}
              </div>

              {/* Price Filter Pill */}
              <div className="relative shrink-0">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as PriceFilterOption)}
                  className="appearance-none bg-stone-100 hover:bg-stone-200/70 border border-stone-200/60 rounded-lg px-2.5 py-1 pr-6 text-[11px] font-semibold text-stone-700 cursor-pointer outline-hidden"
                >
                  <option value="all">Price: All</option>
                  <option value="under-8">&lt; RM 8 (Budget)</option>
                  <option value="8-15">RM 8 - RM 15</option>
                  <option value="above-15">&gt; RM 15</option>
                </select>
                <Filter className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Order Selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-stone-100 hover:bg-stone-200/70 border border-stone-200/60 rounded-lg px-2.5 py-1 pr-6 text-[11px] font-semibold text-stone-700 cursor-pointer outline-hidden"
                >
                  <option value="date-desc">Newest Date</option>
                  <option value="date-asc">Oldest Date</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset active filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 px-2 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Decisions List Section */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-2.5">
            {filteredRecords.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-stone-500 pb-1 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Click an item to view date, time & location
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allExp = filteredRecords.every((r) => expandedRecordIds.has(r.id));
                    if (allExp) {
                      setExpandedRecordIds(new Set());
                    } else {
                      setExpandedRecordIds(new Set(filteredRecords.map((r) => r.id)));
                    }
                  }}
                  className="text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline underline-offset-2 decoration-amber-300 transition-colors"
                >
                  {filteredRecords.every((r) => expandedRecordIds.has(r.id))
                    ? 'Collapse All'
                    : 'Expand All'}
                </button>
              </div>
            )}
            {filteredRecords.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3 text-xl">
                  {hasActiveFilters ? '🔍' : currentConfig.emoji}
                </div>
                <h4 className="text-sm font-bold text-stone-800 mb-1">
                  {hasActiveFilters
                    ? `No ${currentConfig.label.toLowerCase()} match your filters`
                    : `No ${currentConfig.label.toLowerCase()} decisions recorded`}
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mb-4">
                  {hasActiveFilters
                    ? 'Try clearing the search query or adjusting the price/timeframe filters.'
                    : `Decide a ${currentConfig.label.toLowerCase()} recommendation to start logging decisions.`}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            ) : (
              filteredRecords.map((record) => {
                const dateTime = formatDecisionDateTime(record.decidedAt);
                const isExpanded = expandedRecordIds.has(record.id);

                return (
                  <div
                    key={record.id}
                    className={`bg-white border rounded-2xl transition-all shadow-2xs ${
                      isExpanded
                        ? 'border-amber-400 ring-1 ring-amber-400/30 shadow-sm'
                        : 'border-stone-200/90 hover:border-amber-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Clickable Card Header / Row */}
                    <button
                      type="button"
                      onClick={() => toggleRecordExpand(record.id)}
                      className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer group rounded-2xl transition-colors hover:bg-stone-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 rounded-2xl ${currentConfig.bgBadge} ${currentConfig.borderBadge} border flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}
                        >
                          {record.emoji || currentConfig.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug break-words">
                            {record.foodItemName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-stone-400">
                              {currentConfig.label}
                            </span>
                            <span className="text-[10px] text-amber-600/90 font-medium">
                              {isExpanded ? '• Tap to hide' : '• Tap for details'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Price badge + expand chevron indicator */}
                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        <div className="inline-flex items-baseline gap-1 bg-amber-50/90 border border-amber-200/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-2xs">
                          <span className="text-[10px] font-bold text-amber-700">RM</span>
                          <span className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                            {record.price.toFixed(2)}
                          </span>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isExpanded
                              ? 'bg-amber-100 text-amber-800 rotate-180'
                              : 'bg-stone-100 text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-700'
                          }`}
                          aria-hidden="true"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details Section: Date, Time, Location & Note */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 border-t border-stone-100 flex flex-col gap-2.5">
                            {/* Structured Details Box: Date, Time & Location */}
                            <div className="bg-stone-50/90 rounded-xl p-3 border border-stone-100 flex flex-col gap-2.5 mt-1">
                              {/* Date & Time Row */}
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-md bg-white border border-stone-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
                                    Date:
                                  </span>
                                  <span className="font-bold text-stone-900 text-xs">
                                    {dateTime.calendarDate}
                                  </span>
                                </div>

                                {dateTime.timeStr && (
                                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-white border border-stone-200/70 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    <span>{dateTime.timeStr}</span>
                                  </div>
                                )}
                              </div>

                              {/* Location Row */}
                              <div className="pt-2 border-t border-stone-200/60 flex items-start gap-2 text-xs">
                                <div className="w-5 h-5 rounded-md bg-white border border-stone-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                                    Location:
                                  </span>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      record.locationName.replace(/[()]/g, ' ') + ' Bandar Sungai Long Kajang'
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-800 font-semibold hover:text-amber-700 hover:underline underline-offset-2 transition-colors block break-words leading-relaxed group/map"
                                    title="View stall on Google Maps"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span>{record.locationName}</span>
                                    <span className="inline-flex items-center ml-1.5 text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200 group-hover/map:bg-amber-200/70 transition-colors">
                                      Maps ↗
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Note / Reason Row (if recorded) */}
                            {record.reason && (
                              <div className="flex items-start gap-2 text-xs text-stone-600 bg-amber-50/40 border border-amber-100/80 rounded-xl px-3 py-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  Note
                                </span>
                                <p className="italic text-stone-600 text-xs leading-relaxed flex-1 break-words">
                                  "{record.reason}"
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500 font-medium">
              Showing <strong className="text-stone-800">{filteredRecords.length}</strong> of{' '}
              <strong className="text-stone-800">{baseCategoryItems.length}</strong> {currentConfig.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 bg-stone-200/80 hover:bg-stone-300 active:bg-stone-400 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

