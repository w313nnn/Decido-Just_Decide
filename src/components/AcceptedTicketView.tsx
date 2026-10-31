import React, { useState, useRef } from 'react';
import { FoodItem } from '../types/food';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Sparkles, History, RotateCcw, MapPin } from 'lucide-react';

interface AcceptedTicketViewProps {
  item: FoodItem;
  budget: number;
  onDecideAnother: () => void;
  onViewHistory: () => void;
}

export const AcceptedTicketView: React.FC<AcceptedTicketViewProps> = ({
  item,
  budget,
  onDecideAnother,
  onViewHistory,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animationStage, setAnimationStage] = useState<'sliding' | 'revealed'>('sliding');

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 260,
    damping: 24,
  });

  const sheenX = useTransform(mouseX, [-0.5, 0.5], ['-100%', '200%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Ticket serial number e.g. #SL-850
  const ticketSerial = `SL-${Math.floor(item.price * 10).toString().padStart(3, '0')}`;

  return (
    <div className="w-full max-w-md mx-auto py-2 px-1 select-none flex flex-col items-center">
      {/* Warm Stage Backdrop Wrapper matching overall app tone */}
      <div
        className="w-full relative min-h-[460px] flex flex-col items-center justify-center overflow-hidden py-6 rounded-3xl bg-white text-stone-900 shadow-md border border-stone-200/90"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient warm golden glow behind card */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-200/40 blur-3xl rounded-full pointer-events-none" />

        {/* Small top brand watermark */}
        <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-amber-900/80">
          <span>🍜 Decido</span>
          <span className="text-stone-300">·</span>
          <span>UTAR Sungai Long</span>
        </div>

        {/* The Card & Pocket Presentation Container */}
        <div className="relative w-[300px] sm:w-[330px] h-[210px] flex items-center justify-center perspective-[1000px]">
          {/* Warm Pocket/Sleeve (slides down and fades away like in the video) */}
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 70, opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-2 -bottom-2 h-[120px] rounded-2xl bg-amber-100/80 border border-amber-200 shadow-md z-20 flex items-center justify-center pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full border border-amber-400/50 bg-amber-50 flex items-center justify-center">
              <span className="text-amber-700 text-xs">✨</span>
            </div>
          </motion.div>

          {/* Golden Ticket Card */}
          <motion.div
            ref={cardRef}
            initial={{ y: 45, scale: 0.94 }}
            animate={{
              y: 0,
              scale: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 22,
              delay: 0.25,
            }}
            onAnimationComplete={() => setAnimationStage('revealed')}
            style={{
              rotateX: animationStage === 'revealed' ? rotateX : 0,
              rotateY: animationStage === 'revealed' ? rotateY : 0,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full h-[200px] rounded-2xl overflow-hidden shadow-[0_16px_36px_-10px_rgba(217,143,10,0.35)] cursor-pointer"
          >
            {/* Metallic Gold Surface Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8df95] via-[#e5b958] to-[#c78d26] border border-[#ffec9f]/80" />

            {/* Inset Double Border Ticket Stamp Ring */}
            <div className="absolute inset-2.5 rounded-xl border border-[#7a4e0c]/30 pointer-events-none" />
            <div className="absolute inset-3 rounded-[10px] border border-dashed border-[#7a4e0c]/25 pointer-events-none" />

            {/* Left and Right Scalloped Ticket Notches matching card background */}
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-stone-200/80 shadow-inner z-20" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-stone-200/80 shadow-inner z-20" />

            {/* Shimmer Sheen overlay sweeping across the ticket */}
            <motion.div
              style={{ x: sheenX }}
              animate={{
                x: ['-120%', '220%'],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 3.5,
                ease: 'easeInOut',
              }}
              className="absolute inset-y-0 w-32 -skew-x-25 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-10"
            />

            {/* Card Inner Content (No long descriptions as requested) */}
            <div className="relative z-10 h-full p-4.5 flex flex-col justify-between text-stone-950">
              {/* Header: Decido Brand & Serial Code */}
              <div className="flex items-center justify-between pl-3 pr-3 pt-1">
                <div className="flex items-center gap-1.5 font-extrabold tracking-tight text-xs text-[#523304]">
                  <span className="text-sm">🍜</span>
                  <span className="uppercase tracking-wider">Decido Pass</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#5c3c0a] bg-[#f8e3a2]/80 px-1.5 py-0.5 rounded border border-[#7a4e0c]/20">
                  {ticketSerial}
                </span>
              </div>

              {/* Main Ticket Center: Food Name & Price */}
              <div className="px-4 py-1 text-center">
                <div className="inline-flex items-center justify-center text-3xl mb-1 filter drop-shadow-xs">
                  {item.emoji}
                </div>
                <h3 className="font-extrabold text-stone-950 text-base sm:text-lg leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                  {item.name}
                </h3>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-[#442801] tracking-tight">
                    RM {item.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#5a3804] capitalize">
                    · {item.category}
                  </span>
                </div>
              </div>

              {/* Ticket Footer: Essential Tags Only */}
              <div className="px-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-[#523304] border-t border-[#7a4e0c]/20 pt-1.5">
                <span className="capitalize truncate max-w-[130px]">
                  {item.subcategory} {item.soupOrDry === 'soup' ? '· Soup' : ''}
                </span>
                <span className="truncate max-w-[140px] text-right">
                  📍 {item.locationName.split('(')[0].trim()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Headline & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
          className="text-center mt-6 px-4"
        >
          <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Decision Confirmed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            You&apos;re set for today!
          </h2>
        </motion.div>

        {/* Quick actions underneath */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.4 }}
          className="flex items-center gap-2.5 mt-5 px-4 w-full max-w-xs"
        >
          <button
            type="button"
            onClick={onViewHistory}
            className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-600" />
            <span>View History</span>
          </button>

          <button
            type="button"
            onClick={onDecideAnother}
            className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-amber-600/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Decision</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
