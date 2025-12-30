
// Real-world UPI parsing and heuristic analysis

export interface LUPIParsedData {
    vpa: string;         // Virtual Payment Address (pa)
    payeeName: string;   // Payee Name (pn)
    merchantCode?: string; // Merchant Category Code (mc)
    transactionRef?: string; // Transaction Reference (tr)
    originalString: string;
}

export interface WRiskAnalysisResult {
    score: number;       // 0-100 (0 = Safe, 100 = High Risk)
    level: 'safe' | 'moderate' | 'risky';
    reasons: string[];   // Why is it risky?
}

// Trusted Bank Handles
const TRUSTED_HANDLES = [
    'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'pl', 'ybl', 'axl', 'ibl', 'paytm', 'upi'
];

// Suspicious Keywords in VPA (Typosquatting or Social Engineering)
const SUSPICIOUS_KEYWORDS = [
    'support', 'refund', 'cashback', 'offer', 'kyc', 'verify', 'lottery', 'winner',
    'customer', 'service', 'help', 'bank-support', 'paytm-kyc'
];

/**
 * Parses a raw UPI string (e.g., upi://pay?pa=...)
 */
export function parseUPIString(qrString: string): LUPIParsedData | null {
    try {
        if (!qrString.startsWith('upi://')) return null;

        const url = new URL(qrString);
        const params = new URLSearchParams(url.search);

        const vpa = params.get('pa');
        if (!vpa) return null;

        return {
            vpa: vpa.toLowerCase(),
            payeeName: params.get('pn') || 'Unknown',
            merchantCode: params.get('mc') || undefined,
            transactionRef: params.get('tr') || undefined,
            originalString: qrString
        };
    } catch (e) {
        console.error("UPI Parse Error:", e);
        return null;
    }
}

/**
 * a Heuristic engine to analyze VPA for potential fraud
 */
export function analyzeUPIRisk(data: LUPIParsedData): WRiskAnalysisResult {
    let score = 0;
    const reasons: string[] = [];
    const [userPart, handle] = data.vpa.split('@');

    // 1. Handle Verification
    if (!handle || !TRUSTED_HANDLES.includes(handle)) {
        if (!handle) {
            score += 100;
            reasons.push("Invalid format: Missing bank handle");
        } else {
            score += 30;
            reasons.push(`Uncommon bank handle: @${handle}`);
        }
    } else {
        reasons.push(`Verified bank handle: @${handle}`); // Positive reinforcement
    }

    // 2. Keyword Analysis (Social Engineering)
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => userPart.includes(kw));
    if (foundKeywords.length > 0) {
        score += 60;
        reasons.push(`Suspicious keywords found: "${foundKeywords.join(', ')}"`);
        reasons.push("Potential impersonation scan");
    }

    // 3. Randomness / Complexity Check
    // High entropy (random strings) can indicate burner accounts, but simple phones numbers are common.
    const isPhoneNumber = /^\d{10}$/.test(userPart);
    if (isPhoneNumber) {
        // Phone numbers are generally safe P2P
        reasons.push("Linked to Mobile Number (P2P)");
    } else if (userPart.length > 20) {
        score += 20;
        reasons.push("Unusually long VPA identifier");
    }

    // 4. Missing Metadata
    if (!data.payeeName || data.payeeName === 'Unknown') {
        score += 20;
        reasons.push("Missing Payee Name");
    }

    // Final Classification
    let level: 'safe' | 'moderate' | 'risky' = 'safe';
    if (score >= 60) level = 'risky';
    else if (score >= 30) level = 'moderate';

    return {
        score: Math.min(score, 100),
        level,
        reasons
    };
}
