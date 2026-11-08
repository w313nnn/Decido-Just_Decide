import React, { useMemo, useState } from 'react';
import { DecisionRecord, FoodCategory } from '../types/food';
import { AnimatedPanel } from './AnimatedPanel';
export interface CategoryData {
  category: FoodCategory;
  label: string;
  emoji: string;
  count: number;
  percentage: number;
  totalSpent: number;
  avgPrice: number;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  barGradient: string;
  icon: React.ReactNode;
}


export function StatsView({ history, onGoToDecide }: { history: DecisionRecord[]; onResetSeed: () => void; onGoToDecide: () => void; }) {
  const [days, setDays] = useState(30);
  const records = useMemo(() => {
    const now = Date.now();
    return history.filter(r => Date.parse(r.decidedAt) <= now && (!days || now - Date.parse(r.decidedAt) <= days * 86400000));
  }, [history, days]);
  const total = records.reduce((sum, r) => sum + r.price, 0);
  return <AnimatedPanel scroll animationKey={days} className="section-stack">
    <div className="page-intro" data-reveal><h1>Your spending estimate</h1><p>Based on the listed prices of saved choices, not actual payments.</p></div>
    <label htmlFor="spending-period">Time period</label><select id="spending-period" value={days} onChange={e => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={0}>All time</option></select>
    <section className="surface" data-reveal><p className="eyebrow">Estimated total</p><p className="price">RM{total.toFixed(2)}</p><p className="muted">{records.length} saved {records.length === 1 ? 'choice' : 'choices'}{records.length > 0 && ` · RM${(total / records.length).toFixed(2)} per choice`}</p></section>
    {(['food','drink','dessert'] as const).map(category => {
      const items = records.filter(r => r.category === category);
      return <section className="surface row-between" key={category} data-reveal><div><h2>{category === 'food' ? 'Food' : category === 'drink' ? 'Drinks' : 'Desserts'}</h2><p className="small muted">{items.length} saved</p></div><p>RM{items.reduce((sum,r) => sum + r.price,0).toFixed(2)}</p></section>;
    })}
    {!records.length && <button className="primary" onClick={onGoToDecide}>Find a suggestion</button>}
  </AnimatedPanel>;
}
