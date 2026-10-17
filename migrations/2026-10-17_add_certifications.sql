-- Add the Certifications field to the active CV profile.
-- Idempotent: safe to run on databases that already have the column.
ALTER TABLE cv_data ADD COLUMN IF NOT EXISTS certifications TEXT;
