import React, { useState } from 'react';
import { DietaryTag, UserPreferences } from '../types/food';
import { useAuth } from '../context/AuthContext';
import { AnimatedPanel } from './AnimatedPanel';
export function SettingsView({ preferences, onUpdatePreferences }: {
  preferences: UserPreferences; onUpdatePreferences: (p: Partial<UserPreferences>) => void; onResetSeedHistory: () => void;
}) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState({food: String(preferences.defaultBudgetFood), drink: String(preferences.defaultBudgetDrink), dessert: String(preferences.defaultBudgetDessert)});
  const [message, setMessage] = useState('');
  const options: {id: DietaryTag; label: string}[] = [{id:'halal',label:'Halal tag'}, {id:'pork-free',label:'No pork'}, {id:'vegetarian',label:'Vegetarian'}, {id:'beef-free',label:'No beef'}];
  return <AnimatedPanel scroll className="section-stack">
    <div className="page-intro" data-reveal><h1>Settings</h1><p>A few defaults to make the next choice easier.</p></div>
    <section className="surface" data-reveal><h2>Your session</h2><p>{user?.isGuest ? 'Guest mode' : user?.email}</p>
      <p className="small muted">{user?.isGuest ? 'Your choices and settings stay in this browser.' : 'History syncs with your account. These settings stay in this browser for this account.'}</p></section>
    <section className="surface" data-reveal><h2>Campus</h2><p>UTAR Sungai Long</p><p className="muted small">Other universities are planned. Suggestions currently use the Sungai Long sample list.</p></section>
    <section className="surface" data-reveal><h2>Usual budgets</h2><p className="muted">You can change these each time you decide.</p>
      <form onSubmit={e => {e.preventDefault();
        const values = Object.values(budgets).map(Number);
        if (values.some(n => !Number.isFinite(n) || n < 1 || n > 100)) {setMessage('Enter budgets from RM1 to RM100.');return;}
        onUpdatePreferences({defaultBudgetFood:values[0],defaultBudgetDrink:values[1],defaultBudgetDessert:values[2]});setMessage('Budgets saved.');
      }}>
      {(['food','drink','dessert'] as const).map(category => <div key={category}><label htmlFor={`default-${category}`}>{category === 'food' ? 'Food' : category === 'drink' ? 'Drink' : 'Dessert'} budget (RM)</label>
        <input id={`default-${category}`} type="number" min="1" max="100" step="0.01" required value={budgets[category]} onChange={e => setBudgets({...budgets,[category]:e.target.value})}/></div>)}
      <button className="primary" type="submit">Save budgets</button><p role="status" className="small muted">{message}</p></form>
    </section>
    <section className="surface" data-reveal><h2>Dietary preferences</h2><p className="muted">We’ll only suggest items with all the tags you select.</p>
      <p className="notice">These tags come from a sample list. They do not verify halal certification, allergens or kitchen practices. Ask the shop before ordering.</p>
      <fieldset><legend className="sr-only">Dietary tags</legend>{options.map(option => <label className="check-row" key={option.id}><input type="checkbox" checked={preferences.dietaryRestrictions.includes(option.id)} onChange={e => onUpdatePreferences({dietaryRestrictions:e.target.checked ? [...preferences.dietaryRestrictions,option.id] : preferences.dietaryRestrictions.filter(t => t !== option.id)})} />{option.label}</label>)}</fieldset>
    </section>
  </AnimatedPanel>;
}
