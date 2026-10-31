/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem } from '../types/food';

export interface VerifiedPlaceInfo {
  name: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
  googleMapsURI: string;
  isOpenNow?: boolean;
  status: 'verified' | 'approximate';
  distanceMeters?: number;
  walkingMinutes: number;
}

// Campus center: UTAR Sungai Long KB Block
export const UTAR_SL_COORDINATES = {
  lat: 3.040183,
  lng: 101.794462,
};

// Known verified coordinates in Bandar Sungai Long commercial hub
const KNOWN_SUNGAI_LONG_LOCATIONS: Record<string, { lat: number; lng: number; address: string; gmapsQuery: string }> = {
  'Jalan SL 1/3': {
    lat: 3.04152,
    lng: 101.79375,
    address: 'Jalan SL 1/3, Bandar Sungai Long, 43000 Kajang, Selangor',
    gmapsQuery: 'Jalan SL 1/3 Bandar Sungai Long Kajang',
  },
  'Jalan SL 1/4': {
    lat: 3.0421,
    lng: 101.7942,
    address: 'Jalan SL 1/4, Bandar Sungai Long, 43000 Kajang, Selangor',
    gmapsQuery: 'Jalan SL 1/4 Bandar Sungai Long Kajang',
  },
  'Jalan SL 1/11': {
    lat: 3.0396,
    lng: 101.7928,
    address: 'Jalan SL 1/11, Bandar Sungai Long, 43000 Kajang, Selangor',
    gmapsQuery: 'Jalan SL 1/11 Bandar Sungai Long Kajang',
  },
  'Jalan SL 1/2': {
    lat: 3.0408,
    lng: 101.7934,
    address: 'Jalan SL 1/2, Bandar Sungai Long, 43000 Kajang, Selangor',
    gmapsQuery: 'Jalan SL 1/2 Bandar Sungai Long Kajang',
  },
  'KB Block': {
    lat: 3.040183,
    lng: 101.794462,
    address: 'UTAR Sungai Long Campus, Jalan Sungai Long, Bandar Sungai Long, 43000 Kajang, Selangor',
    gmapsQuery: 'UTAR Sungai Long Campus KB Block',
  },
};

// Cache to prevent duplicate Google Maps API calls
const placeCache = new Map<string, VerifiedPlaceInfo>();

/**
 * Calculates straight-line distance in meters between two coordinates (Haversine formula)
 */
export function calculateDistanceMeters(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Generates an accurate Google Maps verified place info for a given FoodItem.
 * Queries Google Maps Places library (Places API New) when available,
 * and seamlessly provides accurate real-world coordinates and direct Google Maps navigation links.
 */
export async function getVerifiedPlaceInfo(
  item: FoodItem,
  placesLibrary?: typeof google.maps.places | null
): Promise<VerifiedPlaceInfo> {
  const cacheKey = `${item.id}-${item.locationName}`;
  if (placeCache.has(cacheKey)) {
    return placeCache.get(cacheKey)!;
  }

  // Parse street clue from locationName, e.g. "Sungai Long Famous Pan Mee (Jalan SL 1/3)"
  let defaultCoord = { lat: 3.0412, lng: 101.7938 };
  let defaultAddress = `${item.locationName}, Bandar Sungai Long, 43000 Kajang, Selangor`;

  for (const [streetKey, streetData] of Object.entries(KNOWN_SUNGAI_LONG_LOCATIONS)) {
    if (item.locationName.includes(streetKey)) {
      defaultCoord = { lat: streetData.lat, lng: streetData.lng };
      defaultAddress = `${item.locationName.split('(')[0].trim()}, ${streetData.address}`;
      break;
    }
  }

  const queryForGmaps = encodeURIComponent(
    `${item.locationName.replace(/[()]/g, ' ')} Bandar Sungai Long Selangor`
  );
  const fallbackURI = `https://www.google.com/maps/search/?api=1&query=${queryForGmaps}`;

  // Try real-time Google Maps Places API New if library is loaded
  if (placesLibrary?.Place?.searchByText) {
    try {
      const searchResponse = await placesLibrary.Place.searchByText({
        textQuery: `${item.locationName} Bandar Sungai Long`,
        fields: [
          'displayName',
          'formattedAddress',
          'location',
          'rating',
          'userRatingCount',
          'googleMapsURI',
          'regularOpeningHours',
        ],
        locationBias: UTAR_SL_COORDINATES,
        maxResultCount: 1,
      });

      if (searchResponse.places && searchResponse.places.length > 0) {
        const place = searchResponse.places[0];
        let placeLat = defaultCoord.lat;
        let placeLng = defaultCoord.lng;

        if (place.location) {
          const loc = place.location as { lat?: number | (() => number); lng?: number | (() => number) };
          if (typeof loc.lat === 'function') {
            placeLat = loc.lat();
          } else if (typeof loc.lat === 'number') {
            placeLat = loc.lat;
          }

          if (typeof loc.lng === 'function') {
            placeLng = loc.lng();
          } else if (typeof loc.lng === 'number') {
            placeLng = loc.lng;
          }
        }

        const resolvedLocation: { lat: number; lng: number } = { lat: placeLat, lng: placeLng };
        const dist = calculateDistanceMeters(UTAR_SL_COORDINATES, resolvedLocation);

        const verifiedInfo: VerifiedPlaceInfo = {
          name: place.displayName || item.locationName,
          formattedAddress: place.formattedAddress || defaultAddress,
          location: resolvedLocation,
          rating: place.rating || undefined,
          userRatingCount: place.userRatingCount || undefined,
          googleMapsURI: place.googleMapsURI || fallbackURI,
          status: 'verified',
          distanceMeters: dist,
          walkingMinutes: Math.max(1, Math.round(dist / 75)), // ~75m per min average student walk
        };

        placeCache.set(cacheKey, verifiedInfo);
        return verifiedInfo;
      }
    } catch (err) {
      console.warn('Google Maps Places lookup fallback:', err);
    }
  }

  // Baseline accurate Sungai Long place
  const dist = calculateDistanceMeters(UTAR_SL_COORDINATES, defaultCoord);
  const baselineInfo: VerifiedPlaceInfo = {
    name: item.locationName,
    formattedAddress: defaultAddress,
    location: defaultCoord,
    googleMapsURI: fallbackURI,
    status: 'approximate',
    distanceMeters: dist,
    walkingMinutes: item.walkingMinutesFromCampus || Math.max(1, Math.round(dist / 75)),
  };

  placeCache.set(cacheKey, baselineInfo);
  return baselineInfo;
}
