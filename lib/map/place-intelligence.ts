// Place intelligence service - merges real-world data with fraud reports

import { OSMPlace, fetchNearbyPlaces, PlaceCategory } from './overpass-service';
import { PlaceSafetyData, getPlaceSafetyData, getBatchSafetyData } from './report-service';

export interface EnhancedPlace extends OSMPlace {
    safetyScore: number;
    riskLevel: 'safe' | 'caution' | 'warning' | 'danger';
    isSentinelVerified: boolean;
    reportCount: number;
    communityRating?: number;
    totalScans?: number;
    threatTypes?: string[];
}

/**
 * Fetch nearby places with integrated safety data
 */
export async function fetchEnhancedNearbyPlaces(
    lat: number,
    lon: number,
    radius: number = 1000,
    category: PlaceCategory = 'all'
): Promise<EnhancedPlace[]> {
    try {
        // Fetch real places from OSM
        const places = await fetchNearbyPlaces(lat, lon, radius, category);

        if (places.length === 0) {
            return [];
        }

        // Fetch safety data for all places in batch
        const placeIds = places.map(p => p.id);
        const safetyDataMap = await getBatchSafetyData(placeIds);

        // Merge place data with safety data
        const enhancedPlaces: EnhancedPlace[] = places.map(place => {
            const safetyData = safetyDataMap.get(place.id);

            if (safetyData) {
                return {
                    ...place,
                    safetyScore: safetyData.safetyScore,
                    riskLevel: safetyData.riskLevel,
                    isSentinelVerified: safetyData.isSentinelVerified,
                    reportCount: safetyData.reportCount,
                    communityRating: safetyData.communityRating,
                    totalScans: safetyData.totalScans,
                    threatTypes: safetyData.recentReports
                        .flatMap(r => r.incidentType)
                        .slice(0, 3)
                };
            }

            // Default safety data if not found
            return {
                ...place,
                safetyScore: 75,
                riskLevel: 'safe' as const,
                isSentinelVerified: false,
                reportCount: 0
            };
        });

        // Sort by safety score (safest first) and then by distance
        return enhancedPlaces.sort((a, b) => {
            // Prioritize Sentinel verified
            if (a.isSentinelVerified && !b.isSentinelVerified) return -1;
            if (!a.isSentinelVerified && b.isSentinelVerified) return 1;

            // Then by safety score
            return b.safetyScore - a.safetyScore;
        });

    } catch (error) {
        console.error('Error fetching enhanced places:', error);
        return [];
    }
}

/**
 * Get detailed information for a specific place
 */
export async function getPlaceDetails(placeId: string, place: OSMPlace): Promise<EnhancedPlace & { safetyData: PlaceSafetyData }> {
    const safetyData = await getPlaceSafetyData(placeId);

    return {
        ...place,
        safetyScore: safetyData.safetyScore,
        riskLevel: safetyData.riskLevel,
        isSentinelVerified: safetyData.isSentinelVerified,
        reportCount: safetyData.reportCount,
        communityRating: safetyData.communityRating,
        totalScans: safetyData.totalScans,
        threatTypes: safetyData.recentReports
            .flatMap(r => r.incidentType)
            .slice(0, 3),
        safetyData
    };
}

/**
 * Get marker color based on risk level
 */
export function getRiskColor(riskLevel: 'safe' | 'caution' | 'warning' | 'danger'): string {
    const colors = {
        safe: '#22c55e',
        caution: '#eab308',
        warning: '#f97316',
        danger: '#ef4444'
    };
    return colors[riskLevel];
}

/**
 * Get marker icon based on category and risk
 */
export function getPlaceMarkerStyle(place: EnhancedPlace) {
    const baseColor = getRiskColor(place.riskLevel);
    const bgOpacity = place.isSentinelVerified ? '0.3' : '0.2';

    return {
        color: baseColor,
        backgroundColor: `${baseColor}${Math.floor(parseFloat(bgOpacity) * 255).toString(16)}`,
        borderColor: baseColor,
        glow: place.riskLevel === 'danger' ? '0 0 20px rgba(239, 68, 68, 0.6)' : 'none',
        pulse: place.riskLevel === 'danger'
    };
}
