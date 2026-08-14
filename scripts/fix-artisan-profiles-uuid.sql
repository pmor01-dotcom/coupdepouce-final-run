-- ================================================================
-- FIX ARTISAN PROFILES FOR UUID MISMATCH
-- ================================================================
-- This script handles the UUID vs INTEGER mismatch between users and artisan_profiles
-- Run this in Supabase SQL Editor to fix the issue
-- ================================================================

-- First, check if artisan_profiles table needs to be recreated with UUID id
-- Drop the existing table if it has INTEGER id
DROP TABLE IF EXISTS artisan_profiles CASCADE;

-- Recreate artisan_profiles table with UUID id to match users table
CREATE TABLE "artisan_profiles" (
    "id" UUID PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
    "trade" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "experience_years" INTEGER,
    "specialties" TEXT[],
    "description" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX "artisan_profiles_id_idx" ON "artisan_profiles"("id");

-- Insert artisan profiles for all existing artisans
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
WHERE u.role = 'artisan' OR u.role = 'ARTISAN';

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
