# Security Audit Report: Coup de Pouce Application

**Date:** August 8, 2026  
**Severity:** CRITICAL  
**Issue:** Row-Level Security (RLS) Not Enabled

---

## Executive Summary

Your Supabase database currently has **no Row-Level Security enabled** on any tables. This is a **critical security vulnerability** that allows anyone with your project URL to read, modify, or delete all data in your database.

---

## Current Security State

### Critical Vulnerabilities

1. **No RLS Protection on Any Table**
   - `users` - Contains email, password_hash, personal data
   - `demands` - Contains client requests and personal info
   - `proposals` - Contains artisan proposals and pricing
   - `messages` - Contains private user communications
   - `subscriptions` - Contains payment and subscription data
   - `artisan_profiles` - Contains artisan professional data

2. **Service Role Key Exposure in API Routes**
   - All API routes use `SUPABASE_SERVICE_ROLE_KEY`
   - This key bypasses all RLS restrictions
   - Currently necessary due to custom auth system
   - If leaked, gives full database access

3. **Custom Authentication System**
   - Not using Supabase Auth
   - Custom password hashing with bcrypt
   - Email-based authentication
   - No JWT token validation at database level

---

## API Routes Security Analysis

### Routes Using Service Role Key (Bypassing RLS)

| Route | Endpoint | Risk Level | Notes |
|-------|----------|------------|-------|
| `demands/route.ts` | GET/POST | HIGH | Reads/creates demands, includes user data |
| `proposals/route.ts` | GET/POST | HIGH | Reads/creates proposals, sends messages |
| `messages/conversations/route.ts` | GET | CRITICAL | Reads all user messages |
| `messages/send/route.ts` | POST | CRITICAL | Creates messages between users |
| `subscriptions/route.ts` | GET/POST/PUT | HIGH | Access to payment/subscription data |
| `auth/login/route.ts` | POST | MEDIUM | Password verification, user lookup |
| `auth/signup/route.ts` | POST | MEDIUM | User creation, password hashing |
| `public-demands/route.ts` | GET | MEDIUM | Public demand access with user data |
| `artisan/get-profile/route.ts` | GET | MEDIUM | Profile data access |

### Security Concerns by Route

#### 1. `demands/route.ts`
- **Issue:** Returns user email, name, phone in public view
- **Risk:** PII exposure through public endpoint
- **Mitigation:** Limit public fields, remove sensitive user data

#### 2. `messages/conversations/route.ts`
- **Issue:** No authentication check on userId parameter
- **Risk:** Anyone can query any user's conversations by guessing userId
- **Mitigation:** Add authentication verification

#### 3. `messages/send/route.ts`
- **Issue:** No authentication verification of sender/receiver
- **Risk:** Anyone can send messages as any user
- **Mitigation:** Verify sender identity from session/token

#### 4. `public-demands/route.ts`
- **Issue:** Exposes client email, name, phone publicly
- **Risk:** PII exposure to anyone
- **Mitigation:** Remove or anonymize user data

#### 5. `artisan/get-profile/route.ts`
- **Issue:** No authentication check on userId header
- **Risk:** Anyone can query any artisan's profile
- **Mitigation:** Verify user identity

---

## Authentication System Analysis

### Current Implementation

**Custom Authentication Flow:**
1. User signs up via `/api/auth/signup`
2. Password hashed with bcrypt (10 rounds)
3. User stored in `users` table
4. Login via `/api/auth/login`
5. Email/password verification bcrypt
6. User data returned to frontend
7. User stored in localStorage (client-side)

**Security Issues:**

1. **No Session Management**
   - User data stored in localStorage
   - No server-side session validation
   - No token expiration
   - Vulnerable to XSS attacks

2. **No Request Authentication**
   - API routes rely on headers (`x-user-email`, `x-user-id`)
   - Headers can be spoofed
   - No cryptographic verification of user identity

3. **Password Handling**
   - Legacy support for plain text passwords (for migration)
   - Auto-upgrades to bcrypt on successful login
   - Good practice, but legacy support creates risk

4. **No Rate Limiting**
   - No protection against brute force attacks
   - No account lockout mechanism
   - No CAPTCHA for suspicious activity

