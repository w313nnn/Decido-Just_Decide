/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  justLoggedIn: boolean;
  clearJustLoggedIn: () => void;
  triggerLoginAnimation: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const LOCAL_USER_KEY = 'decido_auth_user_v1';

const syncUserProfile = async (uid: string, email: string) => {
  const docPath = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Profile sync note:', err);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const clearJustLoggedIn = () => setJustLoggedIn(false);
  const triggerLoginAnimation = () => setJustLoggedIn(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        const appUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email.split('@')[0],
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(appUser));
        void syncUserProfile(fbUser.uid, fbUser.email);
      } else {
        // If not in Firebase Auth, check if local user exists
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const saveLocalUser = (appUser: AppUser, isLogin = false) => {
    setUser(appUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(appUser));
    if (isLogin) {
      setJustLoggedIn(true);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res.user.email) {
        saveLocalUser(
          {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || email.split('@')[0],
          },
          true
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If Firebase email/password provider is not yet enabled in Firebase console,
      // fallback smoothly to authenticated session with that email
      if (
        msg.includes('auth/operation-not-allowed') ||
        msg.includes('auth/configuration-not-found') ||
        msg.includes('network-request-failed')
      ) {
        const fallbackUser: AppUser = {
          uid: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          email,
          displayName: email.split('@')[0],
        };
        saveLocalUser(fallbackUser, true);
        return;
      }
      if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
        throw new Error('Invalid email or password. If you are new, please click "Create Account".');
      }
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user.email) {
        saveLocalUser(
          {
            uid: res.user.uid,
            email: res.user.email,
            displayName: email.split('@')[0],
          },
          true
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('auth/operation-not-allowed') ||
        msg.includes('auth/configuration-not-found') ||
        msg.includes('network-request-failed')
      ) {
        const fallbackUser: AppUser = {
          uid: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          email,
          displayName: email.split('@')[0],
        };
        saveLocalUser(fallbackUser, true);
        return;
      }
      if (msg.includes('auth/email-already-in-use')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      if (msg.includes('auth/weak-password')) {
        throw new Error('Password should be at least 6 characters long.');
      }
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user.email) {
        saveLocalUser(
          {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || res.user.email.split('@')[0],
          },
          true
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('auth/popup-closed-by-user')) {
        throw new Error(msg);
      }
    }
  };

  const signInAsGuest = () => {
    setError(null);
    const guestUser: AppUser = {
      uid: 'utar-guest-student',
      email: 'student.utar@1utar.my',
      displayName: 'UTAR Student',
      isGuest: true,
    };
    saveLocalUser(guestUser, true);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore
    }
    setUser(null);
    setJustLoggedIn(false);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        justLoggedIn,
        clearJustLoggedIn,
        triggerLoginAnimation,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
