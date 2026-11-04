import React, { useEffect, useRef } from 'react';
import { ArrowRight, Check, History } from 'lucide-react';
import { FoodItem } from '../types/food';
import { AnimatedPanel } from './AnimatedPanel';

interface AcceptedTicketViewProps {
  item: FoodItem;
  budget: number;
  onDecideAnother: () => void;
  onViewHistory: () => void;
}

export function AcceptedTicketView({ item, onDecideAnother, onViewHistory }: AcceptedTicketViewProps) {
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  return (
    <AnimatedPanel className="saved-card">
      <div className="saved-heading" data-reveal>
        <span className="saved-check"><Check size={26} aria-hidden="true" /></span>
        <p className="eyebrow">Saved to history</p>
        <h1 tabIndex={-1} ref={title}>That’s decided.</h1>
        <p>One less thing to think about.</p>
      </div>
      <div className="saved-choice" data-category={item.category} data-reveal>
        <span className="saved-food" aria-hidden="true">{item.emoji}</span>
        <div>
          <h2>{item.name}</h2>
          <p>{item.locationName}</p>
          <span className="saved-price">About RM{item.price.toFixed(2)}</span>
        </div>
      </div>
      <div className="pick-actions" data-reveal>
        <button type="button" className="primary pick-save" onClick={onDecideAnother}>Choose something else <ArrowRight size={17} aria-hidden="true" /></button>
        <button type="button" className="secondary pick-another" onClick={onViewHistory}><History size={17} aria-hidden="true" /> View history</button>
      </div>
      <p className="saved-note">Saving a choice doesn’t place an order.</p>
    </AnimatedPanel>
  );
}
