# Sentinel Supabase Production Setup

## Prerequisites
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Have password manager ready (1Password/Bitwarden)
- [ ] Decide: Email-only OR Email+Phone auth (Phone requires Twilio)

## Step 1: Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. **Name**: sentinel-fraud-detection
3. **Password**: Generate 32-char password, save to password manager
4. **Region**: ap-south-1 (Mumbai) for India/Kerala
5. Wait 2 minutes for initialization

## Step 2: Get Credentials
**Settings → API**
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (server-side ONLY)

## Step 3: Configure Environment
Create `.env.local`:
```env
# Client-side (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server-side (NEVER commit or expose)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Verify**: Run `git status` - `.env.local` should NOT appear

## Step 4: Run Database Schema
**CRITICAL**: Backup first
1. SQL Editor → New Query
2. Paste from `supabase/schema.sql`
3. **Review** RLS policies before running
4. Click Run
5. Verify: `SELECT * FROM users LIMIT 1;` should return empty set

## Step 5: Test RLS Policies
Run these queries to verify security:
```sql
-- Should fail (no auth context)
INSERT INTO users (id, email) VALUES (gen_random_uuid(), 'test@test.com');

-- Should return 0 rows (no user logged in)
SELECT * FROM transactions;
```

## Step 6: Configure Authentication
**Authentication → Providers**

### Email (Required)
- [x] Enable Email provider
- **SMTP**: Settings → Auth → SMTP Settings
  - Use SendGrid/AWS SES (NOT default Supabase SMTP)
  - Test with your email before going live

### Phone (Optional - Complex)
- [ ] Skip for MVP
- If needed: Requires Twilio account + India SMS provider
  - Twilio India requires regulatory approval (2-3 weeks)
  - Alternative: Use email-only for launch

**Rate Limits**: Auth → Rate Limits
- Set: 10 signups/hour per IP
- Set: 5 failed logins before lockout

## Step 7: Enable Connection Pooling
**Settings → Database → Connection Pooling**
- Enable Supavisor (transaction mode)
- Use pooled connection string in production

## Step 8: Verification Checklist
- [ ] Can create user via email
- [ ] RLS prevents cross-user data access
- [ ] Fraud detection queries use indexes (`EXPLAIN ANALYZE`)
- [ ] Backup/restore tested
- [ ] Service role key works for admin operations
- [ ] Email delivery working (check spam folder)

## Production Readiness
Before launch:
- [ ] Custom SMTP configured
- [ ] Rate limiting enabled
- [ ] Audit logs enabled (paid plan)
- [ ] Monitoring alerts set up
- [ ] Point-in-time recovery tested
- [ ] Load test with 100 concurrent fraud checks

## Emergency Contacts
- Database password: [Password Manager]
- Supabase support: support@supabase.com
- Escalation: Supabase Discord (response < 1 hour)
