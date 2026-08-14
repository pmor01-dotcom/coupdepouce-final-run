-- ================================================================
-- ADD photo_url COLUMN TO artisan_profiles TABLE
-- ================================================================
-- This script adds the photo_url column if it doesn't exist
-- Run this in Supabase SQL Editor to fix the photo upload error
-- ================================================================

-- Add photo_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'artisan_profiles' 
        AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE artisan_profiles ADD COLUMN photo_url TEXT;
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artisan_profiles' 
ORDER BY ordinal_position;
