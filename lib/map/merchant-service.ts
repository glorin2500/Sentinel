import { LucideIcon, Shield, AlertTriangle, HelpCircle } from "lucide-react";

export type MerchantStatus = 'safe' | 'risky' | 'unknown';

export interface Merchant {
    id: string;
    name: string;
    upiId: string;
    category: string;
    status: MerchantStatus;
    safetyScore: number;
    rating: number;
    reviews: number;
    latitude: number;
    longitude: number;
    address: string;
    isSentinelApproved: boolean;
    threatType?: string[];
}

// Mock data generator for nearby merchants
export const getNearbyMerchants = (
    centerLat: number,
    centerLng: number,
    radius: number = 2 // km
): Merchant[] => {
    // Generate semi-random merchants around the center
    const merchants: Merchant[] = [
        {
            id: 'm1',
            name: "Fresh Mart Supplies",
            upiId: "freshmart@okicici",
            category: "Groceries",
            status: 'safe',
            safetyScore: 98,
            rating: 4.8,
            reviews: 124,
            latitude: centerLat + 0.002,
            longitude: centerLng + 0.003,
            address: "Near your location",
            isSentinelApproved: true
        },
        {
            id: 'm2',
            name: "Digital Electronics Hub",
            upiId: "digihub_blr@ybl",
            category: "Electronics",
            status: 'risky',
            safetyScore: 45,
            rating: 2.1,
            reviews: 32,
            latitude: centerLat - 0.004,
            longitude: centerLng + 0.002,
            address: "Tech Park Road",
            isSentinelApproved: false,
            threatType: ["Frequent Disputes", "Suspicious Activity"]
        },
        {
            id: 'm3',
            name: "City Pharmacy",
            upiId: "citypharmacy@oksbi",
            category: "Healthcare",
            status: 'safe',
            safetyScore: 92,
            rating: 4.5,
            reviews: 89,
            latitude: centerLat + 0.001,
            longitude: centerLng - 0.005,
            address: "Main Street",
            isSentinelApproved: true
        },
        {
            id: 'm4',
            name: "Quick Recharge Point",
            upiId: "quick_rech@paytm",
            category: "Services",
            status: 'risky',
            safetyScore: 30,
            rating: 1.5,
            reviews: 15,
            latitude: centerLat + 0.006,
            longitude: centerLng + 0.001,
            address: "Station Road",
            isSentinelApproved: false,
            threatType: ["Reported Fraud", "Identity Theft"]
        },
        {
            id: 'm5',
            name: "Coffee & Conversations",
            upiId: "coffee_conv@axl",
            category: "Food & Beverage",
            status: 'safe',
            safetyScore: 88,
            rating: 4.2,
            reviews: 210,
            latitude: centerLat - 0.002,
            longitude: centerLng - 0.003,
            address: "Central Avenue",
            isSentinelApproved: false
        },
        {
            id: 'm6',
            name: "Unknown Vendor #24",
            upiId: "vendor24@upi",
            category: "Retail",
            status: 'unknown',
            safetyScore: 60,
            rating: 0,
            reviews: 0,
            latitude: centerLat + 0.003,
            longitude: centerLng - 0.002,
            address: "Street Market",
            isSentinelApproved: false
        }
    ];

    return merchants;
};
