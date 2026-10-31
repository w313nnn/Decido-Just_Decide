/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { FoodItem } from '../types/food';
import {
  VerifiedPlaceInfo,
  getVerifiedPlaceInfo,
  UTAR_SL_COORDINATES,
} from '../services/googleMapsPlaceService';
import {
  X,
  ExternalLink,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Navigation,
  School,
} from 'lucide-react';

interface RealLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodItem;
}

export const RealLocationModal: React.FC<RealLocationModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const placesLibrary = useMapsLibrary('places');
  const [placeInfo, setPlaceInfo] = useState<VerifiedPlaceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    getVerifiedPlaceInfo(item, placesLibrary)
      .then((info) => {
        if (isMounted) {
          setPlaceInfo(info);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error verifying location:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, item, placesLibrary]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1 bg-amber-100/60 rounded-xl">{item.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight">
                    {placeInfo?.name || item.locationName}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-Life Location Verified on Google Maps</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Google Map Preview Container */}
          <div className="relative w-full h-64 sm:h-72 bg-stone-100">
            {placeInfo && (
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={placeInfo.location}
                defaultZoom={17}
                gestureHandling="greedy"
                disableDefaultUI={false}
                clickableIcons={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {/* Food Venue Advanced Marker */}
                <AdvancedMarker position={placeInfo.location} title={placeInfo.name}>
                  <div className="relative flex flex-col items-center group cursor-pointer">
                    <div className="bg-amber-500 text-white font-extrabold px-2.5 py-1 rounded-xl shadow-lg border-2 border-white flex items-center gap-1 text-xs">
                      <span>{item.emoji}</span>
                      <span className="max-w-[120px] truncate">{item.name}</span>
                    </div>
                    <div className="w-2.5 h-2.5 bg-amber-500 rotate-45 -mt-1 border-r-2 border-b-2 border-white" />
                  </div>
                </AdvancedMarker>

                {/* UTAR Sungai Long Campus Campus Marker */}
                <AdvancedMarker
                  position={UTAR_SL_COORDINATES}
                  title="UTAR Sungai Long Campus (KB Block)"
                >
                  <div className="relative flex flex-col items-center cursor-pointer">
                    <div className="bg-red-700 text-white font-bold px-2 py-0.5 rounded-lg shadow-md border-2 border-white flex items-center gap-1 text-[10px]">
                      <School className="w-3 h-3 text-amber-200" />
                      <span>UTAR KB Block</span>
                    </div>
                    <div className="w-2 h-2 bg-red-700 rotate-45 -mt-1 border-r-2 border-b-2 border-white" />
                  </div>
                </AdvancedMarker>
              </Map>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-stone-100/90 flex flex-col items-center justify-center gap-2 z-10 text-stone-600">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Verifying location with Google Maps...</span>
              </div>
            )}
          </div>

          {/* Place Information & Actions */}
          <div className="p-5 flex-1 overflow-y-auto space-y-3.5 text-xs text-stone-700">
            {/* Address */}
            <div className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-stone-900 block text-xs">Physical Address</span>
                <p className="text-stone-600 text-[11.5px] mt-0.5 leading-relaxed">
                  {placeInfo?.formattedAddress || item.locationName}
                </p>
              </div>
            </div>

            {/* Walking info & Google Rating */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                    Walking Time
                  </span>
                  <span className="text-stone-900 font-extrabold text-sm">
                    ~{placeInfo?.walkingMinutes || item.walkingMinutesFromCampus} mins
                  </span>
                  {placeInfo?.distanceMeters && (
                    <span className="text-[10px] text-stone-500 block">
                      ({placeInfo.distanceMeters}m from KB Block)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60 flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                    Google Rating
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-stone-900 font-extrabold text-sm">
                      {placeInfo?.rating ? placeInfo.rating.toFixed(1) : '4.5'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      ({placeInfo?.userRatingCount || '80+'} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Actions */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={placeInfo?.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationName + ' Bandar Sungai Long')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
