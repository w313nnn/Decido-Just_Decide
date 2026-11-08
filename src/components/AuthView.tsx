import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatedPanel } from './AnimatedPanel';
export function AuthView() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function submit(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not sign in. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><AnimatedPanel className="auth-content">
    <img className="brand-logo" src="/brand/decido-logo.png" alt="Decido" data-reveal />
    <div className="page-intro" data-reveal><p className="eyebrow">For UTAR Sungai Long</p><h1>Let’s pick your next bite.</h1>
      <p>Set a budget and tell us what you feel like. We’ll help you choose.</p></div>
    <div className="surface" data-reveal>
      <button className="primary full" disabled={busy} onClick={signInAsGuest}>Try Decido as a guest</button>
      <p className="small muted">No account needed. Guest history stays in this browser.</p>
      <details className="account-details"><summary>Sign in to sync your history</summary>
        <div className="segmented"><button disabled={busy} aria-pressed={mode === 'signin'} onClick={() => {setMode('signin');setMessage('');}}>Sign in</button>
          <button disabled={busy} aria-pressed={mode === 'signup'} onClick={() => {setMode('signup');setMessage('');}}>Create account</button></div>
        <form onSubmit={e => {e.preventDefault(); void submit(() => mode === 'signin' ? signInWithEmail(email.trim(), password) : signUpWithEmail(email.trim(), password));}}>
          <label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} />
          <label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} aria-describedby="password-help" />
          <p id="password-help" className="small muted">Use at least 6 characters.</p>
          <button className="primary full" disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button className="secondary full" disabled={busy} onClick={() => void submit(signInWithGoogle)}>Continue with Google</button>
      </details>
      {(message || error) && <p className="notice" role="alert">{message || error}</p>}
    </div>
    <AnimatedPanel scroll className="how-it-works"><h2 data-reveal>A few choices, then you’re ready</h2>
      <ol>{['Choose food, a drink or dessert.', 'Set the most you want to spend.', 'Pick a craving and see a suggestion.'].map(t => <li data-reveal key={t}>{t}</li>)}</ol>
    </AnimatedPanel>
    <p className="small muted" data-reveal>Decido is a student prototype. Local listings and prices still need checking.</p>
  </AnimatedPanel></main>;
}
