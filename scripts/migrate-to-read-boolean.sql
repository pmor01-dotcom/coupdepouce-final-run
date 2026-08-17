-- Migration script to change from read_at DateTime to read boolean field
-- Run this in your Supabase SQL editor

-- Step 1: Add the new read boolean column (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'read'
    ) THEN
        ALTER TABLE "messages" ADD COLUMN "read" BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Step 2: Migrate existing data - if read_at was set, mark as read
UPDATE "messages" 
SET "read" = TRUE 
WHERE "read_at" IS NOT NULL;

-- Step 3: Drop the old read_at column (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE "messages" DROP COLUMN "read_at";
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;