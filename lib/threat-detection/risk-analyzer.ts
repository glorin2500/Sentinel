// Real Risk Analysis Engine
// Analyzes UPI IDs for fraud indicators and calculates risk scores

import {
    FRAUD_DATABASE,
    SUSPICIOUS_KEYWORDS,
    RISKY_PATTERNS,
    TRUSTED_MERCHANTS,
    isBlacklisted,
    isTrusted,
    FRAUD_TYPES,
    type FraudEntry
} from './fraud-db';

export interface RiskAnalysis {
    isRisky: boolean;
    riskScore: number; // 0-100
    riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
    fraudType?: string;
    blacklistEntry?: FraudEntry;
    confidence: number; // 0-100
}

export function analyzeUPI(upiId: string): RiskAnalysis {
    const normalized = upiId.toLowerCase().trim();
    let riskScore = 0;
    const reasons: string[] = [];
    let fraudType: string | undefined;
    let blacklistEntry: FraudEntry | undefined;

    // Check 1: Trusted merchant (instant pass)
    if (isTrusted(normalized)) {
        return {
            isRisky: false,
            riskScore: 0,
            riskLevel: 'safe',
            reasons: ['Verified trusted merchant'],
            confidence: 95
        };
    }

    // Check 2: Blacklist database (highest priority)
    const blacklisted = isBlacklisted(normalized);
    if (blacklisted) {
        riskScore += 80;
        reasons.push(`Blacklisted: ${blacklisted.reason}`);
        reasons.push(`Reported ${blacklisted.reportedCount} times`);
        fraudType = blacklisted.fraudType;
        blacklistEntry = blacklisted;
    }

    // Check 3: Suspicious keywords
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(keyword =>
        normalized.includes(keyword.toLowerCase())
    );
    if (foundKeywords.length > 0) {
        riskScore += foundKeywords.length * 15;
        reasons.push(`Suspicious keywords detected: ${foundKeywords.join(', ')}`);
        if (!fraudType) fraudType = 'suspicious_pattern';
    }

    // Check 4: Risky patterns
    const matchedPatterns = RISKY_PATTERNS.filter(pattern =>
        pattern.test(normalized)
    );
    if (matchedPatterns.length > 0) {
        riskScore += matchedPatterns.length * 12;
        reasons.push(`Matches ${matchedPatterns.length} fraud pattern(s)`);
        if (!fraudType) fraudType = 'suspicious_pattern';
    }

    // Check 5: Format validation
    const formatIssues = validateFormat(normalized);
    if (formatIssues.length > 0) {
        riskScore += formatIssues.length * 8;
        reasons.push(...formatIssues);
    }

    // Check 6: Heuristic analysis
    const heuristicScore = performHeuristicAnalysis(normalized);
    riskScore += heuristicScore.score;
    if (heuristicScore.reasons.length > 0) {
        reasons.push(...heuristicScore.reasons);
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine risk level
    const riskLevel = getRiskLevel(riskScore);
    const isRisky = riskScore >= 40; // Threshold for risky

    // Calculate confidence based on number of indicators
    const confidence = Math.min(50 + (reasons.length * 10), 95);

    return {
        isRisky,
        riskScore,
        riskLevel,
        reasons: reasons.length > 0 ? reasons : ['No specific threats detected'],
        fraudType,
        blacklistEntry,
        confidence
    };
}

function validateFormat(upiId: string): string[] {
    const issues: string[] = [];

    // Check for valid UPI format
    if (!upiId.includes('@')) {
        issues.push('Invalid UPI format - missing @ symbol');
    }

    // Check for multiple @ symbols
    if ((upiId.match(/@/g) || []).length > 1) {
        issues.push('Invalid format - multiple @ symbols');
    }

    // Check for suspicious characters
    if (/[<>{}[\]\\|`~]/.test(upiId)) {
        issues.push('Contains suspicious special characters');
    }

    // Check for excessively long UPI
    if (upiId.length > 50) {
        issues.push('Unusually long UPI ID');
    }

    // Check for very short UPI
    if (upiId.length < 5) {
        issues.push('Suspiciously short UPI ID');
    }

    return issues;
}

function performHeuristicAnalysis(upiId: string): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Check for number-only username
    const username = upiId.split('@')[0];
    if (/^\d+$/.test(username)) {
        score += 10;
        reasons.push('Username is only numbers');
    }

    // Check for excessive numbers
    const numberCount = (username.match(/\d/g) || []).length;
    if (numberCount > username.length * 0.7) {
        score += 8;
        reasons.push('Excessive numbers in username');
    }

    // Check for random-looking patterns
    if (/^[a-z]{1,3}\d{5,}$/i.test(username)) {
        score += 12;
        reasons.push('Random pattern detected (e.g., abc12345)');
    }

    // Check for common scam prefixes
    const scamPrefixes = ['pay', 'send', 'transfer', 'collect', 'receive'];
    if (scamPrefixes.some(prefix => username.startsWith(prefix))) {
        score += 10;
        reasons.push('Suspicious prefix detected');
    }

    // Check for urgency indicators
    if (/now|asap|quick|fast|instant/i.test(upiId)) {
        score += 8;
        reasons.push('Urgency tactics detected');
    }

    return { score, reasons };
}

function getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'safe';
}

// Get human-readable risk description
export function getRiskDescription(analysis: RiskAnalysis): string {
    if (analysis.fraudType && FRAUD_TYPES[analysis.fraudType]) {
        return FRAUD_TYPES[analysis.fraudType];
    }

    switch (analysis.riskLevel) {
        case 'critical':
            return 'Critical threat detected - DO NOT PROCEED';
        case 'high':
            return 'High risk of fraud - Exercise extreme caution';
        case 'medium':
            return 'Moderate risk detected - Verify before proceeding';
        case 'low':
            return 'Low risk - Proceed with caution';
        default:
            return 'No significant threats detected';
    }
}

// Get recommended action
export function getRecommendedAction(analysis: RiskAnalysis): string {
    switch (analysis.riskLevel) {
        case 'critical':
            return 'BLOCK - Do not proceed with this transaction';
        case 'high':
            return 'WARNING - Verify merchant identity before proceeding';
        case 'medium':
            return 'CAUTION - Double-check details before payment';
        case 'low':
            return 'PROCEED - But stay vigilant';
        default:
            return 'SAFE - Transaction appears legitimate';
    }
}
