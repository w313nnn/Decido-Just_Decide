import React, { useEffect, useRef, useState } from 'react';
import { Utensils, History, Sliders, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';
export type AppTab = 'decide' | 'history' | 'stats' | 'settings';
export function Header({ activeTab, setActiveTab, campusName }: { activeTab: AppTab; setActiveTab: (tab: AppTab) => void; campusName: string; }) {
  const { user, signOut } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const measure = () => {
      const height = nav.current?.getBoundingClientRect().height;
      if (height) document.documentElement.style.setProperty('--nav-height', `${Math.ceil(height)}px`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => {window.removeEventListener('resize', measure);document.documentElement.style.removeProperty('--nav-height');};
    }
    const observer = new ResizeObserver(measure);
    if (nav.current) observer.observe(nav.current, {box:'border-box'});
    return () => {observer.disconnect();document.documentElement.style.removeProperty('--nav-height');};
  }, []);
  const items = [{id:'decide',label:'Decide',icon:Utensils}, {id:'history',label:'History',icon:History}, {id:'stats',label:'Spending',icon:BarChart3}, {id:'settings',label:'Settings',icon:Sliders}] as const;
  return <><header className="app-header"><div className="header-inner">
    <div className="brand-lockup"><button className="brand-button" onClick={() => setActiveTab('decide')} aria-label="Decido home"><img src="/brand/decido-logo.png" alt="Decido" width="130" height="45" /></button>
      <span className="campus-label">{campusName}</span></div>
    <button className="text-button signout" aria-label={user?.isGuest ? 'Leave guest mode' : 'Sign out'} onClick={() => setConfirm(true)}><LogOut size={18} aria-hidden="true" /><span>{user?.isGuest ? 'Leave' : 'Sign out'}</span></button>
  </div></header>
  <nav ref={nav} className="app-nav" aria-label="Main navigation">{items.map(item => <button key={item.id} aria-current={activeTab === item.id ? 'page' : undefined} onClick={() => setActiveTab(item.id)}>
    <item.icon size={18} aria-hidden="true" /><span>{item.label}</span></button>)}</nav>
  <ConfirmDialog open={confirm} title={user?.isGuest ? 'Leave guest mode?' : 'Sign out?'} description={user?.isGuest ? 'Your guest history will stay in this browser.' : 'You can sign in again to see your saved history.'} confirmLabel={user?.isGuest ? 'Leave' : 'Sign out'} onCancel={() => setConfirm(false)} onConfirm={signOut} />
  </>;
}
