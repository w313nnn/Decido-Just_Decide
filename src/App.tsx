import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Header, AppTab } from './components/Header';
import { DecideFlow } from './components/DecideFlow';
import { RecommendationCard } from './components/RecommendationCard';
import { AcceptedTicketView } from './components/AcceptedTicketView';
import { HistoryView } from './components/HistoryView';
import { FoodCategory, FoodPreference, RecommendationResult } from './types/food';
import { getRecommendation } from './services/recommendationEngine';
import { getHistory, saveDecision, removeDecision, clearAllHistory, subscribeToUserDecisions } from './services/historyService';
import { getPreferences, savePreferences } from './services/preferencesService';
import { useMobileViewport } from './hooks/useMobileViewport';
const StatsView = React.lazy(() => import('./components/StatsView').then(module => ({default:module.StatsView})));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(module => ({default:module.SettingsView})));
const MapProvider = React.lazy(() => import('./components/MapProvider'));

function SessionApp() {
  const { user } = useAuth();
  const [tab, setTab] = useState<AppTab>('decide');
  const [view, setView] = useState<'form' | 'result' | 'saved'>('form');
  const [preferences, setPreferences] = useState(getPreferences);
  const [history, setHistory] = useState(getHistory);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [request, setRequest] = useState({ category: 'food' as FoodCategory, budget: 10, preference: 'anything' as FoodPreference });
  const [excluded, setExcluded] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [storageMessage, setStorageMessage] = useState('');
  const [ready, setReady] = useState(Boolean(user?.isGuest));
  const [syncFailed, setSyncFailed] = useState(false);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const saveLock = useRef(false);
  const title = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!user || user.isGuest) return;
    setSyncFailed(false); setReady(false);
    return subscribeToUserDecisions(user.uid, records => { setHistory(records);setReady(true);setSyncFailed(false);setSyncMessage(''); });
  }, [user?.uid, syncAttempt]);
  useEffect(() => {
    const sync = () => {setSyncMessage('Your history could not sync. Check your connection and retry.');setSyncFailed(true);};
    const storage = () => setStorageMessage('Browser storage is unavailable. Changes will only last until you close this page.');
    window.addEventListener('decido-sync-error', sync);
    window.addEventListener('decido-storage-warning', storage);
    return () => {window.removeEventListener('decido-sync-error', sync);window.removeEventListener('decido-storage-warning', storage);};
  }, []);
  useEffect(() => { title.current?.focus({preventScroll:true}); window.scrollTo(0,0); }, [tab]);
  function decide(category: FoodCategory, budget: number, preference: FoodPreference) {
    const next = {category,budget,preference};
    const pick = getRecommendation({...next,campusId:preferences.campusId});
    setRequest(next);setMessage('');saveLock.current=false;
    if (!pick) {setMessage('No options fit this budget and your dietary settings. Try a different category or budget, or review your settings.');return;}
    setResult(pick);setExcluded([pick.item.id]);setView('result');
  }
  function another() {
    const pick=getRecommendation({...request,campusId:preferences.campusId,excludeItemIds:excluded});
    if (!pick) {setMessage('You’ve seen all the options that fit. Change your choices to look again.');return;}
    setResult(pick);setExcluded(ids=>[...ids,pick.item.id]);
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Header activeTab={tab} setActiveTab={setTab} campusName="UTAR Sungai Long" />
    <main id="main-content" ref={title} tabIndex={-1} className="app-main">
      {storageMessage && <p role="status" className="notice">{storageMessage}</p>}
      {syncMessage && <div role="status" className="notice">{syncMessage} <button className="text-button" onClick={() => setSyncAttempt(n=>n+1)}>Retry sync</button></div>}
      <div role="status" aria-live="polite">{message && <p className="notice">{message}</p>}</div>
      {!ready && !user?.isGuest ? <section className="surface"><h1>{syncFailed ? 'Could not load your history' : 'Loading your history…'}</h1><p className="muted">{syncFailed ? 'Check your connection, then choose Retry sync above.' : 'Please wait while we get your saved choices.'}</p></section> : <>
      {tab==='decide' && (view==='form' ? <DecideFlow initialSelection={result ? request : undefined} onDecide={decide} defaultBudgets={{food:preferences.defaultBudgetFood,drink:preferences.defaultBudgetDrink,dessert:preferences.defaultBudgetDessert}} /> : result && (view==='saved' ?
        <AcceptedTicketView item={result.item} budget={request.budget} onDecideAnother={()=>{setView('form');setMessage('');}} onViewHistory={()=>setTab('history')} /> :
        <RecommendationCard result={result} budget={request.budget} onTryAnother={another} onBackToEdit={()=>{setView('form');setMessage('');}} isAccepted={false} onAccept={(item, reason)=>{
          if(saveLock.current) return;saveLock.current=true;
          saveDecision(item,reason);setHistory(getHistory());setView('saved');setMessage('');
        }} />))}
      {tab==='history' && <HistoryView history={history} onRemoveItem={id=>setHistory(removeDecision(id))} onClearAll={async()=>{await clearAllHistory();setHistory(getHistory());}} onResetSeed={()=>{}} />}
      <React.Suspense fallback={<p role="status">Loading…</p>}>
      {tab==='stats' && <StatsView history={history} onGoToDecide={()=>setTab('decide')} onResetSeed={()=>{}} />}
      {tab==='settings' && <SettingsView preferences={preferences} onUpdatePreferences={updates=>{
        setPreferences(savePreferences(updates));setResult(null);setView('form');setExcluded([]);
      }} onResetSeedHistory={()=>{}} />}
      </React.Suspense>
      </>}
    </main>
    <footer className="app-footer">Made for the “what should we eat?” moments.</footer>
  </div>;
}
function AuthenticatedApp() {
  const {user,loading}=useAuth();
  if(loading) return <main className="auth-page" role="status">Loading Decido…</main>;
  return user ? <SessionApp key={user.uid} /> : <AuthView />;
}
export default function App() {
  useMobileViewport();
  const content=<AuthProvider><AuthenticatedApp /></AuthProvider>;
  const mapsKey=import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return mapsKey ? <React.Suspense fallback={<main className="auth-page" role="status">Loading Decido…</main>}><MapProvider apiKey={mapsKey}>{content}</MapProvider></React.Suspense> : content;
}
