/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FoodCategory,
  FoodPreference,
  FoodItem,
  RecommendationResult,
  DecisionRecord,
  UserPreferences,
} from './types/food';
import { Header } from './components/Header';
import { DecideFlow } from './components/DecideFlow';
import { RecommendationCard } from './components/RecommendationCard';
import { AcceptedTicketView } from './components/AcceptedTicketView';
import { HistoryView } from './components/HistoryView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { CAMPUSES } from './data/campuses';
import { getRecommendation } from './services/recommendationEngine';
import {
  getHistory,
  saveDecision,
  removeDecision,
  clearAllHistory,
  resetToSeedHistory,
  subscribeToUserDecisions,
} from './services/historyService';
import { getPreferences, savePreferences } from './services/preferencesService';
import { CheckCircle2 } from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { LoginLoadingScreen } from './components/LoginLoadingScreen';

function MainApp() {
  const { user, loading, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'decide' | 'history' | 'stats' | 'settings'>('decide');
  const [viewState, setViewState] = useState<'form' | 'result' | 'accepted'>('form');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Preferences & History
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => getPreferences());
  const [history, setHistoryState] = useState<DecisionRecord[]>(() => getHistory());

  // Real-time sync with Firestore for authenticated user
  useEffect(() => {
    if (user && !user.isGuest) {
      const unsubscribe = subscribeToUserDecisions(user.uid, (firestoreRecords) => {
        if (firestoreRecords && firestoreRecords.length > 0) {
          setHistoryState(firestoreRecords);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Active Decision Session State
  const [currentCategory, setCurrentCategory] = useState<FoodCategory>('food');
  const [currentBudget, setCurrentBudget] = useState<number>(10);
  const [currentPreference, setCurrentPreference] = useState<FoodPreference>('anything');
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<RecommendationResult | null>(null);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [decisionTryId, setDecisionTryId] = useState<number>(0);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Find active campus
  const activeCampus = CAMPUSES.find((c) => c.id === preferences.campusId) || CAMPUSES[0];

  // Handle deciding from the form
  const handleDecide = (
    category: FoodCategory,
    budget: number,
    preference: FoodPreference,
    _naturalNote?: string
  ) => {
    setCurrentCategory(category);
    setCurrentBudget(budget);
    setCurrentPreference(preference);
    setExcludedIds([]);
    setIsAccepted(false);

    const result = getRecommendation({
      category,
      budget,
      preference,
      campusId: preferences.campusId,
      excludeItemIds: [],
    });

    if (result) {
      setCurrentResult(result);
      setViewState('result');
      setExcludedIds([result.item.id]);
      setDecisionTryId((prev) => prev + 1);
    } else {
      showToast('No meals found matching criteria. Try adjusting budget or restrictions.');
    }
  };

  // Handle "Try another option"
  const handleTryAnother = () => {
    if (!currentResult) return;

    setIsAccepted(false);
    const nextResult = getRecommendation({
      category: currentCategory,
      budget: currentBudget,
      preference: currentPreference,
      campusId: preferences.campusId,
      excludeItemIds: excludedIds,
    });

    if (nextResult) {
      setCurrentResult(nextResult);
      setExcludedIds((prev) => [...prev, nextResult.item.id]);
    } else {
      // Loop over: clear exclusions and try fresh
      setExcludedIds([]);
      const freshResult = getRecommendation({
        category: currentCategory,
        budget: currentBudget,
        preference: currentPreference,
        campusId: preferences.campusId,
        excludeItemIds: [],
      });
      if (freshResult) {
        setCurrentResult(freshResult);
        setExcludedIds([freshResult.item.id]);
        showToast('Cycled through all options. Showing top recommendation again!');
      }
    }
  };

  // Handle accepting recommendation ("I'll eat this today!")
  const handleAccept = (item: FoodItem, reason: string) => {
    saveDecision(item, reason);
    setHistoryState(getHistory());
    setIsAccepted(true);
    setViewState('accepted');
    showToast(`Saved to history! We'll avoid repeating "${item.name}" today.`);
  };

  // Handle back to edit form
  const handleBackToEdit = () => {
    setViewState('form');
    setIsAccepted(false);
  };

  // History handlers
  const handleRemoveHistoryItem = (id: string) => {
    const updated = removeDecision(id);
    setHistoryState(updated);
    showToast('Decision removed from history.');
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistoryState([]);
    showToast('History cleared.');
  };

  const handleResetSeed = () => {
    const seeded = resetToSeedHistory();
    setHistoryState(seeded);
    showToast('Sample 4-day student history loaded.');
  };

  // Preferences handler
  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    const updated = savePreferences(updates);
    setPreferencesState(updated);
    showToast('Preferences updated.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/60 to-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl shadow-sm animate-pulse">
            🍜
          </div>
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-stone-600">Loading student session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (justLoggedIn) {
    return <LoginLoadingScreen user={user} onComplete={clearJustLoggedIn} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-stone-800">
      {/* Google Maps Quota Banner (Case A requirement) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'decide') {
            // Stay in current viewState if already decided
          }
        }}
        campusName={activeCampus.shortCode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-3.5 sm:py-5 pb-24 sm:pb-8">
        {/* Toast alert */}
        {toastMessage && (
          <div className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-stone-900 text-stone-100 text-xs font-semibold rounded-2xl shadow-lg shadow-stone-900/20 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Decide Assistant */}
        {activeTab === 'decide' && (
          <div>
            {viewState === 'form' ? (
              <DecideFlow
                onDecide={handleDecide}
                defaultBudgets={{
                  food: preferences.defaultBudgetFood,
                  drink: preferences.defaultBudgetDrink,
                  dessert: preferences.defaultBudgetDessert,
                }}
              />
            ) : viewState === 'accepted' && currentResult ? (
              <AcceptedTicketView
                item={currentResult.item}
                budget={currentBudget}
                onDecideAnother={handleBackToEdit}
                onViewHistory={() => setActiveTab('history')}
              />
            ) : currentResult ? (
              <RecommendationCard
                result={currentResult}
                budget={currentBudget}
                onAccept={handleAccept}
                onTryAnother={handleTryAnother}
                onBackToEdit={handleBackToEdit}
                isAccepted={isAccepted}
                trySessionId={decisionTryId}
                showSwipeGuidance={preferences.showSwipeGuidance !== false}
              />
            ) : (
              <div className="text-center py-12">
                <button
                  type="button"
                  onClick={handleBackToEdit}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Start Decision
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Decision History */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onRemoveItem={handleRemoveHistoryItem}
            onClearAll={handleClearHistory}
            onResetSeed={handleResetSeed}
          />
        )}

        {/* Tab 3: Stats & Distribution */}
        {activeTab === 'stats' && (
          <StatsView
            history={history}
            onResetSeed={handleResetSeed}
            onGoToDecide={() => setActiveTab('decide')}
          />
        )}

        {/* Tab 4: Settings & Campus */}
        {activeTab === 'settings' && (
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onResetSeedHistory={handleResetSeed}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      libraries={['places', 'marker', 'geometry', 'core']}
    >
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </APIProvider>
  );
}
