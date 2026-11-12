import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setStorageOwner } from '../services/storage';
export interface AppUser { uid: string; email: string; displayName?: string; isGuest?: boolean; }
interface AuthContextType {
  user: AppUser | null; loading: boolean; justLoggedIn: boolean;
  clearJustLoggedIn: () => void; triggerLoginAnimation: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>; signInAsGuest: () => void;
  signOut: () => Promise<void>; error: string | null; clearError: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential': case 'auth/user-not-found': case 'auth/wrong-password':
      return 'The email or password does not match. Please try again.';
    case 'auth/email-already-in-use': return 'This email already has an account. Sign in instead.';
    case 'auth/weak-password': return 'Use a password with at least 6 characters.';
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/network-request-failed': return 'Could not connect. Check your internet connection and try again, or continue as a guest.';
    case 'auth/popup-closed-by-user': case 'auth/cancelled-popup-request': return 'Sign-in was cancelled. You can try again.';
    case 'auth/popup-blocked': return 'Your browser blocked the sign-in window. Allow pop-ups and try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a little and try again.';
    default: return 'Sign-in is unavailable right now. Please try again later, or continue as a guest.';
  }
}
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth, fbUser => {
    if (fbUser && !fbUser.isAnonymous) {
      setStorageOwner(fbUser.uid);
      setUser({ uid: fbUser.uid, email: fbUser.email || '', displayName: fbUser.displayName || undefined });
    } else {
      setStorageOwner();
      setUser(null);
    }
    setLoading(false);
  }, () => {
    setStorageOwner(); setUser(null); setLoading(false);
    setError('Could not restore your session. Sign in again or continue as a guest.');
  }), []);
  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try { await action(); } catch (e) {
      const message = authErrorMessage(e); setError(message); throw new Error(message);
    }
  };
  const signOut = async () => {
    await run(() => firebaseSignOut(auth));
    setStorageOwner(); setUser(null);
  };
  return <AuthContext.Provider value={{
    user, loading, error, clearError: () => setError(null),
    justLoggedIn: false, clearJustLoggedIn: () => {}, triggerLoginAnimation: () => {},
    signInWithEmail: (email, password) => run(() => signInWithEmailAndPassword(auth, email, password)),
    signUpWithEmail: (email, password) => run(() => createUserWithEmailAndPassword(auth, email, password)),
    signInWithGoogle: () => run(() => signInWithPopup(auth, new GoogleAuthProvider())),
    signInAsGuest: () => {
      if (auth.currentUser) return;
      setStorageOwner(); setUser({ uid: 'guest', email: '', displayName: 'Guest', isGuest: true });
    }, signOut,
  }}>{children}</AuthContext.Provider>;
};
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
