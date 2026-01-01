-- RLS Security Tests for Sentinel Fraud Detection
-- Run these queries to verify Row Level Security is working correctly

-- ============================================
-- Test 1: Verify RLS is enabled
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'transactions', 'fraud_reports', 'merchants');
-- Expected: All tables should have rowsecurity = true

-- ============================================
-- Test 2: Unauthenticated access should fail
-- ============================================
-- These should return 0 rows or error when not authenticated
SELECT * FROM users;
SELECT * FROM transactions;
SELECT * FROM fraud_reports WHERE verified = false;
-- Expected: 0 rows (no auth context)

-- ============================================
-- Test 3: Cross-user data access prevention
-- ============================================
-- After creating two test users, verify User A cannot see User B's data
-- (Run this after authentication is set up)

-- As User A:
-- INSERT INTO transactions (user_id, merchant_name, amount) 
-- VALUES (auth.uid(), 'Test Merchant', 100.00);

-- As User B (different session):
-- SELECT * FROM transactions WHERE user_id != auth.uid();
-- Expected: 0 rows (User B cannot see User A's transactions)

-- ============================================
-- Test 4: Verify triggers are working
-- ============================================
-- Insert a test transaction and verify user stats update
-- (Run after authentication)

-- INSERT INTO transactions (user_id, merchant_name, amount, risk_level) 
-- VALUES (auth.uid(), 'Safe Merchant', 50.00, 'safe');

-- SELECT total_scans, verified_scans, safety_score FROM users WHERE id = auth.uid();
-- Expected: total_scans incremented, verified_scans incremented, safety_score updated

-- ============================================
-- Test 5: Verify indexes are being used
-- ============================================
EXPLAIN ANALYZE 
SELECT * FROM transactions 
WHERE user_id = '00000000-0000-0000-0000-000000000000' 
ORDER BY timestamp DESC 
LIMIT 10;
-- Expected: Should use idx_transactions_user_id and idx_transactions_timestamp

EXPLAIN ANALYZE 
SELECT * FROM fraud_reports 
WHERE location_lat BETWEEN 9.9 AND 10.0 
AND location_lon BETWEEN 76.2 AND 76.3;
-- Expected: Should use idx_fraud_reports_location

-- ============================================
-- Test 6: Verify merchant safety score calculation
-- ============================================
-- Insert test fraud report and verify merchant score updates
-- (Run after authentication)

-- First, create a test merchant
-- INSERT INTO merchants (id, name, upi_id, safety_score) 
-- VALUES ('test_merchant_1', 'Test Merchant', 'test@upi', 100);

-- Submit a fraud report
-- INSERT INTO fraud_reports (reporter_id, merchant_name, merchant_upi, report_types, severity, verified)
-- VALUES (auth.uid(), 'Test Merchant', 'test@upi', ARRAY['scam'], 'high', true);

-- Check if merchant score decreased
-- SELECT safety_score, total_reports, verified_reports FROM merchants WHERE id = 'test_merchant_1';
-- Expected: safety_score < 100, total_reports = 1, verified_reports = 1

-- ============================================
-- Test 7: Public read access for merchants
-- ============================================
-- Merchants should be publicly readable (for map display)
SELECT * FROM merchants LIMIT 5;
-- Expected: Should return rows even without authentication

-- ============================================
-- Test 8: Verify fraud report visibility
-- ============================================
-- Verified reports should be public, unverified should be private
SELECT COUNT(*) FROM fraud_reports WHERE verified = true;
-- Expected: Should return count even without auth

SELECT COUNT(*) FROM fraud_reports WHERE verified = false;
-- Expected: Should return 0 (or only user's own unverified reports if authenticated)

-- ============================================
-- Cleanup (Optional)
-- ============================================
-- Delete test data after verification
-- DELETE FROM fraud_reports WHERE merchant_upi = 'test@upi';
-- DELETE FROM merchants WHERE id = 'test_merchant_1';
-- DELETE FROM transactions WHERE merchant_name = 'Test Merchant';
