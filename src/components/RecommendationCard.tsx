import React, { useEffect, useRef, useState } from 'react';
import { FoodItem, RecommendationResult } from '../types/food';
import { AnimatedPanel } from './AnimatedPanel';
const LocationPreview = React.lazy(() => import('./RealLocationModal').then(module => ({default:module.RealLocationModal})));
interface Props {
  result: RecommendationResult; budget: number; onAccept: (item: FoodItem, reason: string) => void;
  onTryAnother: () => void; onBackToEdit: () => void; isAccepted: boolean;
  trySessionId?: number; showSwipeGuidance?: boolean;
}
export function RecommendationCard({ result, budget, onAccept, onTryAnother, onBackToEdit, isAccepted }: Props) {
  const { item, reason, remainingCandidatesCount } = result;
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    locked.current = false; setSaving(false);
    heading.current?.focus({preventScroll:true}); window.scrollTo(0,0);
  }, [item.id]);
  return <AnimatedPanel animationKey={item.id}>
    <button type="button" className="text-button" onClick={onBackToEdit}>← Change my choices</button>
    <article className="surface result-card">
      <p className="eyebrow" data-reveal>Your suggestion</p>
      <span className="food-emoji" aria-hidden="true" data-reveal>{item.emoji}</span>
      <h1 ref={heading} tabIndex={-1} data-reveal>{item.name}</h1>
      <p className="price" data-reveal>About RM{item.price.toFixed(2)}</p>
      <p data-reveal>{item.description}</p>
      <p className="summary" data-reveal>{reason}. Budget: RM{budget.toFixed(2)}.</p>
      {result.recencyNote && <p className="small muted">{result.recencyNote}</p>}
      <div className="location-info" data-reveal><h2>Where to look</h2><p>{item.locationName}</p>
        <p className="small muted">Listed estimate: {item.walkingMinutesFromCampus} min from campus. Check the route before heading out.</p>
        <a className="text-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationName + ' Bandar Sungai Long Selangor')}`} target="_blank" rel="noopener noreferrer">Search on Google Maps ↗</a>
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && <button className="secondary full" onClick={() => setShowMap(true)}>Preview the area</button>}
      </div>
      <p className="small muted">This is a prototype suggestion. Check today’s price, opening hours and dietary suitability with the shop. A dietary tag is not proof of certification.</p>
      <div className="stack actions" data-reveal>
        <button className="primary" disabled={saving || isAccepted} onClick={() => {
          if (locked.current) return; locked.current = true; setSaving(true); onAccept(item, reason);
        }}>Save this choice</button>
        <button className="secondary" disabled={saving || remainingCandidatesCount === 0} onClick={onTryAnother}>Show another option</button>
      </div>
      <p className="small muted">{remainingCandidatesCount ? `${remainingCandidatesCount} more ${remainingCandidatesCount === 1 ? 'option' : 'options'} fit your choices.` : 'You’ve seen all the options that fit. Change your choices to look again.'}</p>
    </article>
    {showMap && <React.Suspense fallback={<p role="status">Loading the map…</p>}><LocationPreview isOpen={showMap} onClose={() => setShowMap(false)} item={item} /></React.Suspense>}
  </AnimatedPanel>;
}
