-- ================================================================
-- BACKFILL MISSING ARTISAN PROFILES
-- ================================================================
-- This script creates artisan_profiles for existing artisans who signed up
-- before the auto-creation feature was implemented.
-- Run this in Supabase SQL Editor to fix missing profiles.
-- ================================================================

-- Insert artisan profiles for artisans who don't have one yet
INSERT INTO artisan_profiles (id, trade, city, phone, experience_years, specialties, description, photo_url)
SELECT 
    u.id,
    COALESCE(u.metier, 'Non spécifié') as trade,
    COALESCE(u.location, 'Non spécifié') as city,
    u.phone,
    NULL as experience_years,
    NULL as specialties,
    NULL as description,
    NULL as photo_url
FROM users u
WHERE 
    (u.role = 'artisan' OR u.role = 'ARTISAN')
    AND NOT EXISTS (
        SELECT 1 
        FROM artisan_profiles ap 
        WHERE ap.id = u.id
    );

-- Verify the profiles were created
SELECT 
    u.id,
    u.name,
    u.role,
    u.metier,
    u.location,
    ap.trade,
    ap.city,
    ap.phone
FROM users u
LEFT JOIN artisan_profiles ap ON u.id = ap.id
WHERE u.role = 'artisan' OR u.role = 'ARTISAN'
ORDER BY u.created_at DESC;
