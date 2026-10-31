import React, { useState } from 'react';
import { UserPreferences, DietaryTag } from '../types/food';
import { CAMPUSES } from '../data/campuses';
import { SUNGAI_LONG_FOOD_DATABASE } from '../data/sungaiLongFood';
import { Check, ShieldCheck, MapPin, DollarSign, Database, RotateCcw, User, LogOut, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playLoginSuccessSound } from '../utils/soundEffects';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onResetSeedHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onResetSeedHistory,
}) => {
  const { user, signOut, triggerLoginAnimation } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [resetGuidanceSuccess, setResetGuidanceSuccess] = useState(false);

  const isGuidanceEnabled = preferences.showSwipeGuidance !== false;

  const handleToggleSwipeGuidance = (enabled: boolean) => {
    onUpdatePreferences({ showSwipeGuidance: enabled });
    if (enabled) {
      try {
        localStorage.removeItem('decido_swipe_tutorial_seen');
      } catch {
        // ignore
      }
    }
  };

  const handleResetGuidance = () => {
    try {
      localStorage.removeItem('decido_swipe_tutorial_seen');
    } catch {
      // ignore
    }
    onUpdatePreferences({ showSwipeGuidance: true });
    setResetGuidanceSuccess(true);
    setTimeout(() => setResetGuidanceSuccess(false), 2500);
  };
  const dietaryOptions: { id: DietaryTag; label: string; desc: string }[] = [
    { id: 'halal', label: 'Halal Certified / Muslim Friendly', desc: 'Mamak stalls and certified food outlets' },
    { id: 'pork-free', label: 'Pork-Free', desc: 'Dishes prepared without pork ingredients' },
    { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant-based dishes and vegetarian mixed rice' },
    { id: 'beef-free', label: 'Beef-Free', desc: 'Dishes with no beef' },
  ];

  const toggleDietary = (tag: DietaryTag) => {
    const current = preferences.dietaryRestrictions || [];
    const exists = current.includes(tag);
    const updated = exists ? current.filter((t) => t !== tag) : [...current, tag];
    onUpdatePreferences({ dietaryRestrictions: updated });
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">
          Preferences & Campus
        </h2>
        <p className="text-xs text-stone-500">
          Customize your default budget, dietary needs, and campus location.
        </p>
      </div>

      {/* Account Info & Sign Out */}
      {user && (
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span>Account Session</span>
          </label>
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-extrabold text-stone-900 block truncate">{user.email}</span>
              <span className="text-[11px] text-stone-500">
                {user.isGuest ? 'Guest Student Account' : 'Signed in with email'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-rose-200/80 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Login Animation & Chime Controls */}
          <div className="mt-3.5 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-stone-500 font-medium">
              Login loading animation with chime
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => playLoginSuccessSound()}
                className="py-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Play success chime"
              >
                <Volume2 className="w-3 h-3 text-amber-600" />
                <span>Test Sound</span>
              </button>
              <button
                type="button"
                onClick={() => triggerLoginAnimation()}
                className="py-1 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-[11px] font-bold rounded-lg flex items-center gap-1 border border-amber-500/20 transition-colors cursor-pointer"
                title="Replay full login animation"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Replay Animation</span>
              </button>
            </div>
          </div>

          {/* Logout Confirmation Modal */}
          <LogoutConfirmModal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={() => void signOut()}
            user={user}
          />
        </div>
      )}

      {/* Campus Selector */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>Active Campus</span>
        </label>
        <p className="text-xs text-stone-500 mb-3">
          Version 1 focuses on UTAR Sungai Long. More campuses are structured for upcoming releases.
        </p>

        <div className="space-y-2">
          {CAMPUSES.map((c) => {
            const isSelected = preferences.campusId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                disabled={!c.isAvailable}
                onClick={() => c.isAvailable && onUpdatePreferences({ campusId: c.id })}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-semibold ring-1 ring-amber-600'
                    : c.isAvailable
                    ? 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    : 'border-stone-200/60 bg-stone-50/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{c.name}</span>
                    {!c.isAvailable && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        Phase 3
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{c.town}, {c.state}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Default Budget */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          <span>Default Budgets</span>
        </label>
        <p className="text-xs text-stone-500 mb-4">
          Pre-fills your daily decision form with your usual spending target.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="block text-xs text-stone-600 font-medium mb-1">🍚 Food</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">RM</span>
              <input
                type="number"
                min="1"
                max="50"
                value={preferences.defaultBudgetFood}
                onChange={(e) =>
                  onUpdatePreferences({ defaultBudgetFood: parseFloat(e.target.value) || 10 })
                }
                className="w-full pl-8 pr-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-600 font-medium mb-1">🥤 Drink</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">RM</span>
              <input
                type="number"
                min="1"
                max="30"
                value={preferences.defaultBudgetDrink}
                onChange={(e) =>
                  onUpdatePreferences({ defaultBudgetDrink: parseFloat(e.target.value) || 5 })
                }
                className="w-full pl-8 pr-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-600 font-medium mb-1">🍰 Dessert</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">RM</span>
              <input
                type="number"
                min="1"
                max="30"
                value={preferences.defaultBudgetDessert}
                onChange={(e) =>
                  onUpdatePreferences({ defaultBudgetDessert: parseFloat(e.target.value) || 5 })
                }
                className="w-full pl-8 pr-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Requirements */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Dietary Filters</span>
        </label>
        <p className="text-xs text-stone-500 mb-3">
          Only recommend food matching these requirements.
        </p>

        <div className="space-y-2">
          {dietaryOptions.map((opt) => {
            const isChecked = preferences.dietaryRestrictions.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleDietary(opt.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isChecked
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-medium'
                    : 'border-stone-200 bg-stone-50/40 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-stone-900">{opt.label}</span>
                  <p className="text-[11px] text-stone-500">{opt.desc}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                    isChecked
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipe Gesture Guidance (Liquid Glass Tutorial) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Swipe Gesture Guidance</span>
        </label>
        <p className="text-xs text-stone-500 mb-3.5">
          Control whether the liquid glass tutorial overlay (Swipe Left: Pass, Swipe Right: Accept) appears when deciding your meal.
        </p>

        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3">
          <div className="min-w-0 pr-1">
            <span className="text-xs font-bold text-stone-900 block">
              Show Swipe Tutorial Overlay
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5 leading-snug">
              {isGuidanceEnabled
                ? 'Enabled — guide displays for reminders with a 10s auto-dismiss countdown'
                : 'Disabled — recommendations open directly without guidance'}
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isGuidanceEnabled}
            onClick={() => handleToggleSwipeGuidance(!isGuidanceEnabled)}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0 p-0.5 ${
              isGuidanceEnabled ? 'bg-amber-600' : 'bg-stone-300'
            }`}
            title={isGuidanceEnabled ? 'Click to disable guidance' : 'Click to enable guidance'}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transform transition-transform ${
                isGuidanceEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reset / Show on Next Decision */}
        {isGuidanceEnabled && (
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-stone-500">
              Need a reminder on how to swipe?
            </span>
            <button
              type="button"
              onClick={handleResetGuidance}
              className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold rounded-xl border border-amber-200/80 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="Show guidance on next decision card"
            >
              {resetGuidanceSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span className="text-emerald-700 font-extrabold">Guide will show next!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3 h-3 text-amber-600" />
                  <span>Show on Next Decision</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* UTAR Sungai Long Database Browser */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Curated Campus Database</span>
          </label>
          <span className="text-xs text-stone-500 font-medium">
            {SUNGAI_LONG_FOOD_DATABASE.length} local items
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          Grounded in real eateries around UTAR Sungai Long (Jalan SL 1/3, SL 1/11, Mahkota Point). No AI hallucinations.
        </p>

        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {SUNGAI_LONG_FOOD_DATABASE.map((item) => (
            <div
              key={item.id}
              className="p-2 text-xs flex items-center justify-between bg-stone-50 rounded-xl"
            >
              <div className="flex items-center gap-2 truncate">
                <span>{item.emoji}</span>
                <span className="font-medium text-stone-800 truncate">{item.name}</span>
              </div>
              <span className="font-bold text-amber-700 ml-2 flex-shrink-0">
                RM {item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Seed History */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onResetSeedHistory}
          className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to default 4-day student history</span>
        </button>
      </div>
    </div>
  );
};
