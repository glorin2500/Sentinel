-- Community Threat Alert System - Database Schema
-- Run this in Supabase SQL Editor

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- Table: community_reports
-- Stores user-reported threats at locations
-- ============================================
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    upi_id TEXT NOT NULL,
    merchant_name TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- PostGIS geography type
    threat_type TEXT NOT NULL CHECK (threat_type IN ('merchant', 'individual', 'atm', 'shop', 'other')),
    fraud_category TEXT CHECK (fraud_category IN ('fake_qr', 'overcharge', 'scam', 'phishing', 'counterfeit', 'other')),
    description TEXT,
    amount_lost DECIMAL(10, 2),
    photo_url TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    vote_score INTEGER DEFAULT 0, -- upvotes - downvotes
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create location from lat/lng automatically
CREATE OR REPLACE FUNCTION update_report_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_location
    BEFORE INSERT OR UPDATE ON community_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_report_location();

-- Update vote_score automatically
CREATE OR REPLACE FUNCTION update_vote_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.vote_score = NEW.upvotes - NEW.downvotes;
    
    -- Auto-verify with 5+ upvotes
    IF NEW.vote_score >= 5 AND NEW.status = 'pending' THEN
        NEW.status = 'verified';
    END IF;
    
    -- Auto-remove with -10 votes
    IF NEW.vote_score <= -10 THEN
        NEW.status = 'removed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_vote_score
    BEFORE UPDATE ON community_reports
    FOR EACH ROW
    WHEN (OLD.upvotes IS DISTINCT FROM NEW.upvotes OR OLD.downvotes IS DISTINCT FROM NEW.downvotes)
    EXECUTE FUNCTION update_vote_score();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON community_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_upi ON community_reports(upi_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON community_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_vote_score ON community_reports(vote_score DESC);

-- ============================================
-- Table: report_votes
-- Tracks user votes on reports
-- ============================================
CREATE TABLE IF NOT EXISTS report_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES community_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, user_id) -- One vote per user per report
);

-- Update report vote counts when vote is added/changed
CREATE OR REPLACE FUNCTION update_report_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE community_reports SET upvotes = upvotes + 1 WHERE id = NEW.report_id;
        ELSE
            UPDATE community_reports SET downvotes = downvotes + 1 WHERE id = NEW.report_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
            UPDATE community_reports SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.report_id;
        ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
            UPDATE community_reports SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.report_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE community_reports SET upvotes = upvotes - 1 WHERE id = OLD.report_id;
        ELSE
            UPDATE community_reports SET downvotes = downvotes - 1 WHERE id = OLD.report_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_report_votes
    AFTER INSERT OR UPDATE OR DELETE ON report_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_report_votes();

CREATE INDEX IF NOT EXISTS idx_votes_report ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON report_votes(user_id);

-- ============================================
-- Table: user_trust_scores
-- Tracks user reputation and trust levels
-- ============================================
CREATE TABLE IF NOT EXISTS user_trust_scores (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    trust_points INTEGER DEFAULT 0,
    trust_level TEXT DEFAULT 'new_user' CHECK (trust_level IN ('new_user', 'trusted', 'verified', 'guardian')),
    accurate_reports INTEGER DEFAULT 0,
    false_reports INTEGER DEFAULT 0,
    total_reports INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0, -- Number of upvotes user's reports received
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculate trust level based on points
CREATE OR REPLACE FUNCTION calculate_trust_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate trust points
    NEW.trust_points = (NEW.accurate_reports * 10) - (NEW.false_reports * 20) + (NEW.helpful_votes * 2);
    
    -- Determine trust level
    IF NEW.trust_points >= 100 THEN
        NEW.trust_level = 'guardian';
    ELSIF NEW.trust_points >= 50 THEN
        NEW.trust_level = 'verified';
    ELSIF NEW.trust_points >= 20 THEN
        NEW.trust_level = 'trusted';
    ELSE
        NEW.trust_level = 'new_user';
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trust_level
    BEFORE UPDATE ON user_trust_scores
    FOR EACH ROW
    EXECUTE FUNCTION calculate_trust_level();

-- ============================================
-- Table: threat_alerts
-- Logs when users are alerted about threats
-- ============================================
CREATE TABLE IF NOT EXISTS threat_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES community_reports(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('proximity', 'scan_match')),
    distance_meters INTEGER,
    was_acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON threat_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_report ON threat_alerts(report_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON threat_alerts(created_at DESC);

-- ============================================
-- Function: get_nearby_threats
-- Find threats within radius of user location
-- ============================================
CREATE OR REPLACE FUNCTION get_nearby_threats(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    upi_id TEXT,
    merchant_name TEXT,
    threat_type TEXT,
    fraud_category TEXT,
    upvotes INTEGER,
    downvotes INTEGER,
    vote_score INTEGER,
    status TEXT,
    distance_meters DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.upi_id,
        cr.merchant_name,
        cr.threat_type,
        cr.fraud_category,
        cr.upvotes,
        cr.downvotes,
        cr.vote_score,
        cr.status,
        ST_Distance(
            cr.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        )::DECIMAL as distance_meters,
        cr.created_at
    FROM community_reports cr
    WHERE 
        cr.status IN ('verified', 'pending')
        AND ST_DWithin(
            cr.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters ASC, cr.vote_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: get_upi_threat_score
-- Calculate threat score for a UPI ID
-- ============================================
CREATE OR REPLACE FUNCTION get_upi_threat_score(target_upi_id TEXT)
RETURNS TABLE (
    upi_id TEXT,
    total_reports INTEGER,
    verified_reports INTEGER,
    total_upvotes INTEGER,
    total_downvotes INTEGER,
    threat_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        target_upi_id as upi_id,
        COUNT(*)::INTEGER as total_reports,
        COUNT(*) FILTER (WHERE status = 'verified')::INTEGER as verified_reports,
        SUM(upvotes)::INTEGER as total_upvotes,
        SUM(downvotes)::INTEGER as total_downvotes,
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (SUM(upvotes)::DECIMAL / GREATEST(COUNT(*), 1)) * 100
        END as threat_score
    FROM community_reports
    WHERE upi_id = target_upi_id
    AND status != 'removed';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_alerts ENABLE ROW LEVEL SECURITY;

-- community_reports policies
CREATE POLICY "Anyone can view non-removed reports"
    ON community_reports FOR SELECT
    USING (status != 'removed');

CREATE POLICY "Authenticated users can create reports"
    ON community_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own reports"
    ON community_reports FOR UPDATE
    TO authenticated
    USING (auth.uid() = reporter_id);

-- report_votes policies
CREATE POLICY "Anyone can view votes"
    ON report_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote"
    ON report_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
    ON report_votes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON report_votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- user_trust_scores policies
CREATE POLICY "Anyone can view trust scores"
    ON user_trust_scores FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own trust score"
    ON user_trust_scores FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- threat_alerts policies
CREATE POLICY "Users can view their own alerts"
    ON threat_alerts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts"
    ON threat_alerts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Initial Setup Complete
-- ============================================
-- Run this script in Supabase SQL Editor
-- Then verify tables were created successfully
