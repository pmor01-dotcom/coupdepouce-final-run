-- Add read_at column to messages table for read receipt functionality
ALTER TABLE "messages" ADD COLUMN "read_at" TIMESTAMP(3);
