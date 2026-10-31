import React, { useState } from 'react';
import { DecisionRecord } from '../types/food';
import { formatRelativeDate } from '../services/historyService';
import { Trash2, RotateCcw, Info, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryViewProps {
  history: DecisionRecord[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onResetSeed: () => void;
  onSelectAgain?: (item: DecisionRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onRemoveItem,
  onClearAll,
  onResetSeed,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Group decisions by relative day
  const grouped: { [key: string]: DecisionRecord[] } = {};
  history.forEach((record) => {
    const label = formatRelativeDate(record.decidedAt);
    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(record);
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Title & Summary */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight whitespace-nowrap">
              Decision History
            </h2>
            <button
              type="button"
              onClick={() => setShowInfo((prev) => !prev)}
              className={`p-1 rounded-full transition-all cursor-pointer shrink-0 ${
                showInfo
                  ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-300'
                  : 'text-stone-400 hover:text-amber-700 hover:bg-amber-100/70'
              }`}
              title="How history shapes your recommendations"
              aria-label="How history shapes your recommendations"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-500">
            <span className="whitespace-nowrap">
              {history.length} {history.length === 1 ? 'decision' : 'decisions'} logged
            </span>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={onResetSeed}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              title="Load sample 4-day UTAR student meals"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Sample Log</span>
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="shrink-0 pt-0.5">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
              title="Clear all logged decisions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Recency Engine Explanation Card (collapsible on clicking the info icon) */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-stone-700 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>How history shapes your recommendations</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 hover:bg-amber-100/70 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close information"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-stone-600 mb-2 leading-relaxed">
                The engine prevents repetitive meal fatigue by analyzing what you already ate:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="font-semibold text-stone-800">Eaten today</span>
                  <p className="text-stone-500 mt-0.5">Strongly avoided & excluded</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="font-semibold text-stone-800">Eaten yesterday</span>
                  <p className="text-stone-500 mt-0.5">Heavy score penalty (-50)</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="font-semibold text-stone-800">Eaten 2–3 days ago</span>
                  <p className="text-stone-500 mt-0.5">Slight recency penalty</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="font-semibold text-stone-800">Not eaten recently</span>
                  <p className="text-stone-500 mt-0.5">Boosted variety bonus (+25)</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white border border-dashed border-stone-200 rounded-3xl">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            🍚
          </div>
          <p className="text-sm font-semibold text-stone-800">No decisions logged yet</p>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Make your first decision or load sample student meals to see the recency penalty algorithm in action.
          </p>
          <button
            type="button"
            onClick={onResetSeed}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            Load Sample 4-Day History
          </button>
        </div>
      ) : (
        /* Timeline of Past Decisions */
        <div className="space-y-5">
          {Object.entries(grouped).map(([dayLabel, records]) => {
            return (
              <div key={dayLabel} className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-sm">
                {/* Clean, simplified Day Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-3">
                  <span className="font-bold text-sm text-stone-900">
                    {dayLabel}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    {records.length} {records.length === 1 ? 'meal' : 'meals'}
                  </span>
                </div>

                {/* Meals under this day */}
                <div className="divide-y divide-stone-100">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="text-2xl select-none flex-shrink-0 mt-0.5">
                          {record.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-stone-900 leading-snug break-words">
                            {record.foodItemName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-baseline gap-0.5 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900 shadow-2xs">
                              <span className="text-[10px] text-amber-700">RM</span>
                              <span>{record.price.toFixed(2)}</span>
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                record.locationName.replace(/[()]/g, ' ') + ' Bandar Sungai Long Kajang'
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-amber-800 transition-colors group/loc"
                              title="View real location on Google Maps"
                            >
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0 group-hover/loc:scale-110 transition-transform" />
                              <span className="hover:underline underline-offset-2 font-medium">
                                {record.locationName}
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(record.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-50 rounded-lg transition-colors shrink-0"
                        title="Remove from history"
                        aria-label={`Remove ${record.foodItemName} from history`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
