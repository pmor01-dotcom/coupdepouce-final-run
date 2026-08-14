-- ================================================================
-- CHECK ARTISAN PROFILES TABLE SCHEMA AND DATA
-- ================================================================
-- Run this in Supabase SQL Editor to diagnose the issue
-- ================================================================

-- Check artisan_profiles table schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'artisan_profiles'
ORDER BY ordinal_position;

-- Check users table id column type
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';

-- Check if there are any artisan profiles
SELECT COUNT(*) as profile_count FROM artisan_profiles;

-- Check if there are any artisan users
SELECT COUNT(*) as artisan_user_count 
FROM users 
WHERE role = 'artisan' OR role = 'ARTISAN';

-- Check the actual data in artisan_profiles
SELECT * FROM artisan_profiles LIMIT 5;

-- Check artisan users without profiles
SELECT 
    u.id,
    u.name,
    u.role,
    u.metier,
    u.location
FROM users u
WHERE (u.role = 'artisan' OR u.role = 'ARTISAN')
AND NOT EXISTS (
    SELECT 1 
    FROM artisan_profiles ap 
    WHERE ap.id::text = u.id::text
);
