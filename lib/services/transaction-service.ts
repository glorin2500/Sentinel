// @ts-nocheck - Supabase type inference issues with strict mode
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { FraudDetectionEngine, TransactionData, RiskAnalysis } from '../fraud-detection/engine';
import type { Database } from '../supabase/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export class TransactionService {
    /**
     * Create and analyze a new transaction
     */
    static async createTransaction(
        userId: string,
        data: TransactionData
    ): Promise<{ transaction: Transaction; analysis: RiskAnalysis }> {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Perform fraud analysis
        const analysis = await FraudDetectionEngine.analyzeTransaction(userId, data);

        // Prepare transaction data
        const transactionData: TransactionInsert = {
            user_id: userId,
            merchant_name: data.merchantName,
            merchant_upi: data.merchantUPI,
            merchant_phone: data.merchantPhone,
            amount: data.amount,
            timestamp: data.timestamp?.toISOString() || new Date().toISOString(),
            location_lat: data.location?.lat,
            location_lon: data.location?.lon,
            risk_score: analysis.score,
            risk_level: analysis.level,
            fraud_indicators: analysis.indicators as any,
            receipt_url: data.receiptUrl,
            status: analysis.level === 'danger' ? 'flagged' : 'pending'
        };

        // Insert transaction
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

        if (error) throw error;

        // Update or create merchant record
        if (data.merchantUPI || data.merchantName) {
            await this.updateMerchantRecord(data, analysis);
        }

        return { transaction: transaction!, analysis };
    }

    /**
     * Get user's transactions
     */
    static async getUserTransactions(
        userId: string,
        limit: number = 50
    ): Promise<Transaction[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    /**
     * Get transactions by risk level
     */
    static async getTransactionsByRisk(
        userId: string,
        riskLevel: 'safe' | 'caution' | 'warning' | 'danger'
    ): Promise<Transaction[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('risk_level', riskLevel)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get transaction by ID
     */
    static async getTransaction(transactionId: string): Promise<Transaction | null> {
        if (!isSupabaseConfigured()) {
            return null;
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Update transaction status
     */
    static async updateTransactionStatus(
        transactionId: string,
        status: 'pending' | 'verified' | 'flagged' | 'disputed'
    ): Promise<void> {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('transactions')
            .update({ status })
            .eq('id', transactionId);

        if (error) throw error;
    }

    /**
     * Get transaction statistics
     */
    static async getTransactionStats(userId: string) {
        if (!isSupabaseConfigured()) {
            return {
                total: 0,
                safe: 0,
                caution: 0,
                warning: 0,
                danger: 0,
                totalAmount: 0,
                avgAmount: 0
            };
        }

        const { data: transactions } = await supabase
            .from('transactions')
            .select('risk_level, amount')
            .eq('user_id', userId);

        if (!transactions) {
            return {
                total: 0,
                safe: 0,
                caution: 0,
                warning: 0,
                danger: 0,
                totalAmount: 0,
                avgAmount: 0
            };
        }

        const stats = {
            total: transactions.length,
            safe: transactions.filter(t => t.risk_level === 'safe').length,
            caution: transactions.filter(t => t.risk_level === 'caution').length,
            warning: transactions.filter(t => t.risk_level === 'warning').length,
            danger: transactions.filter(t => t.risk_level === 'danger').length,
            totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
            avgAmount: 0
        };

        stats.avgAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

        return stats;
    }

    /**
     * Update or create merchant record
     */
    private static async updateMerchantRecord(
        data: TransactionData,
        analysis: RiskAnalysis
    ): Promise<void> {
        if (!isSupabaseConfigured()) return;

        const merchantId = data.merchantUPI || `merchant_${data.merchantName.toLowerCase().replace(/\s+/g, '_')}`;

        // Check if merchant exists
        const { data: existing } = await supabase
            .from('merchants')
            .select('id')
            .eq('id', merchantId)
            .single();

        if (existing) {
            // Update existing merchant
            await supabase
                .from('merchants')
                .update({
                    total_transactions: supabase.rpc('increment', { x: 1 }) as any,
                    last_transaction_at: new Date().toISOString()
                })
                .eq('id', merchantId);
        } else {
            // Create new merchant
            await supabase.from('merchants').insert({
                id: merchantId,
                name: data.merchantName,
                upi_id: data.merchantUPI,
                phone: data.merchantPhone,
                location_lat: data.location?.lat,
                location_lon: data.location?.lon,
                total_transactions: 1,
                safety_score: 100 - analysis.score,
                risk_level: analysis.level,
                last_transaction_at: new Date().toISOString()
            });
        }
    }
}
