-- Add a flag that hides projects from the public listings (/projects, featured sections, CV).
-- Idempotent: safe to run on databases that already have the column.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;
