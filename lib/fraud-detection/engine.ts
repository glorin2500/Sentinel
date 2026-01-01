import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface TransactionData {
    merchantName: string;
    merchantUPI?: string;
    merchantPhone?: string;
    amount: number;
    location?: { lat: number; lon: number };
    timestamp?: Date;
    receiptUrl?: string;
}

export interface FraudIndicator {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    score: number; // 0-100
}

export interface RiskAnalysis {
    score: number; // 0-100
    level: 'safe' | 'caution' | 'warning' | 'danger';
    indicators: FraudIndicator[];
    confidence: number; // 0-1
    recommendation: string;
}

export class FraudDetectionEngine {
    /**
     * Main fraud detection analysis
     */
    static async analyzeTransaction(
        userId: string,
        data: TransactionData
    ): Promise<RiskAnalysis> {
        const indicators: FraudIndicator[] = [];
        let totalRiskScore = 0;

        // 1. Merchant Reputation Check
        const merchantRisk = await this.checkMerchantReputation(data.merchantUPI, data.merchantName);
        if (merchantRisk) {
            indicators.push(merchantRisk);
            totalRiskScore += merchantRisk.score;
        }

        // 2. Amount Anomaly Detection
        const amountRisk = await this.detectAmountAnomaly(userId, data.amount);
        if (amountRisk) {
            indicators.push(amountRisk);
            totalRiskScore += amountRisk.score;
        }

        // 3. Location Analysis
        if (data.location) {
            const locationRisk = await this.analyzeLocation(data.location);
            if (locationRisk) {
                indicators.push(locationRisk);
                totalRiskScore += locationRisk.score;
            }
        }

        // 4. UPI Pattern Matching
        if (data.merchantUPI) {
            const upiRisk = this.analyzeUPIPattern(data.merchantUPI);
            if (upiRisk) {
                indicators.push(upiRisk);
                totalRiskScore += upiRisk.score;
            }
        }

        // 5. Temporal Pattern Analysis
        const timeRisk = await this.analyzeTimingPattern(userId, data.timestamp || new Date());
        if (timeRisk) {
            indicators.push(timeRisk);
            totalRiskScore += timeRisk.score;
        }

        // 6. Phone Number Analysis
        if (data.merchantPhone) {
            const phoneRisk = this.analyzePhonePattern(data.merchantPhone);
            if (phoneRisk) {
                indicators.push(phoneRisk);
                totalRiskScore += phoneRisk.score;
            }
        }

        // Calculate final score and level
        const finalScore = Math.min(100, totalRiskScore);
        const level = this.calculateRiskLevel(finalScore);
        const confidence = this.calculateConfidence(indicators);

        return {
            score: finalScore,
            level,
            indicators,
            confidence,
            recommendation: this.generateRecommendation(level, indicators)
        };
    }

    /**
     * Check merchant reputation from database
     */
    private static async checkMerchantReputation(
        upi?: string,
        name?: string
    ): Promise<FraudIndicator | null> {
        if (!isSupabaseConfigured()) return null;

        try {
            // Check by UPI first
            let merchant: any = null;
            if (upi) {
                const { data } = await supabase
                    .from('merchants')
                    .select('*')
                    .eq('upi_id', upi)
                    .maybeSingle();
                merchant = data;
            }

            // Fallback to name search
            if (!merchant && name) {
                const { data } = await supabase
                    .from('merchants')
                    .select('*')
                    .ilike('name', `%${name}%`)
                    .limit(1)
                    .maybeSingle();
                merchant = data;
            }

            if (!merchant) return null;

            // Check safety score
            if (merchant.safety_score < 40) {
                return {
                    type: 'merchant_reputation',
                    severity: 'critical',
                    description: `This merchant has a very low safety score (${merchant.safety_score}/100) with ${merchant.verified_reports} verified fraud reports.`,
                    score: 40
                };
            } else if (merchant.safety_score < 60) {
                return {
                    type: 'merchant_reputation',
                    severity: 'high',
                    description: `This merchant has a low safety score (${merchant.safety_score}/100).`,
                    score: 25
                };
            } else if (merchant.total_reports > 5) {
                return {
                    type: 'merchant_reputation',
                    severity: 'medium',
                    description: `This merchant has ${merchant.total_reports} community reports.`,
                    score: 15
                };
            }

            return null;
        } catch (error) {
            console.error('Error checking merchant reputation:', error);
            return null;
        }
    }

    /**
     * Detect unusual transaction amounts
     */
    private static async detectAmountAnomaly(
        userId: string,
        amount: number
    ): Promise<FraudIndicator | null> {
        if (!isSupabaseConfigured()) return null;

        try {
            // Get user's transaction history
            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', userId)
                .not('amount', 'is', null)
                .limit(50);

            if (!transactions || transactions.length < 5) return null;

            // Calculate statistics
            const amounts = transactions.map((t: any) => t.amount!);
            const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
            const stdDev = Math.sqrt(variance);

            // Check if current amount is anomalous (> 3 standard deviations)
            const zScore = Math.abs((amount - mean) / stdDev);

            if (zScore > 3) {
                return {
                    type: 'amount_anomaly',
                    severity: 'high',
                    description: `This amount (₹${amount}) is significantly higher than your usual spending (avg: ₹${mean.toFixed(2)}).`,
                    score: 30
                };
            } else if (zScore > 2) {
                return {
                    type: 'amount_anomaly',
                    severity: 'medium',
                    description: `This amount is higher than your typical transactions.`,
                    score: 15
                };
            }

            return null;
        } catch (error) {
            console.error('Error detecting amount anomaly:', error);
            return null;
        }
    }

