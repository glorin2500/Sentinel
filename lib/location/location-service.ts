// Location-based security features

export interface Location {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
}

export interface SafeZone {
    id: string;
    name: string;
    type: 'home' | 'work' | 'custom';
    center: Location;
    radius: number; // in meters
    enabled: boolean;
    alertOnExit?: boolean;
}

export interface MerchantLocation {
    upiId: string;
    merchantName: string;
    location: Location;
    safetyRating: number; // 0-100
    reportCount: number;
    lastReported?: number;
}

export interface LocationHistory {
    scanId: string;
    location: Location;
    timestamp: number;
    merchantName?: string;
    isInSafeZone: boolean;
    safeZoneName?: string;
}

export interface TravelMode {
    enabled: boolean;
    currentRegion?: string;
    homeRegion: string;
    alertThreshold: number; // km from home
}

// Get current location
export async function getCurrentLocation(): Promise<Location | null> {
    if (!('geolocation' in navigator)) {
        console.warn('Geolocation not supported');
        return null;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now()
                });
            },
            (error) => {
                console.error('Location error:', error);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Check if location is within safe zone
export function isInSafeZone(location: Location, safeZones: SafeZone[]): { inZone: boolean; zone?: SafeZone } {
    for (const zone of safeZones.filter(z => z.enabled)) {
        const distance = calculateDistance(location, zone.center);
        if (distance <= zone.radius) {
            return { inZone: true, zone };
        }
    }
    return { inZone: false };
}

// Get nearby merchants (mock data - would be real API in production)
export function getNearbyMerchants(location: Location, radiusKm: number = 5): MerchantLocation[] {
    // Mock data - generate random nearby merchants
    const merchants: MerchantLocation[] = [];
    const count = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < count; i++) {
        // Random offset within radius
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radiusKm * 1000; // Convert to meters

        const latOffset = (distance * Math.cos(angle)) / 111320;
        const lonOffset = (distance * Math.sin(angle)) / (111320 * Math.cos(location.latitude * Math.PI / 180));

        merchants.push({
            upiId: `merchant${i}@paytm`,
            merchantName: `Merchant ${i}`,
            location: {
                latitude: location.latitude + latOffset,
                longitude: location.longitude + lonOffset,
                timestamp: Date.now()
            },
            safetyRating: Math.floor(Math.random() * 40) + 60, // 60-100
            reportCount: Math.floor(Math.random() * 5)
        });
    }

    return merchants.sort((a, b) => b.safetyRating - a.safetyRating);
}

// Detect unusual location
export function detectUnusualLocation(
    currentLocation: Location,
    locationHistory: LocationHistory[],
    travelMode: TravelMode
): { isUnusual: boolean; reason?: string; distance?: number } {
    if (locationHistory.length === 0) {
        return { isUnusual: false };
    }

    // Get most common locations
    const recentLocations = locationHistory.slice(0, 50);

    // Calculate average location
    const avgLat = recentLocations.reduce((sum, l) => sum + l.location.latitude, 0) / recentLocations.length;
    const avgLon = recentLocations.reduce((sum, l) => sum + l.location.longitude, 0) / recentLocations.length;

    const avgLocation: Location = {
        latitude: avgLat,
        longitude: avgLon,
        timestamp: Date.now()
    };

    const distance = calculateDistance(currentLocation, avgLocation);
    const distanceKm = distance / 1000;

    // Check if in travel mode
    if (travelMode.enabled) {
        if (distanceKm > travelMode.alertThreshold) {
            return {
                isUnusual: true,
                reason: `${distanceKm.toFixed(1)}km from your usual area`,
                distance: distanceKm
            };
        }
    } else {
        // Normal mode - stricter threshold
        if (distanceKm > 10) {
            return {
                isUnusual: true,
                reason: `${distanceKm.toFixed(1)}km from your usual area`,
                distance: distanceKm
            };
        }
    }

    return { isUnusual: false };
}

// Get region name from coordinates (mock - would use reverse geocoding API)
export async function getRegionName(location: Location): Promise<string> {
    // Mock implementation
    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];
    return regions[Math.floor(Math.random() * regions.length)];
}

// Location-based fraud alert
export interface LocationFraudAlert {
    id: string;
    location: Location;
    radius: number;
    reportCount: number;
    lastReported: number;
    fraudType: string;
    severity: 'low' | 'medium' | 'high';
}

export function checkLocationFraudAlerts(
    location: Location,
    alerts: LocationFraudAlert[]
): LocationFraudAlert[] {
    return alerts.filter(alert => {
        const distance = calculateDistance(location, alert.location);
        return distance <= alert.radius;
    });
}

// Create safe zone
export function createSafeZone(
    name: string,
    type: 'home' | 'work' | 'custom',
    center: Location,
    radius: number = 500
): SafeZone {
    return {
        id: `zone-${Date.now()}`,
        name,
        type,
        center,
        radius,
        enabled: true,
        alertOnExit: type === 'home' || type === 'work'
    };
}

// Track location history
export function addLocationHistory(
    scanId: string,
    location: Location,
    merchantName: string | undefined,
    safeZones: SafeZone[]
): LocationHistory {
    const { inZone, zone } = isInSafeZone(location, safeZones);

    return {
        scanId,
        location,
        timestamp: Date.now(),
        merchantName,
        isInSafeZone: inZone,
        safeZoneName: zone?.name
    };
}

// Get location statistics
export function getLocationStats(history: LocationHistory[]): {
    totalScans: number;
    inSafeZone: number;
    outsideSafeZone: number;
    uniqueLocations: number;
    mostCommonRegion?: string;
} {
    const inSafeZone = history.filter(h => h.isInSafeZone).length;

    // Approximate unique locations (within 100m)
    const uniqueLocs = new Set<string>();
    history.forEach(h => {
        const key = `${Math.floor(h.location.latitude * 1000)},${Math.floor(h.location.longitude * 1000)}`;
        uniqueLocs.add(key);
    });

    return {
        totalScans: history.length,
        inSafeZone,
        outsideSafeZone: history.length - inSafeZone,
        uniqueLocations: uniqueLocs.size
    };
}
