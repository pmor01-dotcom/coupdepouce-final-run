-- ================================================================
-- ADD EMAIL VERIFICATION COLUMNS TO USERS TABLE
-- ================================================================
-- This script adds columns for email verification functionality
-- Run this in Supabase SQL Editor to enable email verification
-- ================================================================

-- Add email verification columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_token'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_token TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_token_expires'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('email_verified', 'verification_token', 'verification_token_expires')
ORDER BY column_name;
