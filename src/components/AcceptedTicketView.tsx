import React, { useEffect, useRef } from 'react';
import { FoodItem } from '../types/food';
import { AnimatedPanel } from './AnimatedPanel';
export function AcceptedTicketView({ item, onDecideAnother, onViewHistory }: {
  item: FoodItem; budget: number; onDecideAnother: () => void; onViewHistory: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {title.current?.focus({preventScroll:true});window.scrollTo(0,0);}, []);
  return <AnimatedPanel className="surface result-card">
    <p className="eyebrow" data-reveal>Saved to history</p>
    <h1 tabIndex={-1} ref={title} data-reveal>That’s decided.</h1>
    <span className="food-emoji" aria-hidden="true" data-reveal>{item.emoji}</span>
    <h2 data-reveal>{item.name}</h2><p data-reveal>{item.locationName}</p>
    <p className="muted" data-reveal>About RM{item.price.toFixed(2)}. Saving a choice does not place an order.</p>
    <div className="actions stack" data-reveal><button className="primary" onClick={onDecideAnother}>Choose something else</button>
      <button className="secondary" onClick={onViewHistory}>View history</button></div>
  </AnimatedPanel>;
}
