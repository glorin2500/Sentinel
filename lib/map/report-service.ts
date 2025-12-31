// Fraud reporting and intelligence service for places

export interface FraudReport {
    id: string;
    placeId: string;
    placeName: string;
    reportedBy: string;
    timestamp: number;
    incidentType: string[];
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    verified: boolean;
    upvotes: number;
    downvotes: number;
    evidence?: string[]; // URLs to uploaded evidence
    status: 'pending' | 'verified' | 'dismissed';
}

export interface PlaceSafetyData {
    placeId: string;
    safetyScore: number; // 0-100
    riskLevel: 'safe' | 'caution' | 'warning' | 'danger';
    isSentinelVerified: boolean;
    reportCount: number;
    recentReports: FraudReport[];
    lastUpdated: number;
    communityRating: number;
    totalScans: number;
}

// Mock database - in production, this would be a real backend
const MOCK_REPORTS: FraudReport[] = [
    {
        id: 'r1',
        placeId: 'osm-123456',
        placeName: 'Quick Recharge Center',
        reportedBy: 'user_001',
        timestamp: Date.now() - 86400000 * 2,
        incidentType: ['Overcharging', 'Fake Products'],
        description: 'Sold counterfeit phone accessories at inflated prices',
        severity: 'high',
        verified: true,
        upvotes: 24,
        downvotes: 2,
        status: 'verified'
    },
    {
        id: 'r2',
        placeId: 'osm-789012',
        placeName: 'City Electronics',
        reportedBy: 'user_045',
        timestamp: Date.now() - 86400000 * 7,
        incidentType: ['Scam', 'Identity Theft'],
        description: 'Attempted to collect personal information under false pretenses',
        severity: 'critical',
        verified: true,
        upvotes: 67,
        downvotes: 1,
        status: 'verified'
    }
];

const VERIFIED_SAFE_PLACES = new Set([
    'osm-111111',
    'osm-222222',
    'osm-333333'
]);

/**
 * Get safety data for a specific place
 */
export async function getPlaceSafetyData(placeId: string): Promise<PlaceSafetyData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const reports = MOCK_REPORTS.filter(r => r.placeId === placeId);
    const isSentinelVerified = VERIFIED_SAFE_PLACES.has(placeId);

    const safetyScore = calculateSafetyScore(reports, isSentinelVerified);
    const riskLevel = determineRiskLevel(safetyScore, reports);

    return {
        placeId,
        safetyScore,
        riskLevel,
        isSentinelVerified,
        reportCount: reports.length,
        recentReports: reports.slice(0, 5),
        lastUpdated: Date.now(),
        communityRating: 4.2 + Math.random() * 0.8,
        totalScans: Math.floor(Math.random() * 1000) + 100
    };
}

/**
 * Submit a new fraud report
 */
export async function submitFraudReport(
    placeId: string,
    placeName: string,
    report: Omit<FraudReport, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'status'>
): Promise<FraudReport> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newReport: FraudReport = {
        ...report,
        id: `r${Date.now()}`,
        timestamp: Date.now(),
        upvotes: 0,
        downvotes: 0,
        status: 'pending'
    };

    MOCK_REPORTS.push(newReport);

    return newReport;
}

/**
 * Get all reports for multiple places (batch)
 */
export async function getBatchSafetyData(placeIds: string[]): Promise<Map<string, PlaceSafetyData>> {
    const results = new Map<string, PlaceSafetyData>();

    // In production, this would be a single batch API call
    const promises = placeIds.map(async (id) => {
        const data = await getPlaceSafetyData(id);
        results.set(id, data);
    });

    await Promise.all(promises);
    return results;
}

/**
 * Calculate safety score based on reports and verification
 */
function calculateSafetyScore(reports: FraudReport[], isVerified: boolean): number {
    if (isVerified && reports.length === 0) return 98;
    if (reports.length === 0) return 75;

    let score = 100;

    reports.forEach(report => {
        const weight = report.verified ? 1.5 : 1.0;
        const severityPenalty = {
            low: 5,
            medium: 10,
            high: 20,
            critical: 35
        }[report.severity];

        score -= severityPenalty * weight;
    });

    // Verified places get a boost
    if (isVerified) score += 15;

    return Math.max(0, Math.min(100, score));
}

/**
 * Determine risk level from safety score
 */
function determineRiskLevel(
    score: number,
    reports: FraudReport[]
): 'safe' | 'caution' | 'warning' | 'danger' {
    const hasCriticalReport = reports.some(r => r.severity === 'critical' && r.verified);

    if (hasCriticalReport) return 'danger';
    if (score >= 80) return 'safe';
    if (score >= 60) return 'caution';
    if (score >= 40) return 'warning';
    return 'danger';
}

/**
 * Get incident type options for reporting
 */
export const INCIDENT_TYPES = [
    'Overcharging',
    'Fake Products',
    'Scam',
    'Identity Theft',
    'Phishing',
    'Unauthorized Charges',
    'Poor Service',
    'Suspicious Behavior',
    'Data Breach',
    'Other'
] as const;

export type IncidentType = typeof INCIDENT_TYPES[number];
