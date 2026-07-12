-- Row Level Security (RLS) Policies for the users table
-- Run these in your Supabase SQL Editor to enable proper security

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can only insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Service role can bypass RLS (for admin operations)
-- This is automatically handled by the service role key, no explicit policy needed

-- Alternative: More granular policies based on role
-- Uncomment below if you want role-specific access control

-- Policy: Clients can only read client profiles
-- CREATE POLICY "Clients can read client profiles"
-- ON users
-- FOR SELECT
-- USING (auth.uid() = id AND role = 'CLIENT');

-- Policy: Artisans can only read artisan profiles
-- CREATE POLICY "Artisans can read artisan profiles"
-- ON users
-- FOR SELECT
-- USING (auth.uid() = id AND role = 'ARTISAN');

-- Policy: Clients can only update client profiles
-- CREATE POLICY "Clients can update client profiles"
-- ON users
-- FOR UPDATE
-- USING (auth.uid() = id AND role = 'CLIENT');

-- Policy: Artisans can only update artisan profiles
-- CREATE POLICY "Artisans can update artisan profiles"
-- ON users
-- FOR UPDATE
-- USING (auth.uid() = id AND role = 'ARTISAN');

-- Note: The current application uses role filters in API routes for additional security
-- The RLS policies above provide database-level security as a second layer
