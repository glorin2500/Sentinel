-- Sentinel Fraud Detection Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    phone TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    safety_score INTEGER DEFAULT 75 CHECK (safety_score >= 0 AND safety_score <= 100),
    total_scans INTEGER DEFAULT 0,
    verified_scans INTEGER DEFAULT 0,
    risky_scans INTEGER DEFAULT 0,
    total_reports_submitted INTEGER DEFAULT 0,
    reputation_points INTEGER DEFAULT 0
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    merchant_name TEXT NOT NULL,
    merchant_upi TEXT,
    merchant_phone TEXT,
    amount DECIMAL(10,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'warning', 'danger')),
    fraud_indicators JSONB DEFAULT '[]'::jsonb,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'disputed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud reports table
CREATE TABLE IF NOT EXISTS fraud_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    merchant_name TEXT NOT NULL,
    merchant_upi TEXT,
    merchant_phone TEXT,
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    report_types TEXT[] NOT NULL,
    description TEXT,
    evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'investigating')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchants table (aggregated data)
CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    upi_id TEXT,
    phone TEXT,
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    address TEXT,
    category TEXT,
    osm_id TEXT,
    total_transactions INTEGER DEFAULT 0,
    total_reports INTEGER DEFAULT 0,
    verified_reports INTEGER DEFAULT 0,
    safety_score INTEGER DEFAULT 75 CHECK (safety_score >= 0 AND safety_score <= 100),
    risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'warning', 'danger')),
    verified_safe BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud patterns (for ML training)
CREATE TABLE IF NOT EXISTS fraud_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_type TEXT NOT NULL,
    indicators JSONB NOT NULL,
    confidence DECIMAL(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    occurrences INTEGER DEFAULT 1,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_level ON transactions(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_merchant_upi ON fraud_reports(merchant_upi);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_location ON fraud_reports(location_lat, location_lon);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_created_at ON fraud_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchants_location ON merchants(location_lat, location_lon);
CREATE INDEX IF NOT EXISTS idx_merchants_safety_score ON merchants(safety_score);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Fraud reports policies
CREATE POLICY "Anyone can view verified reports" ON fraud_reports
    FOR SELECT USING (verified = true OR auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can submit reports" ON fraud_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update own reports" ON fraud_reports
    FOR UPDATE USING (auth.uid() = reporter_id);

-- Merchants policies (public read)
CREATE POLICY "Anyone can view merchants" ON merchants
    FOR SELECT USING (true);

-- Activity log policies
CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Functions

-- Update merchant safety score
CREATE OR REPLACE FUNCTION update_merchant_safety_score(merchant_upi_param TEXT)
RETURNS void AS $$
DECLARE
    total_reports INT;
    verified_reports INT;
    critical_reports INT;
    new_score INT;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE verified = true),
        COUNT(*) FILTER (WHERE severity = 'critical' AND verified = true)
    INTO total_reports, verified_reports, critical_reports
    FROM fraud_reports
    WHERE merchant_upi = merchant_upi_param;
    
    -- Calculate score
    new_score := 100;
    new_score := new_score - (verified_reports * 15);
    new_score := new_score - (critical_reports * 25);
    new_score := GREATEST(0, LEAST(100, new_score));
    
    -- Update merchant
    UPDATE merchants
    SET 
        safety_score = new_score,
        total_reports = total_reports,
        verified_reports = verified_reports,
        risk_level = CASE
            WHEN new_score >= 80 THEN 'safe'
            WHEN new_score >= 60 THEN 'caution'
            WHEN new_score >= 40 THEN 'warning'
            ELSE 'danger'
        END,
        updated_at = NOW()
    WHERE upi_id = merchant_upi_param;
END;
$$ LANGUAGE plpgsql;

-- Update user safety score
CREATE OR REPLACE FUNCTION update_user_safety_score(user_id_param UUID)
RETURNS void AS $$
DECLARE
    safe_count INT;
    risky_count INT;
    total_count INT;
    new_score INT;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE risk_level = 'safe'),
        COUNT(*) FILTER (WHERE risk_level IN ('warning', 'danger')),
        COUNT(*)
    INTO safe_count, risky_count, total_count
    FROM transactions
    WHERE user_id = user_id_param;
    
    IF total_count = 0 THEN
        new_score := 75;
    ELSE
        new_score := ROUND((safe_count::DECIMAL / total_count) * 100);
        -- Penalize risky transactions more
        new_score := new_score - (risky_count * 5);
        new_score := GREATEST(0, LEAST(100, new_score));
    END IF;
    
    UPDATE users
    SET 
        safety_score = new_score,
        total_scans = total_count,
        verified_scans = safe_count,
        risky_scans = risky_count
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Update timestamp on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_reports_updated_at BEFORE UPDATE ON fraud_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update merchant score when report is added/updated
CREATE OR REPLACE FUNCTION trigger_update_merchant_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.merchant_upi IS NOT NULL THEN
        PERFORM update_merchant_safety_score(NEW.merchant_upi);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fraud_report_update_merchant_score 
    AFTER INSERT OR UPDATE ON fraud_reports
    FOR EACH ROW EXECUTE FUNCTION trigger_update_merchant_score();

-- Auto-update user score when transaction is added
CREATE OR REPLACE FUNCTION trigger_update_user_score()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_safety_score(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_update_user_score 
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_score();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Sentinel database schema created successfully! 🎉';
END $$;
