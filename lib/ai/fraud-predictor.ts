import { ScanResult } from '../store';

export interface AIPrediction {
    confidence: number; // 0-100
    factors: string[];
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
}

interface ScanInput {
    upiId: string;
    merchantName?: string;
    amount?: number;
    location?: {
        city?: string;
        region?: string;
    };
    timestamp?: number;
}

/**
 * AI-powered fraud prediction using pattern recognition
 */
export function predictFraud(
    scan: ScanInput,
    historicalScans: ScanResult[],
    merchantScanCount: Record<string, number>
): AIPrediction {
    const factors: string[] = [];
    let riskScore = 0;

    // 1. UPI ID Pattern Analysis (30 points)
    const upiRisk = analyzeUPIPattern(scan.upiId);
    riskScore += upiRisk.score;
    if (upiRisk.factors.length > 0) {
        factors.push(...upiRisk.factors);
    }

    // 2. Merchant Familiarity (20 points)
    const scanCount = merchantScanCount[scan.upiId] || 0;
    if (scanCount === 0) {
        riskScore += 15;
        factors.push('First time scanning this merchant');
    } else if (scanCount < 3) {
        riskScore += 8;
        factors.push(`Only scanned ${scanCount} time${scanCount > 1 ? 's' : ''} before`);
    } else if (scanCount >= 10) {
        riskScore -= 10; // Bonus for familiar merchants
        factors.push(`Trusted merchant (${scanCount} previous scans)`);
    }

    // 3. Amount Analysis (25 points)
    if (scan.amount) {
        const amountRisk = analyzeAmount(scan.amount, scan.upiId, historicalScans);
        riskScore += amountRisk.score;
        if (amountRisk.factors.length > 0) {
            factors.push(...amountRisk.factors);
        }
    }

    // 4. Time Pattern Analysis (15 points)
    const timeRisk = analyzeTimePattern(scan.timestamp || Date.now(), historicalScans);
    riskScore += timeRisk.score;
    if (timeRisk.factors.length > 0) {
        factors.push(...timeRisk.factors);
    }

    // 5. Historical Risk (10 points)
    const historyRisk = analyzeHistoricalRisk(scan.upiId, historicalScans);
    riskScore += historyRisk.score;
    if (historyRisk.factors.length > 0) {
        factors.push(...historyRisk.factors);
    }

    // Normalize score to 0-100
    const confidence = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (confidence < 30) {
        riskLevel = 'low';
    } else if (confidence < 60) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'high';
    }

    // Generate recommendation
    const recommendation = generateRecommendation(confidence, factors);

    return {
        confidence,
        factors,
        recommendation,
        riskLevel
    };
}

function analyzeUPIPattern(upiId: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Check for suspicious patterns
    if (/\d{10,}/.test(upiId)) {
        score += 10;
        factors.push('UPI ID contains long number sequence');
    }

    if (/[A-Z]{5,}/.test(upiId)) {
        score += 8;
        factors.push('UPI ID has unusual uppercase pattern');
    }

    if (upiId.includes('test') || upiId.includes('temp') || upiId.includes('fake')) {
        score += 20;
        factors.push('UPI ID contains suspicious keywords');
    }

    // Check for common legitimate patterns
    if (/@paytm|@phonepe|@googlepay|@ybl|@okaxis|@okicici|@okhdfcbank/.test(upiId)) {
        score -= 10;
        factors.push('Recognized payment provider');
    }

    return { score, factors };
}

function analyzeAmount(
    amount: number,
    upiId: string,
    historicalScans: ScanResult[]
): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Very high amounts are risky
    if (amount > 50000) {
        score += 20;
        factors.push(`High transaction amount: ₹${amount.toLocaleString()}`);
    } else if (amount > 10000) {
        score += 10;
        factors.push(`Significant amount: ₹${amount.toLocaleString()}`);
    }

    // Check against historical amounts for this merchant
    const merchantScans = historicalScans.filter(s => s.upiId === upiId && s.amount);
    if (merchantScans.length > 0) {
        const avgAmount = merchantScans.reduce((sum, s) => sum + (s.amount || 0), 0) / merchantScans.length;

        if (amount > avgAmount * 3) {
            score += 15;
            factors.push(`Amount is 3x higher than usual for this merchant`);
        } else if (amount > avgAmount * 1.5) {
            score += 8;
            factors.push(`Amount is higher than usual for this merchant`);
        }
    }

    // Round numbers can be suspicious
    if (amount % 1000 === 0 && amount > 5000) {
        score += 5;
        factors.push('Exact round number (potential scam pattern)');
    }

    return { score, factors };
}

function analyzeTimePattern(
    timestamp: number,
    historicalScans: ScanResult[]
): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    const hour = new Date(timestamp).getHours();

    // Late night/early morning scans are slightly more risky
    if (hour >= 0 && hour < 6) {
        score += 8;
        factors.push('Unusual time (late night/early morning)');
    }

    // Check for rapid successive scans (potential fraud)
    const recentScans = historicalScans.filter(
        s => timestamp - s.timestamp < 60000 // Within 1 minute
    );

    if (recentScans.length >= 3) {
        score += 12;
        factors.push('Multiple scans in quick succession');
    } else if (recentScans.length >= 2) {
        score += 6;
        factors.push('Rapid scanning detected');
    }

    return { score, factors };
}

function analyzeHistoricalRisk(
    upiId: string,
    historicalScans: ScanResult[]
): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    const merchantScans = historicalScans.filter(s => s.upiId === upiId);
    const riskyScans = merchantScans.filter(s => s.status === 'risky');

    if (riskyScans.length > 0) {
        score += 25;
        factors.push(`Previously flagged as risky (${riskyScans.length} time${riskyScans.length > 1 ? 's' : ''})`);
    }

    // Check if merchant has consistent safe history
    if (merchantScans.length >= 5 && riskyScans.length === 0) {
        score -= 15;
        factors.push('Consistent safe history with this merchant');
    }

    return { score, factors };
}

function generateRecommendation(confidence: number, factors: string[]): string {
    if (confidence >= 70) {
        return 'High risk detected. Verify merchant identity before proceeding. Consider blocking this transaction.';
    } else if (confidence >= 50) {
        return 'Moderate risk. Double-check merchant details and amount before proceeding.';
    } else if (confidence >= 30) {
        return 'Low to moderate risk. Proceed with caution and verify transaction details.';
    } else {
        return 'Low risk detected. Transaction appears safe based on available patterns.';
    }
}

/**
 * Get AI confidence level as a percentage
 */
export function getConfidenceLevel(confidence: number): string {
    if (confidence >= 80) return 'Very High';
    if (confidence >= 60) return 'High';
    if (confidence >= 40) return 'Moderate';
    if (confidence >= 20) return 'Low';
    return 'Very Low';
}

/**
 * Get color for confidence level
 */
export function getConfidenceColor(confidence: number): string {
    if (confidence >= 70) return '#FF6B6B'; // Red
    if (confidence >= 50) return '#FFB84D'; // Orange
    if (confidence >= 30) return '#FFE66D'; // Yellow
    return '#7CFFB2'; // Green
}
