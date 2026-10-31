import React, { useState } from 'react';
import { Utensils, History, Sliders, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface HeaderProps {
  activeTab: 'decide' | 'history' | 'stats' | 'settings';
  setActiveTab: (tab: 'decide' | 'history' | 'stats' | 'settings') => void;
  campusName: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, campusName }) => {
  const { user, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: 'decide' as const, label: 'Decide', icon: Utensils },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: Sliders },
  ];

  return (
    <>
      {/* Top Mobile/Desktop App Header */}
      <header className="border-b border-stone-200/80 bg-amber-50/90 relative z-20">
        <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Brand identity on left - clean, no wrapping */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-amber-50 flex items-center justify-center font-bold text-base shadow-xs select-none shrink-0">
              🍜
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
              <span className="font-bold text-stone-900 tracking-tight text-base">
                Decido
              </span>
              <span className="text-xs text-stone-500 font-medium truncate">
                · {campusName}
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Navigation Pills (hidden on mobile to prevent overflow) */}
          <nav
            className="hidden sm:flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl"
            aria-label="Desktop Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Account / Sign Out on Right */}
          {user && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-rose-700 bg-stone-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-stone-200/80"
                title={`Sign out (${user.email})`}
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => void signOut()}
        user={user}
      />

      {/* Mobile Bottom Navigation Bar (Gold standard mobile application layout) */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-2 py-1.5 flex items-center justify-around"
        aria-label="Mobile Bottom Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-700 font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-amber-100/80 text-amber-800' : 'text-stone-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
