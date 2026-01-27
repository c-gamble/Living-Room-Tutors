-- Migration: Add match_type and match_score columns to matches table
-- Run this on existing databases to add auto-matching support

-- Add match_type column (defaults to 'manual' for backwards compatibility)
ALTER TABLE "matches"
ADD COLUMN IF NOT EXISTS "match_type" varchar(20) DEFAULT 'manual';

-- Add match_score column (nullable for manual matches)
ALTER TABLE "matches"
ADD COLUMN IF NOT EXISTS "match_score" integer;

-- Update existing matches to have 'manual' type if null
UPDATE "matches" SET match_type = 'manual' WHERE match_type IS NULL;
