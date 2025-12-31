// Overpass API service for fetching real-world places from OpenStreetMap

export interface OSMPlace {
    id: string;
    name: string;
    category: string;
    type: string;
    lat: number;
    lon: number;
    address?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    amenity?: string;
    shop?: string;
}

export type PlaceCategory = 'all' | 'food' | 'shopping' | 'services' | 'health' | 'finance';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Category to OSM tag mapping
const CATEGORY_QUERIES: Record<PlaceCategory, string> = {
    all: `
        node["shop"](around:RADIUS,LAT,LON);
        node["amenity"~"restaurant|cafe|fast_food|bank|atm|pharmacy|hospital"](around:RADIUS,LAT,LON);
    `,
    food: `
        node["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:RADIUS,LAT,LON);
    `,
    shopping: `
        node["shop"](around:RADIUS,LAT,LON);
    `,
    services: `
        node["amenity"~"bank|atm|post_office"](around:RADIUS,LAT,LON);
        node["shop"~"mobile_phone|electronics"](around:RADIUS,LAT,LON);
    `,
    health: `
        node["amenity"~"pharmacy|hospital|clinic|doctors"](around:RADIUS,LAT,LON);
    `,
    finance: `
        node["amenity"~"bank|atm"](around:RADIUS,LAT,LON);
    `
};

/**
 * Fetch nearby places from OpenStreetMap via Overpass API
 */
export async function fetchNearbyPlaces(
    lat: number,
    lon: number,
    radius: number = 1000, // meters
    category: PlaceCategory = 'all'
): Promise<OSMPlace[]> {
    try {
        const query = CATEGORY_QUERIES[category]
            .replace(/RADIUS/g, radius.toString())
            .replace(/LAT/g, lat.toString())
            .replace(/LON/g, lon.toString());

        const overpassQuery = `[out:json][timeout:25];(${query});out body;`;

        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            body: overpassQuery,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();
        return parseOSMData(data.elements);
    } catch (error) {
        console.error('Error fetching places from Overpass:', error);
        return [];
    }
}

/**
 * Parse OSM data into our Place format
 */
function parseOSMData(elements: any[]): OSMPlace[] {
    return elements
        .filter(el => el.tags && (el.tags.name || el.tags.shop || el.tags.amenity))
        .map(el => {
            const tags = el.tags;
            const category = determineCategory(tags);

            return {
                id: `osm-${el.id}`,
                name: tags.name || tags.shop || tags.amenity || 'Unknown Place',
                category,
                type: tags.shop || tags.amenity || 'place',
                lat: el.lat,
                lon: el.lon,
                address: formatAddress(tags),
                phone: tags.phone || tags['contact:phone'],
                website: tags.website || tags['contact:website'],
                opening_hours: tags.opening_hours,
                amenity: tags.amenity,
                shop: tags.shop
            };
        });
}

/**
 * Determine place category from OSM tags
 */
function determineCategory(tags: any): string {
    if (tags.amenity) {
        if (['restaurant', 'cafe', 'fast_food', 'bar', 'pub'].includes(tags.amenity)) {
            return 'Food & Beverage';
        }
        if (['bank', 'atm'].includes(tags.amenity)) {
            return 'Finance';
        }
        if (['pharmacy', 'hospital', 'clinic', 'doctors'].includes(tags.amenity)) {
            return 'Healthcare';
        }
        if (['post_office'].includes(tags.amenity)) {
            return 'Services';
        }
    }

    if (tags.shop) {
        if (['supermarket', 'convenience', 'grocery'].includes(tags.shop)) {
            return 'Groceries';
        }
        if (['clothes', 'shoes', 'jewelry', 'boutique'].includes(tags.shop)) {
            return 'Fashion';
        }
        if (['electronics', 'mobile_phone', 'computer'].includes(tags.shop)) {
            return 'Electronics';
        }
        return 'Retail';
    }

    return 'Other';
}

/**
 * Format address from OSM tags
 */
function formatAddress(tags: any): string | undefined {
    const parts = [];

    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);

    return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * Get category icon name for UI
 */
export function getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
        'Food & Beverage': 'utensils',
        'Finance': 'building-columns',
        'Healthcare': 'heart-pulse',
        'Services': 'wrench',
        'Groceries': 'shopping-cart',
        'Fashion': 'shirt',
        'Electronics': 'laptop',
        'Retail': 'store',
        'Other': 'map-pin'
    };

    return iconMap[category] || 'map-pin';
}
