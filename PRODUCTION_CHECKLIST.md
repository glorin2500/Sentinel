# Production Readiness Checklist

## Pre-Launch Security Audit

### Environment & Secrets
- [ ] `.env.local` is in `.gitignore` (verified)
- [ ] Service role key is NEVER prefixed with `NEXT_PUBLIC_`
- [ ] All secrets stored in password manager
- [ ] No hardcoded credentials in codebase
- [ ] Vercel environment variables configured (if deploying)

### Database Security
- [ ] RLS enabled on all tables (run `supabase/rls-tests.sql`)
- [ ] RLS policies tested with multiple users
- [ ] Service role key works for admin operations
- [ ] Database password is 32+ characters
- [ ] Connection pooling enabled (Supavisor)

### Authentication
- [ ] Custom SMTP configured (SendGrid/AWS SES)
- [ ] Email templates customized
- [ ] Rate limiting enabled (10 signups/hour per IP)
- [ ] Failed login lockout configured (5 attempts)
- [ ] Phone auth disabled OR Twilio fully configured
- [ ] Password reset flow tested

### Performance
- [ ] Indexes verified with `EXPLAIN ANALYZE`
- [ ] Connection pooling tested under load
- [ ] Query performance acceptable (< 100ms for fraud checks)
- [ ] Load tested with 100 concurrent users

### Monitoring & Backup
- [ ] Supabase monitoring alerts configured
- [ ] Point-in-time recovery tested
- [ ] Backup restore procedure documented
- [ ] Error tracking setup (Sentry/LogRocket)

### Compliance (for Fraud Detection)
- [ ] Audit logs enabled (paid plan)
- [ ] Data retention policy defined
- [ ] User data export capability tested
- [ ] GDPR compliance reviewed (if applicable)

## Launch Day Checklist

### Final Verification
- [ ] Can create user via email
- [ ] Can submit fraud report
- [ ] Can view nearby threats on map
- [ ] RLS prevents cross-user data access
- [ ] Email delivery working (check spam)
- [ ] Mobile responsive design tested

### Emergency Preparedness
- [ ] Database password accessible in password manager
- [ ] Supabase support contact saved
- [ ] Rollback plan documented
- [ ] On-call person assigned

## Post-Launch Monitoring

### Week 1
- [ ] Monitor signup rate vs email delivery
- [ ] Check for RLS policy violations in logs
- [ ] Verify fraud detection accuracy
- [ ] Monitor database connection pool usage
- [ ] Review slow query logs

### Month 1
- [ ] Analyze fraud detection false positives
- [ ] Review user feedback on safety scores
- [ ] Optimize slow queries
- [ ] Consider upgrading to paid plan if needed
- [ ] Implement additional features from backlog

## Upgrade Path

### When to Upgrade from Free Tier
- 500MB database reached
- 2GB bandwidth exceeded
- Need audit logs for compliance
- Require point-in-time recovery
- Need dedicated compute resources

### Paid Plan Benefits
- Audit logs (compliance)
- Daily backups (vs 7-day on free)
- Dedicated resources
- Priority support
- Custom domain for auth emails
