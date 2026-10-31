import React, { useState, useEffect, useRef } from 'react';
import { RecommendationResult, FoodItem } from '../types/food';
import {
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Clock,
} from 'lucide-react';
import { MorphIcon } from 'morphicons/react';
import { MapPin as MapPinNode, Clock as ClockNode } from 'lucide';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { getVerifiedPlaceInfo, VerifiedPlaceInfo } from '../services/googleMapsPlaceService';
import { RealLocationModal } from './RealLocationModal';
import { Map as MapIcon } from 'lucide-react';

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

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  result,
  onAccept,
  onTryAnother,
  onBackToEdit,
  isAccepted,
  trySessionId,
  showSwipeGuidance = true,
}) => {
  const { item, reason } = result;
  const [isHovered, setIsHovered] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  // Hidden distance text reveal state & outside click ref
  const [showDistance, setShowDistance] = useState(false);
  const [isLocationHovered, setIsLocationHovered] = useState(false);
  const isLocationRevealed = showDistance || isLocationHovered;
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  // Tutorial swipe guidance overlay state (Liquid Glass reference design).
  // Shows once as guidance and never pops up again after user makes a choice or after 10s countdown.
  const [tutorialDismissed, setTutorialDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('decido_swipe_tutorial_seen') === 'true';
    } catch {
      return false;
    }
  });

  // Re-check storage whenever trySessionId or showSwipeGuidance preference changes
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('decido_swipe_tutorial_seen') === 'true';
      setTutorialDismissed(isDismissed);
    } catch {
      // ignore
    }
  }, [trySessionId, showSwipeGuidance]);

  const dismissTutorialPermanently = () => {
    setTutorialDismissed(true);
    try {
      localStorage.setItem('decido_swipe_tutorial_seen', 'true');
    } catch {
      // ignore local storage errors
    }
  };

  // 10-second countdown indicator for auto-dismissing tutorial
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (tutorialDismissed || isAccepted) return;

    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          dismissTutorialPermanently();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tutorialDismissed, isAccepted]);

  // Google Maps verification and modal state
  const placesLibrary = useMapsLibrary('places');
  const [verifiedPlace, setVerifiedPlace] = useState<VerifiedPlaceInfo | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getVerifiedPlaceInfo(item, placesLibrary)
      .then((info) => {
        if (isCurrent) setVerifiedPlace(info);
      })
      .catch((err) => console.warn('Could not verify place:', err));

    return () => {
      isCurrent = false;
    };
  }, [item, placesLibrary]);

  // Flip back to location when user clicks any other part of the screen
  useEffect(() => {
    if (!showDistance) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        locationButtonRef.current &&
        !locationButtonRef.current.contains(e.target as Node)
      ) {
        setShowDistance(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showDistance]);

  // Reset flip whenever recommendation changes
  useEffect(() => {
    setShowDistance(false);
  }, [item.id]);

  // Motion values for swipe gesture
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);

  // Opacity for the interactive swipe action stamps
  const rejectOpacity = useTransform(x, [-120, -25], [1, 0]);
  const acceptOpacity = useTransform(x, [25, 120], [0, 1]);
  const tutorialDragOpacity = useTransform(x, [-50, 0, 50], [0, 1, 0]);

  // Card cascade stack indices (staggered deck layers behind the main card)
  const backgroundDeckCards = [0, 1, 2];
  const centerIndex = 1;

  const triggerPass = () => {
    dismissTutorialPermanently();
    setExitDirection('left');
    setTimeout(() => {
      onTryAnother();
      x.set(0);
      setExitDirection(null);
    }, 200);
  };

  const triggerAccept = () => {
    dismissTutorialPermanently();
    setExitDirection('right');
    setTimeout(() => {
      onAccept(item, reason);
      x.set(0);
      setExitDirection(null);
    }, 200);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 90;
    const velocityThreshold = 400;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      // Swiped Left -> Reject & Try Another
      dismissTutorialPermanently();
      setExitDirection('left');
      setTimeout(() => {
        onTryAnother();
        x.set(0);
        setExitDirection(null);
      }, 200);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      // Swiped Right -> Accept decision
      dismissTutorialPermanently();
      setExitDirection('right');
      setTimeout(() => {
        onAccept(item, reason);
        x.set(0);
        setExitDirection(null);
      }, 200);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* Top back button */}
      <div className="mb-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-stone-200/50 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change budget or craving</span>
        </button>
      </div>

      {/* Staggered Cascade Deck Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center pt-1 pb-3"
      >
        {/* Background Decorative Cascade Stagger Cards */}
        {backgroundDeckCards.map((i) => {
          const dist = i - centerIndex;
          const targetY = isHovered ? dist * 12 + 8 : dist * 4 + 4;
          const targetX = isHovered ? dist * 10 : dist * 2;
          const targetRotate = isHovered ? dist * 3 : dist * 1.2;
          const targetScale = isHovered ? 0.96 - Math.abs(dist) * 0.02 : 0.98 - Math.abs(dist) * 0.02;

          return (
            <motion.div
              key={`deck-bg-${i}`}
              animate={{
                y: targetY,
                x: targetX,
                rotate: targetRotate,
                scale: targetScale,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.9 }}
              style={{ zIndex: 1 + i }}
              className="absolute inset-0 bg-stone-100/90 border border-stone-300/80 rounded-2xl sm:rounded-3xl shadow-xs pointer-events-none"
            />
          );
        })}

        {/* Top Active Interactive Draggable Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            style={{ x, rotate, zIndex: 10 }}
            drag={isAccepted ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            animate={
              exitDirection === 'left'
                ? { x: -450, rotate: -25, opacity: 0 }
                : exitDirection === 'right'
                ? { x: 450, rotate: 25, opacity: 0 }
                : { x: 0, rotate: 0, opacity: 1, scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className={`w-full bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden ${
              isAccepted ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            }`}
          >
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            {/* Liquid Glass Onboarding Overlay covering card area (Auto-dismisses in 10s or on choice) */}
            <AnimatePresence>
              {!tutorialDismissed && !isAccepted && showSwipeGuidance && (
                <motion.div
                  style={{ opacity: tutorialDragOpacity }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                  transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                  className="absolute inset-0 z-30 pointer-events-auto select-none rounded-2xl sm:rounded-3xl bg-white/55 backdrop-blur-md border border-white/70 shadow-xl overflow-hidden flex flex-col justify-between p-3.5 sm:p-5"
                >
                  {/* Glossy liquid glass highlights */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/10 to-white/25 pointer-events-none" />
                  <motion.div
                    animate={{ x: ['-120%', '220%'] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', repeatDelay: 1.2 }}
                    className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] pointer-events-none"
                  />

                  {/* Top Edge: Subtle countdown timer indication (Dismiss in 10s) */}
                  <div className="relative z-10 flex items-center justify-center pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissTutorialPermanently();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-[11px] font-semibold text-stone-600 hover:text-stone-900 border border-white/90 shadow-xs backdrop-blur-sm transition-all cursor-pointer group"
                      title="Tap to dismiss now"
                    >
                      <Clock className="w-3 h-3 text-stone-500 group-hover:rotate-12 transition-transform" />
                      <span>Dismiss in {countdown}s</span>
                      <span className="text-stone-400 font-normal">· Tap to skip</span>
                    </button>
                  </div>

                  {/* Middle: Spacious Layout with Wide Edge-to-Edge Prompts */}
                  <div className="relative z-10 flex items-center justify-between px-1 sm:px-3 my-auto w-full">
                    {/* Left Edge: Vibrant Red Arrow + Pass with gentle red glow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerPass();
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 py-1.5 px-1.5 sm:px-2.5 rounded-2xl hover:bg-rose-50/60 active:scale-95 transition-all cursor-pointer group shrink-0"
                      title="Swipe left or tap to Pass"
                    >
                      <div className="p-2 sm:p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200/60 shadow-md shadow-rose-500/15 group-hover:bg-rose-100/80 transition-colors">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600 drop-shadow-[0_0_14px_rgba(244,63,94,0.45)] group-hover:-translate-x-1 transition-transform"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="19" y1="12" x2="5" y2="12" />
                          <polyline points="12 19 5 12 12 5" />
                        </svg>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-rose-700 tracking-tight drop-shadow-xs">
                        Pass
                      </span>
                    </button>

                    {/* Center: Minimalist Semi-Transparent White Badge */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissTutorialPermanently();
                      }}
                      className="bg-white/90 backdrop-blur-md shadow-lg shadow-stone-300/30 border border-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-center max-w-[170px] sm:max-w-[205px] mx-1 sm:mx-3 cursor-pointer hover:bg-white transition-all group shrink-0"
                      title="Swipe left or right (tap to dismiss)"
                    >
                      {/* Dotted arrows: ←··· ···→ */}
                      <div className="flex items-center justify-center gap-1 text-stone-800 font-semibold mb-1 select-none">
                        <span className="text-base sm:text-lg leading-none font-bold">←</span>
                        <span className="text-stone-400 font-mono tracking-widest text-[11px]">··· ···</span>
                        <span className="text-base sm:text-lg leading-none font-bold">→</span>
                      </div>

                      {/* Hand pointing swipe gesture icon */}
                      <div className="my-1 text-stone-800 group-hover:scale-105 transition-transform">
                        <svg
                          className="w-7 h-7 sm:w-8 sm:h-8 mx-auto animate-pulse"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
                          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83l2.76 2.77" />
                        </svg>
                      </div>

                      {/* Two-line text instruction */}
                      <p className="text-[11px] sm:text-xs text-stone-800 font-semibold leading-tight mt-1">
                        Swipe left to pass,
                        <br />
                        right to accept
                      </p>
                    </div>

                    {/* Right Edge: Vibrant Green Arrow + Accept with gentle green glow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAccept();
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 py-1.5 px-1.5 sm:px-2.5 rounded-2xl hover:bg-emerald-50/60 active:scale-95 transition-all cursor-pointer group shrink-0"
                      title="Swipe right or tap to Accept"
                    >
                      <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 shadow-md shadow-emerald-500/15 group-hover:bg-emerald-100/80 transition-colors">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 drop-shadow-[0_0_14px_rgba(16,185,129,0.45)] group-hover:translate-x-1 transition-transform"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-emerald-700 tracking-tight drop-shadow-xs">
                        Accept
                      </span>
                    </button>
                  </div>

                  {/* Bottom spacer for vertical balance */}
                  <div className="h-2 sm:h-3" aria-hidden="true" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Swipe Indicator Stamps (Left: Reject, Right: Accept) */}
            <motion.div
              style={{ opacity: rejectOpacity }}
              className="absolute top-4 right-4 pointer-events-none border-2 border-rose-500 bg-rose-50/90 text-rose-600 font-extrabold px-2.5 py-1 rounded-xl rotate-12 flex items-center gap-1 shadow-sm z-20 text-[11px] uppercase tracking-wider"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
              <span>Pass</span>
            </motion.div>

            <motion.div
              style={{ opacity: acceptOpacity }}
              className="absolute top-4 left-4 pointer-events-none border-2 border-emerald-600 bg-emerald-50/90 text-emerald-700 font-extrabold px-2.5 py-1 rounded-xl -rotate-12 flex items-center gap-1 shadow-sm z-20 text-[11px] uppercase tracking-wider"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Eat This!</span>
            </motion.div>

            {/* Card Kicker */}
            <div className="flex items-center justify-center text-xs text-stone-500 font-medium mb-2.5 pt-0.5">
              <span className="tracking-wide uppercase text-[10px] text-amber-700 font-bold">
                Here is your decision
              </span>
            </div>

            {/* Big Food Hero Name & Emoji */}
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div className="text-3xl sm:text-4xl select-none p-2 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100 flex-shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-stone-900 leading-tight tracking-tight">
                  {item.name}
                </h2>
                {item.malayName && (
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5 truncate">
                    {item.malayName}
                  </p>
                )}
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-800 whitespace-nowrap">
                    RM {item.price.toFixed(2)}
                  </span>
                  {item.priceMin && item.priceMax && item.priceMin !== item.priceMax && (
                    <span className="text-[11px] text-stone-500 whitespace-nowrap">
                      (RM{item.priceMin.toFixed(0)} - RM{item.priceMax.toFixed(0)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Clean Typographic Metadata */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-stone-600 border-y border-stone-100 py-2 mb-3">
              <span className="capitalize font-semibold text-stone-700">{item.subcategory}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="capitalize">
                {item.soupOrDry === 'soup' ? 'Hot Soup' : item.soupOrDry === 'dry' ? 'Dry Style' : item.soupOrDry}
              </span>
              {item.spicyLevel > 0 && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{item.spicyLevel === 1 ? 'Mild' : item.spicyLevel === 2 ? 'Medium Spicy' : 'Fiery Spicy'}</span>
                </>
              )}
              {item.dietary.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="capitalize">{item.dietary.join(', ')}</span>
                </>
              )}
            </div>

            {/* Short, Clean Reason */}
            <div className="bg-amber-50/60 rounded-xl px-3 py-2 border border-amber-200/60 mb-2.5 flex items-center justify-center text-center">
              <p className="text-xs text-stone-800 font-semibold tracking-tight">
                {reason}
              </p>
            </div>

            {/* Location & Distance Text Reveal Button */}
            <motion.button
              ref={locationButtonRef}
              type="button"
              onMouseEnter={() => setIsLocationHovered(true)}
              onMouseLeave={() => setIsLocationHovered(false)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDistance((prev) => !prev);
              }}
              className="w-full bg-stone-50 hover:bg-stone-100/90 active:bg-stone-200/70 rounded-xl sm:rounded-2xl px-3.5 py-2.5 border border-stone-200/80 transition-colors text-xs cursor-pointer shadow-xs relative flex items-center justify-between"
            >
              {/* Morphing icon on left: MapPin when displaying location, Clock when displaying distance */}
              <div className="relative w-[18px] h-[18px] flex items-center justify-center shrink-0 mr-2 text-amber-600">
                <MorphIcon
                  icon={isLocationRevealed ? ClockNode : MapPinNode}
                  size={15}
                  spring="snappy"
                  className="text-amber-600 shrink-0"
                />
              </div>

              {/* Text Reveal Vertical Roll Container */}
              <div className="relative h-[18px] overflow-hidden flex-1 text-left min-w-0">
                <motion.div
                  animate={{ y: isLocationRevealed ? -18 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex flex-col"
                >
                  <span className="block h-[18px] leading-[18px] font-semibold tracking-tight text-xs truncate text-stone-700">
                    {verifiedPlace?.name || item.locationName}
                  </span>
                  <span className="block h-[18px] leading-[18px] font-bold tracking-tight text-xs truncate text-amber-900">
                    ~{verifiedPlace?.walkingMinutes || item.walkingMinutesFromCampus} min walk from campus
                  </span>
                </motion.div>
              </div>

              {/* Right Indicator with matching Text Reveal */}
              <div className="relative h-[16px] overflow-hidden shrink-0 ml-2">
                <motion.div
                  animate={{ y: isLocationRevealed ? -16 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex flex-col text-right"
                >
                  <span className="block h-[16px] leading-[16px] text-[10px] text-stone-500 font-medium whitespace-nowrap">
                    Tap for distance
                  </span>
                  <span className="block h-[16px] leading-[16px] text-[10px] text-amber-700 font-bold whitespace-nowrap">
                    Walking time
                  </span>
                </motion.div>
              </div>
            </motion.button>

            {/* Real Google Maps Verification Row */}
            <div className="mt-2 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMapModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <MapIcon className="w-3 h-3 text-amber-700 shrink-0" />
                <span>View on Google Map</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Maps Verified</span>
              </span>
            </div>

            {/* If accepted banner */}
            {isAccepted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 w-full py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Decision logged! Enjoy your meal.</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* If decision already accepted, show option to decide another meal */}
      {isAccepted && (
        <div className="flex items-center justify-center mt-2">
          <button
            type="button"
            onClick={onTryAnother}
            className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-2xl flex items-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Decide another meal</span>
          </button>
        </div>
      )}

      {/* Real Location Google Maps Modal */}
      <RealLocationModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        item={item}
      />
    </div>
  );
};
