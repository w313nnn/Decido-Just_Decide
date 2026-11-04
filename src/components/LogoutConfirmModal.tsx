/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X } from 'lucide-react';
import { AppUser } from '../context/AuthContext';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: AppUser | null;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200/90 p-5 sm:p-6 overflow-hidden text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <LogOut className="w-6 h-6 ml-0.5" />
          </div>

          {/* Heading */}
          <h3 id="logout-dialog-title" className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            Log out of Decido?
          </h3>

          {/* Confirmation Message */}
          <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-stone-500">
            <p className="leading-snug">
              Are you sure you want to log out
              {user?.email ? (
                <>
                  {' '}from{' '}
                  <span className="font-semibold text-stone-800 whitespace-nowrap inline-block max-w-full truncate align-bottom">
                    {user.email}
                  </span>
                </>
              ) : null}
              ?
            </p>
            <p className="text-stone-400 text-[11px] sm:text-xs leading-snug">
              You will need to sign in again to access your account.
            </p>
          </div>

          {user?.isGuest && (
            <div className="mt-3 py-1.5 px-2.5 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 font-medium">
              Guest session: Your local history and preferences will remain saved on this device.
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onConfirm();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