    /**
     * Analyze location for high-risk areas
     */
    private static async analyzeLocation(
        location: { lat: number; lon: number }
    ): Promise<FraudIndicator | null> {
        if (!isSupabaseConfigured()) return null;

        try {
            // Check for nearby fraud reports (within 500m)
            const { data: nearbyReports } = await supabase
                .from('fraud_reports')
                .select('severity, verified')
                .gte('location_lat', location.lat - 0.005)
                .lte('location_lat', location.lat + 0.005)
                .gte('location_lon', location.lon - 0.005)
                .lte('location_lon', location.lon + 0.005)
                .eq('verified', true);

            if (!nearbyReports || nearbyReports.length === 0) return null;

            const criticalReports = nearbyReports.filter((r: any) => r.severity === 'critical').length;
            const highReports = nearbyReports.filter((r: any) => r.severity === 'high').length;

            if (criticalReports > 0) {
                return {
                    type: 'location_risk',
                    severity: 'critical',
                    description: `${criticalReports} critical fraud reports in this area recently.`,
                    score: 35
                };
            } else if (highReports > 2) {
                return {
                    type: 'location_risk',
                    severity: 'high',
                    description: `${highReports} high-severity fraud reports nearby.`,
                    score: 25
                };
            } else if (nearbyReports.length > 3) {
                return {
                    type: 'location_risk',
                    severity: 'medium',
                    description: `${nearbyReports.length} fraud reports in this area.`,
                    score: 15
                };
            }

            return null;
        } catch (error) {
            console.error('Error analyzing location:', error);
            return null;
        }
    }

    /**
     * Analyze UPI ID patterns for suspicious indicators
     */
    private static analyzeUPIPattern(upi: string): FraudIndicator | null {
        // Check for suspicious patterns
        const suspiciousPatterns = [
            { pattern: /\d{10,}/, desc: 'UPI contains very long number sequence', score: 20 },
            { pattern: /^[0-9]+@/, desc: 'UPI starts with only numbers', score: 15 },
            { pattern: /test|fake|scam|fraud/i, desc: 'UPI contains suspicious keywords', score: 40 },
            { pattern: /(.)\1{4,}/, desc: 'UPI has repeated characters', score: 10 }
        ];

        for (const { pattern, desc, score } of suspiciousPatterns) {
            if (pattern.test(upi)) {
                return {
                    type: 'upi_pattern',
                    severity: score > 30 ? 'critical' : score > 20 ? 'high' : 'medium',
                    description: desc,
                    score
                };
            }
        }

        return null;
    }

    /**
     * Analyze phone number patterns
     */
    private static analyzePhonePattern(phone: string): FraudIndicator | null {
        // Remove non-digits
        const digits = phone.replace(/\D/g, '');

        // Check for suspicious patterns
        if (digits.length < 10) {
            return {
                type: 'phone_pattern',
                severity: 'medium',
                description: 'Phone number appears incomplete',
                score: 15
            };
        }

        // Check for repeated digits
        if (/(\d)\1{6,}/.test(digits)) {
            return {
                type: 'phone_pattern',
                severity: 'high',
                description: 'Phone number has suspicious repeated digits',
                score: 25
            };
        }

        return null;
    }

    /**
     * Analyze transaction timing patterns
     */
    private static async analyzeTimingPattern(
        userId: string,
        timestamp: Date
    ): Promise<FraudIndicator | null> {
        if (!isSupabaseConfigured()) return null;

        try {
            const hour = timestamp.getHours();

            // Unusual hours (2 AM - 5 AM)
            if (hour >= 2 && hour <= 5) {
                return {
                    type: 'timing_pattern',
                    severity: 'medium',
                    description: 'Transaction at unusual hour (2-5 AM)',
                    score: 10
                };
            }

            // Check for rapid transactions
            const fiveMinutesAgo = new Date(timestamp.getTime() - 5 * 60 * 1000);
            const { data: recentTransactions } = await supabase
                .from('transactions')
                .select('id')
                .eq('user_id', userId)
                .gte('timestamp', fiveMinutesAgo.toISOString())
                .limit(5);

            if (recentTransactions && recentTransactions.length >= 3) {
                return {
                    type: 'timing_pattern',
                    severity: 'high',
                    description: 'Multiple transactions in short time period',
                    score: 25
                };
            }

            return null;
        } catch (error) {
            console.error('Error analyzing timing pattern:', error);
            return null;
        }
    }

    /**
     * Calculate risk level from score
     */
    private static calculateRiskLevel(score: number): 'safe' | 'caution' | 'warning' | 'danger' {
        if (score >= 60) return 'danger';
        if (score >= 40) return 'warning';
        if (score >= 20) return 'caution';
        return 'safe';
    }

    /**
     * Calculate confidence based on indicators
     */
    private static calculateConfidence(indicators: FraudIndicator[]): number {
        if (indicators.length === 0) return 0.5;
        if (indicators.length === 1) return 0.6;
        if (indicators.length === 2) return 0.75;
        if (indicators.length >= 3) return 0.9;
        return 0.8;
    }

    /**
     * Generate recommendation based on analysis
     */
    private static generateRecommendation(
        level: string,
        indicators: FraudIndicator[]
    ): string {
        if (level === 'danger') {
            return '🚨 HIGH RISK: Do not proceed with this transaction. Multiple fraud indicators detected.';
        } else if (level === 'warning') {
            return '⚠️ WARNING: Exercise extreme caution. Verify merchant details before proceeding.';
        } else if (level === 'caution') {
            return '⚡ CAUTION: Some risk indicators present. Double-check transaction details.';
        } else {
            return '✅ SAFE: No significant risk indicators detected. Transaction appears normal.';
        }
    }
}
