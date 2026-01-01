// Auto-generated types for Supabase
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string | null
                    phone: string | null
                    full_name: string | null
                    created_at: string
                    last_login: string | null
                    safety_score: number
                    total_scans: number
                    verified_scans: number
                    risky_scans: number
                    total_reports_submitted: number
                    reputation_points: number
                }
                Insert: {
                    id: string
                    email?: string | null
                    phone?: string | null
                    full_name?: string | null
                    created_at?: string
                    last_login?: string | null
                    safety_score?: number
                    total_scans?: number
                    verified_scans?: number
                    risky_scans?: number
                    total_reports_submitted?: number
                    reputation_points?: number
                }
                Update: {
                    id?: string
                    email?: string | null
                    phone?: string | null
                    full_name?: string | null
                    created_at?: string
                    last_login?: string | null
                    safety_score?: number
                    total_scans?: number
                    verified_scans?: number
                    risky_scans?: number
                    total_reports_submitted?: number
                    reputation_points?: number
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    merchant_name: string
                    merchant_upi: string | null
                    merchant_phone: string | null
                    amount: number | null
                    timestamp: string
                    location_lat: number | null
                    location_lon: number | null
                    risk_score: number | null
                    risk_level: 'safe' | 'caution' | 'warning' | 'danger' | null
                    fraud_indicators: Json
                    receipt_url: string | null
                    status: 'pending' | 'verified' | 'flagged' | 'disputed'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    merchant_name: string
                    merchant_upi?: string | null
                    merchant_phone?: string | null
                    amount?: number | null
                    timestamp?: string
                    location_lat?: number | null
                    location_lon?: number | null
                    risk_score?: number | null
                    risk_level?: 'safe' | 'caution' | 'warning' | 'danger' | null
                    fraud_indicators?: Json
                    receipt_url?: string | null
                    status?: 'pending' | 'verified' | 'flagged' | 'disputed'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    merchant_name?: string
                    merchant_upi?: string | null
                    merchant_phone?: string | null
                    amount?: number | null
                    timestamp?: string
                    location_lat?: number | null
                    location_lon?: number | null
                    risk_score?: number | null
                    risk_level?: 'safe' | 'caution' | 'warning' | 'danger' | null
                    fraud_indicators?: Json
                    receipt_url?: string | null
                    status?: 'pending' | 'verified' | 'flagged' | 'disputed'
                    created_at?: string
                    updated_at?: string
                }
            }
            fraud_reports: {
                Row: {
                    id: string
                    transaction_id: string | null
                    reporter_id: string
                    merchant_name: string
                    merchant_upi: string | null
                    merchant_phone: string | null
                    location_lat: number | null
                    location_lon: number | null
                    report_types: string[]
                    description: string | null
                    evidence_urls: string[]
                    severity: 'low' | 'medium' | 'high' | 'critical' | null
                    verified: boolean
                    verified_by: string | null
                    verified_at: string | null
                    upvotes: number
                    downvotes: number
                    status: 'pending' | 'verified' | 'rejected' | 'investigating'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    transaction_id?: string | null
                    reporter_id: string
                    merchant_name: string
                    merchant_upi?: string | null
                    merchant_phone?: string | null
                    location_lat?: number | null
                    location_lon?: number | null
                    report_types: string[]
                    description?: string | null
                    evidence_urls?: string[]
                    severity?: 'low' | 'medium' | 'high' | 'critical' | null
                    verified?: boolean
                    verified_by?: string | null
                    verified_at?: string | null
                    upvotes?: number
                    downvotes?: number
                    status?: 'pending' | 'verified' | 'rejected' | 'investigating'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string | null
                    reporter_id?: string
                    merchant_name?: string
                    merchant_upi?: string | null
                    merchant_phone?: string | null
                    location_lat?: number | null
                    location_lon?: number | null
                    report_types?: string[]
                    description?: string | null
                    evidence_urls?: string[]
                    severity?: 'low' | 'medium' | 'high' | 'critical' | null
                    verified?: boolean
                    verified_by?: string | null
                    verified_at?: string | null
                    upvotes?: number
                    downvotes?: number
                    status?: 'pending' | 'verified' | 'rejected' | 'investigating'
                    created_at?: string
                    updated_at?: string
                }
            }
            merchants: {
                Row: {
                    id: string
                    name: string
                    upi_id: string | null
                    phone: string | null
                    location_lat: number | null
                    location_lon: number | null
                    address: string | null
                    category: string | null
                    osm_id: string | null
                    total_transactions: number
                    total_reports: number
                    verified_reports: number
                    safety_score: number
                    risk_level: 'safe' | 'caution' | 'warning' | 'danger' | null
                    verified_safe: boolean
                    verified_by: string | null
                    last_transaction_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    upi_id?: string | null
                    phone?: string | null
                    location_lat?: number | null
                    location_lon?: number | null
                    address?: string | null
                    category?: string | null
                    osm_id?: string | null
                    total_transactions?: number
                    total_reports?: number
                    verified_reports?: number
                    safety_score?: number
                    risk_level?: 'safe' | 'caution' | 'warning' | 'danger' | null
                    verified_safe?: boolean
                    verified_by?: string | null
                    last_transaction_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    upi_id?: string | null
                    phone?: string | null
                    location_lat?: number | null
                    location_lon?: number | null
                    address?: string | null
                    category?: string | null
                    osm_id?: string | null
                    total_transactions?: number
                    total_reports?: number
                    verified_reports?: number
                    safety_score?: number
                    risk_level?: 'safe' | 'caution' | 'warning' | 'danger' | null
                    verified_safe?: boolean
                    verified_by?: string | null
                    last_transaction_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            update_merchant_safety_score: {
                Args: { merchant_upi_param: string }
                Returns: void
            }
            update_user_safety_score: {
                Args: { user_id_param: string }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