---

## Recommended Security Improvements

### Immediate Actions (Critical)

1. **Enable RLS Using Provided Script**
   - Run `scripts/enable-rls-policies.sql` in Supabase SQL editor
   - This enables basic protection while maintaining API functionality
   - Service role bypass allows current API routes to continue working

2. **Add Authentication Verification to API Routes**
   - Implement JWT token validation
   - Verify user identity on every request
   - Remove reliance on spoofable headers

3. **Remove Sensitive Data from Public Endpoints**
   - Remove email, phone from `public-demands` endpoint
   - Anonymize user data in public views
   - Only expose necessary information

### Medium-Term Improvements (High Priority)

4. **Implement Proper Session Management**
   - Use HTTP-only cookies for session tokens
   - Implement JWT with expiration
   - Add refresh token mechanism
   - Remove localStorage usage

5. **Add Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Add account lockout after failed attempts
   - Consider CAPTCHA for suspicious activity

6. **Add Input Validation**
   - Validate all user inputs
   - Sanitize data before database operations
   - Implement SQL injection protection (though Supabase helps here)

### Long-Term Improvements (Recommended)

7. **Migrate to Supabase Auth**
   - Leverage built-in authentication
   - Simplify RLS policies using `auth.uid()`
   - Remove service role dependency from client operations
   - Better security out of the box

8. **Implement Audit Logging**
   - Log all database modifications
   - Track user actions
   - Monitor for suspicious activity

9. **Add Data Encryption**
   - Encrypt sensitive fields at rest
   - Use TLS for all communications
   - Consider field-level encryption for PII

---

## Migration Path to Supabase Auth

### Option 1: Gradual Migration (Recommended)

**Phase 1: Add Supabase Auth Alongside Custom Auth**
- Keep existing custom auth system
- Add Supabase Auth as optional login method
- Migrate users gradually
- Test thoroughly before switching

**Phase 2: Update RLS Policies**
- Replace custom auth checks with `auth.uid()`
- Remove service role bypass where possible
- Keep service role for admin operations only

**Phase 3: Deprecate Custom Auth**
- Force all new users to Supabase Auth
- Require existing users to reset password
- Remove custom auth endpoints
- Clean up legacy code

### Option 2: Complete Migration (Faster but Riskier)

- Switch all authentication to Supabase Auth immediately
- Require all users to reset passwords
- Update all RLS policies at once
- Higher risk of user churn and issues

---

## Testing Checklist

After implementing security improvements:

- [ ] Verify RLS policies are active
- [ ] Test that users can only access their own data
- [ ] Test that API routes still function correctly
- [ ] Verify public endpoints don't expose sensitive data
- [ ] Test authentication verification on all routes
- [ ] Verify rate limiting works
- [ ] Test session management
- [ ] Verify JWT token expiration
- [ ] Test audit logging
- [ ] Perform penetration testing

---

## Compliance Considerations

### GDPR (EU)
- User consent for data processing
- Right to data deletion
- Data portability
- Data breach notification within 72 hours

### Data Protection
- Encrypt PII at rest and in transit
- Implement data retention policies
- Provide user data export functionality
- Allow account deletion

---

## Conclusion

The current security posture is **critical** due to:
1. No RLS protection on any tables
2. Service role key exposure in API routes
3. Weak authentication system
4. No session management
5. Sensitive data exposure in public endpoints

**Immediate action required:** Enable RLS using the provided script and add authentication verification to API routes.

**Long-term recommendation:** Migrate to Supabase Auth for better security and simpler RLS policies.

---

## Files Created

1. `scripts/enable-rls-policies.sql` - RLS policies for custom auth system
2. `SECURITY_AUDIT_REPORT.md` - This document

## Next Steps

1. Review this security audit
2. Run the RLS script in Supabase SQL editor
3. Implement authentication verification in API routes
4. Remove sensitive data from public endpoints
5. Consider migration to Supabase Auth
6. Implement session management
7. Add rate limiting
8. Perform security testing

---

**Report generated by:** Cascade AI Assistant  
**Contact:** For questions about this audit, review the codebase or consult security documentation.
