# Supabase Auth Migration Guide

**Purpose:** Migrate from custom authentication to Supabase Auth for improved security and simplified RLS policies.

---

## Overview

This guide provides a step-by-step approach to migrating your custom authentication system to Supabase Auth. This migration will:

- Improve security with built-in authentication
- Simplify RLS policies using `auth.uid()`
- Remove dependency on service role key for client operations
- Provide better session management
- Enable JWT token validation

---

## Current vs. Supabase Auth Comparison

### Current Custom Auth

**Flow:**
1. User submits email/password to `/api/auth/signup`
2. Server hashes password with bcrypt
3. User stored in custom `users` table
4. Login via `/api/auth/login`
5. Server verifies password
6. User data returned to frontend
7. User stored in localStorage

**Issues:**
- No session management
- No JWT tokens
- Spoofable headers (x-user-email, x-user-id)
- No token expiration
- Vulnerable to XSS attacks

### Supabase Auth

**Flow:**
1. User signs up via Supabase Auth SDK
2. Supabase handles password hashing
3. User stored in Supabase `auth.users` table
4. Custom `users` table synced via trigger
5. Login via Supabase Auth SDK
6. Supabase returns JWT access token
7. Token stored securely (HTTP-only cookie)
8. Token automatically validated on requests

**Benefits:**
- Built-in session management
- Automatic JWT token handling
- Secure token storage
- Token expiration and refresh
- Email verification
- Password reset
- Social login support

---

## Migration Strategy: Two-Phase Approach

### Phase 1: Add Supabase Auth Alongside Custom Auth (Recommended)

**Goal:** Add Supabase Auth without breaking existing users.

**Steps:**

1. **Enable Supabase Auth in Project**
   - Go to Supabase Dashboard → Authentication
   - Enable email/password authentication
   - Configure email templates
   - Enable email verification (optional)

2. **Create User Sync Trigger**
   - Create trigger to sync `auth.users` to custom `users` table
   - Copy user data when Supabase Auth user is created
   - Update trigger on user updates

3. **Add Supabase Auth Login/Signup Pages**
   - Create new login page using Supabase Auth SDK
   - Keep existing custom auth pages for now
   - Add "Switch to new login" option

4. **Update API Routes to Support Both Auth Methods**
   - Check for Supabase Auth token first
   - Fall back to custom auth headers
   - Gradually migrate routes to Supabase Auth

5. **Test Thoroughly**
   - Test new signup flow
   - Test new login flow
   - Test API routes with both auth methods
   - Verify RLS policies work with Supabase Auth

### Phase 2: Complete Migration to Supabase Auth

**Goal:** Deprecate custom auth entirely.

**Steps:**

1. **Require Password Reset for Existing Users**
   - Notify all users of migration
   - Require password reset to switch to Supabase Auth
   - Provide migration deadline

2. **Update RLS Policies**
   - Replace custom auth checks with `auth.uid()`
   - Remove service role bypass where possible
   - Keep service role for admin operations only

3. **Remove Custom Auth Endpoints**
   - Delete `/api/auth/login`
   - Delete `/api/auth/signup`
   - Remove custom auth pages

4. **Clean Up Legacy Code**
   - Remove custom auth logic
   - Remove localStorage usage
   - Remove header-based authentication

5. **Final Testing**
   - Test all user flows
   - Verify security
   - Performance testing

---

## Implementation Details

### Step 1: Enable Supabase Auth

```sql
-- Enable Supabase Auth (done in Dashboard)
-- No SQL needed - configuration in Supabase Dashboard
```

### Step 2: Create User Sync Trigger

```sql
-- Create function to sync auth.users to custom users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (email, name, role, created_at, updated_at)
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Update RLS Policies for Supabase Auth

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies using auth.uid()
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text::integer = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text::integer = id)
WITH CHECK (auth.uid()::text::integer = id);

-- Repeat for other tables...
```

### Step 4: Install Supabase Auth SDK

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Step 5: Create Supabase Client Components

```typescript
// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 6: Create Auth Provider

```typescript
// app/components/SupabaseAuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
```

### Step 7: Create New Login Page

```typescript
// app/login-supabase/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/app/components/SupabaseAuthProvider'
import { useLanguage } from '@/app/components/LanguageProvider'

export default function SupabaseLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useSupabaseAuth()
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">{t('login.title')}</h1>
        
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('login.email')}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('login.password')}
          className="w-full p-2 border rounded mb-4"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          {loading ? t('common.loading') : t('login.button')}
        </button>
      </form>
    </main>
  )
}
```

### Step 8: Update API Routes for Supabase Auth

```typescript
// Example: app/api/demands/route.ts
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query with RLS automatically applied
  const { data, error } = await supabase
    .from('demands')
    .select('*')
    .eq('client_id', user.id)

  return NextResponse.json(data)
}
```

---

## Testing Checklist

### Phase 1 Testing

- [ ] Supabase Auth enabled in dashboard
- [ ] User sync trigger created and tested
- [ ] New signup flow works with Supabase Auth
- [ ] New login flow works with Supabase Auth
- [ ] API routes accept both auth methods
- [ ] Custom auth still works for existing users
- [ ] RLS policies work with both auth methods
- [ ] Session management works correctly
- [ ] Token expiration works

### Phase 2 Testing

- [ ] All users migrated to Supabase Auth
- [ ] Custom auth endpoints removed
- [ ] RLS policies updated to use auth.uid()
- [ ] Service role bypass removed where possible
- [ ] All API routes use Supabase Auth only
- [ ] Legacy code cleaned up
- [ ] Security testing completed
- [ ] Performance testing completed

---

## Rollback Plan

If issues arise during migration:

1. **Phase 1 Rollback**
   - Disable new login/signup pages
   - Keep custom auth as primary
   - Remove Supabase Auth integration
   - Drop user sync trigger

2. **Phase 2 Rollback**
   - Re-enable custom auth endpoints
   - Restore custom auth pages
   - Revert RLS policies
   - Notify users of rollback

---

## Timeline Estimate

- **Phase 1:** 2-3 days
  - Setup: 4 hours
  - Development: 8 hours
  - Testing: 4 hours
  - Deployment: 2 hours

- **Phase 2:** 3-5 days
  - User migration: 1 day
  - RLS updates: 4 hours
  - Code cleanup: 8 hours
  - Testing: 8 hours
  - Deployment: 2 hours

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Migration Guide](https://supabase.com/docs/guides/auth/migrating-to-supabase)

---

## Support

For issues during migration:
1. Check Supabase logs
2. Review RLS policy errors
3. Verify user sync trigger
4. Test with sample user accounts
5. Consult Supabase documentation

---

**Note:** This migration should be done during a maintenance window to minimize user impact. Notify users in advance of any downtime.
