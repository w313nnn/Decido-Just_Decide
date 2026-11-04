/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import { playLoginSuccessSound } from '../utils/soundEffects';
import { AppUser } from '../context/AuthContext';

interface LoginLoadingScreenProps {
  user: AppUser;
  onComplete: () => void;
}

export const LoginLoadingScreen: React.FC<LoginLoadingScreenProps> = ({ user, onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Verifying account session...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  const displayName = user.displayName || user.email.split('@')[0] || 'Foodie';

  useEffect(() => {
    // Step 1: Initialize session (15% -> 50%)
    const timer1 = setTimeout(() => {
      setProgress(50);
      setStatusText('Syncing your dining history & campus...');
    }, 400);

    // Step 2: Finalize preferences (50% -> 85%)
    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Personalizing food recommendations...');
    }, 900);

    // Step 3: Success state (85% -> 100%)
    const timer3 = setTimeout(() => {
      setProgress(100);
      setIsSuccess(true);
      setStatusText(`Welcome back, ${displayName}!`);

      // Play the celebratory success sound chime!
      playLoginSuccessSound();
      setSoundPlayed(true);
    }, 1400);

    // Step 4: Finish transition and open app
    const timer4 = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [displayName, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50/95 via-amber-100/70 to-stone-100 backdrop-blur-md px-6 select-none overflow-hidden">
      {/* Decorative ambient radial glows */}
      <div className="absolute w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none -top-10 -left-10 animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-orange-400/15 blur-3xl pointer-events-none -bottom-10 -right-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm flex flex-col items-center text-center relative z-10"
      >
        {/* Animated Brand Icon Container with Pulsing Rings */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Pulsing Halo Rings */}
          <motion.div
            animate={{
              scale: isSuccess ? [1, 1.35, 1.2] : [1, 1.25, 1],
              opacity: isSuccess ? [0.6, 0.2, 0] : [0.4, 0.1, 0.4],
            }}
            transition={{
              duration: isSuccess ? 0.8 : 1.8,
              repeat: isSuccess ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-32 h-32 rounded-3xl bg-amber-400/30 -z-10"
          />

          <motion.div
            animate={{
              scale: isSuccess ? [1, 1.5, 1.3] : [1, 1.4, 1],
              opacity: isSuccess ? [0.4, 0.1, 0] : [0.2, 0.05, 0.2],
            }}
            transition={{
              duration: isSuccess ? 0.9 : 2.2,
              repeat: isSuccess ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-36 h-36 rounded-3xl bg-amber-500/20 -z-20"
          />

          {/* Central Icon Emblem */}
          <motion.div
            animate={
              isSuccess
                ? {
                    scale: [1, 1.18, 1],
                    rotate: [0, -6, 6, 0],
                  }
                : {
                    y: [0, -6, 0],
                  }
            }
            transition={
              isSuccess
                ? { duration: 0.6, ease: 'easeOut' }
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shadow-xl transition-all duration-300 relative ${
              isSuccess
                ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-amber-500/30 border-2 border-white'
                : 'bg-white border-2 border-amber-200/90 shadow-stone-300/40'
            }`}
          >
            {/* The Decido Icon */}
            <span role="img" aria-label="Decido Noodles" className="select-none filter drop-shadow-sm">
              🍜
            </span>

            {/* Success Badge Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white flex items-center justify-center"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Decido</h2>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-stone-500 font-medium">Just decide</p>
        </div>

        {/* Status Message */}
        <motion.div
          key={statusText}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-8 flex items-center justify-center mb-3"
        >
          <span
            className={`text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 ${
              isSuccess ? 'text-emerald-700' : 'text-stone-700'
            }`}
          >
            {statusText}
          </span>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-64 h-2.5 bg-stone-200/90 rounded-full overflow-hidden p-0.5 shadow-inner mb-4 relative">
          <motion.div
            initial={{ width: '15%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all relative overflow-hidden ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-600'
            }`}
          >
            {/* Shimmer sweep animation over the progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
          </motion.div>
        </div>

        {/* Audio confirmation indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium mb-5">
          <Volume2 className={`w-3.5 h-3.5 ${soundPlayed ? 'text-amber-600' : 'text-stone-400'}`} />
          <span>{soundPlayed ? 'Success chime played' : 'Audio enabled'}</span>
        </div>

        {/* Skip Button (in case user wants instant bypass) */}
        <button
          type="button"
          onClick={onComplete}
          className="text-[11px] text-stone-400 hover:text-stone-700 underline font-semibold transition-colors cursor-pointer"
        >
          Skip into app &rarr;
        </button>
      </motion.div>
    </div>
  );
};

