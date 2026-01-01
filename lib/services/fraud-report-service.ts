// @ts-nocheck - Supabase type inference issues with strict mode
import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type FraudReport = Database['public']['Tables']['fraud_reports']['Row'];
type FraudReportInsert = Database['public']['Tables']['fraud_reports']['Insert'];

export interface CreateReportData {
    merchantName: string;
    merchantUPI?: string;
    merchantPhone?: string;
    location?: { lat: number; lon: number };
    reportTypes: string[];
    description?: string;
    evidenceUrls?: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    transactionId?: string;
}

export class FraudReportService {
    /**
     * Submit a new fraud report
     */
    static async submitReport(
        userId: string,
        data: CreateReportData
    ): Promise<FraudReport> {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const reportData: FraudReportInsert = {
            reporter_id: userId,
            transaction_id: data.transactionId,
            merchant_name: data.merchantName,
            merchant_upi: data.merchantUPI,
            merchant_phone: data.merchantPhone,
            location_lat: data.location?.lat,
            location_lon: data.location?.lon,
            report_types: data.reportTypes,
            description: data.description,
            evidence_urls: data.evidenceUrls || [],
            severity: data.severity,
            status: 'pending'
        };

        const { data: report, error } = await supabase
            .from('fraud_reports')
            .insert(reportData as any)
            .select()
            .single();

        if (error) throw error;

        // Note: User report count will be updated via database trigger

        return report!;
    }

    /**
     * Get reports for a merchant
     */
    static async getMerchantReports(
        merchantUPI: string,
        verifiedOnly: boolean = false
    ): Promise<FraudReport[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        let query = supabase
            .from('fraud_reports')
            .select('*')
            .eq('merchant_upi', merchantUPI)
            .order('created_at', { ascending: false });

        if (verifiedOnly) {
            query = query.eq('verified', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    /**
     * Get nearby fraud reports
     */
    static async getNearbyReports(
        lat: number,
        lon: number,
        radiusKm: number = 1
    ): Promise<FraudReport[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        // Approximate degree offset for radius
        const latOffset = radiusKm / 111; // 1 degree ≈ 111 km
        const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

        const { data, error } = await supabase
            .from('fraud_reports')
            .select('*')
            .gte('location_lat', lat - latOffset)
            .lte('location_lat', lat + latOffset)
            .gte('location_lon', lon - lonOffset)
            .lte('location_lon', lon + lonOffset)
            .eq('verified', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get user's submitted reports
     */
    static async getUserReports(userId: string): Promise<FraudReport[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        const { data, error } = await supabase
            .from('fraud_reports')
            .select('*')
            .eq('reporter_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Upvote a report
     */
    static async upvoteReport(reportId: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get current upvotes
        const { data: report } = await supabase
            .from('fraud_reports')
            .select('upvotes')
            .eq('id', reportId)
            .single();

        if (!report) return;

        // Increment upvotes
        // @ts-ignore - Supabase type inference issue
        const { error } = await supabase
            .from('fraud_reports')
            .update({ upvotes: (report.upvotes || 0) + 1 })
            .eq('id', reportId);

        if (error) throw error;
    }

    /**
     * Downvote a report
     */
    static async downvoteReport(reportId: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get current downvotes
        const { data: report } = await supabase
            .from('fraud_reports')
            .select('downvotes')
            .eq('id', reportId)
            .single();

        if (!report) return;

        // Increment downvotes
        // @ts-ignore - Supabase type inference issue
        const { error } = await supabase
            .from('fraud_reports')
            .update({ downvotes: (report.downvotes || 0) + 1 })
            .eq('id', reportId);

        if (error) throw error;
    }

    /**
     * Get report statistics
     */
    static async getReportStats() {
        if (!isSupabaseConfigured()) {
            return {
                total: 0,
                verified: 0,
                pending: 0,
                bySeverity: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    critical: 0
                }
            };
        }

        const { data: reports } = await supabase
            .from('fraud_reports')
            .select('verified, severity');

        if (!reports) {
            return {
                total: 0,
                verified: 0,
                pending: 0,
                bySeverity: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    critical: 0
                }
            };
        }

        return {
            total: reports.length,
            verified: reports.filter(r => r.verified).length,
            pending: reports.filter(r => !r.verified).length,
            bySeverity: {
                low: reports.filter(r => r.severity === 'low').length,
                medium: reports.filter(r => r.severity === 'medium').length,
                high: reports.filter(r => r.severity === 'high').length,
                critical: reports.filter(r => r.severity === 'critical').length
            }
        };
    }
}
