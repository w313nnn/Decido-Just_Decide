import { CategoryIllustration } from './CategoryIllustration';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Clock3, Coffee, IceCreamBowl, MapPin, Shuffle, Sparkles, UtensilsCrossed, Wallet } from 'lucide-react';
import { FoodCategory, FoodItem, RecommendationResult } from '../types/food';
import { AnimatedPanel } from './AnimatedPanel';

const LocationPreview = React.lazy(() =>
  import('./RealLocationModal').then(module => ({ default: module.RealLocationModal }))
);

const categoryDetails: Record<FoodCategory, { label: string; icon: typeof Coffee }> = {
  food: { label: 'Food', icon: UtensilsCrossed },
  drink: { label: 'Drink', icon: Coffee },
  dessert: { label: 'Dessert', icon: IceCreamBowl },
};

interface RecommendationCardProps {
  result: RecommendationResult;
  budget: number;
  onAccept: (item: FoodItem, reason: string) => void;
  onTryAnother: () => void;
  onBackToEdit: () => void;
  isAccepted: boolean;
  trySessionId?: number;
  showSwipeGuidance?: boolean;
}

export function RecommendationCard({
  result, budget, onAccept, onTryAnother, onBackToEdit, isAccepted,
}: RecommendationCardProps) {
  const { item, reason, remainingCandidatesCount } = result;
  const { label, icon: CategoryIcon } = categoryDetails[item.category];
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    locked.current = false;
    setSaving(false);
    setShowMap(false);
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [item.id]);

  function saveChoice() {
    if (locked.current) return;
    locked.current = true;
    setSaving(true);
    onAccept(item, reason);
  }

  return (
    <AnimatedPanel animationKey={item.id} className="suggestion-page">
      <div className="pick-topline">
        <button type="button" className="text-button pick-back" onClick={onBackToEdit}>
          <ArrowLeft size={16} aria-hidden="true" /> Change my choices
        </button>
        <span className="pick-top-note"><Sparkles size={13} aria-hidden="true" /> A little inspiration</span>
      </div>

      <article className="pick-card" data-category={item.category} aria-labelledby="suggestion-name">
        <div className="pick-hero">
          <div className="pick-hero-top" data-reveal>
            <span className="pick-category"><CategoryIcon size={14} aria-hidden="true" /> {label}</span>
            <span className="pick-series">YOUR SUGGESTION</span>
          </div>
          <div className="pick-title-row" data-reveal>
            <div className="pick-title-copy">
              <p className="pick-kicker">How about this?</p>
              <h1 id="suggestion-name" ref={heading} tabIndex={-1}>{item.name}</h1>
              <span className="pick-subcategory">{item.subcategory}</span>
            </div>
            <CategoryIllustration className="pick-art" category={item.category} emoji={item.emoji} />
          </div>
          <dl className="pick-facts" data-reveal>
            <div>
              <dt>Listed price</dt>
              <dd><span className="pick-currency">RM</span>{item.price.toFixed(2)}</dd>
            </div>
            <div>
              <dt><Clock3 size={13} aria-hidden="true" /> From campus</dt>
              <dd>~{item.walkingMinutesFromCampus}<span className="pick-unit">min walk</span></dd>
            </div>
          </dl>
        </div>

        <div className="pick-body">
          <p className="pick-description" data-reveal>{item.description}</p>

          <div className="pick-budget" data-reveal>
            <Wallet size={17} aria-hidden="true" />
            <span>Your budget <strong>RM{budget.toFixed(2)}</strong></span>
            <span className="pick-fit"><Check size={13} aria-hidden="true" /> Within budget</span>
          </div>

          <div className="pick-reason" data-reveal>
            <span className="pick-reason-icon"><Sparkles size={17} aria-hidden="true" /></span>
            <div>
              <h2>Why this pick</h2>
              <p>{reason.replace(/[.!]+$/, '')}.</p>
              {result.recencyNote && <span className="pick-recency">{result.recencyNote}</span>}
            </div>
          </div>

          <div className="pick-location" data-reveal>
            <span className="pick-location-icon"><MapPin size={19} aria-hidden="true" /></span>
            <div className="grow">
              <h2>Where to find it</h2>
              <p>{item.locationName}</p>
              <a
                className="pick-map-link"
                href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.locationName + ' Bandar Sungai Long Selangor')}
                target="_blank" rel="noopener noreferrer"
              >
                Search on Google Maps <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <button type="button" className="text-button" onClick={() => setShowMap(true)}>Preview the area</button>
              )}
            </div>
          </div>

          <div className="pick-actions" data-reveal>
            <button type="button" className="primary pick-save" disabled={saving || isAccepted} onClick={saveChoice}>
              <Check size={18} aria-hidden="true" /> Save this choice
            </button>
            <button type="button" className="secondary pick-another" disabled={saving || remainingCandidatesCount === 0} onClick={onTryAnother}>
              <Shuffle size={17} aria-hidden="true" /> Show another option
            </button>
          </div>
          <p className="pick-remaining">
            {remainingCandidatesCount
              ? remainingCandidatesCount + ' more ' + (remainingCandidatesCount === 1 ? 'option fits' : 'options fit') + ' your choices.'
              : 'You’ve seen all the options that fit. Change your choices to look again.'}
          </p>

          <details className="pick-details">
            <summary>Before you head out <ChevronDown size={15} aria-hidden="true" /></summary>
            <p>Prices and walking times are estimates from a sample list. Check today’s price, opening hours and dietary needs with the shop. Dietary tags do not verify certification.</p>
          </details>
        </div>
      </article>
    </AnimatedPanel>
  );
}
