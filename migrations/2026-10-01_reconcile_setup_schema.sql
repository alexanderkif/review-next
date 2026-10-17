-- Reconcile databases initialized by the legacy /api/admin/setup DDL with the
-- canonical schema in app/lib/schema.sql.
--
-- Background: an older setup route created cv_experience / cv_education with
-- position / start_date / end_date, and project_likes / project_comments / users
-- with pre-auth columns. Because CREATE TABLE IF NOT EXISTS never rewrites an
-- existing table, those databases keep the old shape and the app breaks
-- (chat profile fetch, admin reseed, comment/like ownership).
--
-- This migration repairs them in place. It is idempotent and data-preserving:
-- columns are renamed or added and back-filled, while legacy columns are
-- intentionally kept so existing rows are never dropped.

-- ---------------------------------------------------------------------------
-- users: add the email-verification / audit columns used by the auth flow.
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Restrict roles to the canonical set. NOT VALID so pre-existing rows with other
-- values do not abort the migration; validate manually once the data is clean.
DO $$
BEGIN
  IF to_regclass('users') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin')) NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- cv_experience: position -> title, add period + is_current.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('cv_experience') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'cv_experience'
                   AND column_name = 'position')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'cv_experience'
                   AND column_name = 'title') THEN
    ALTER TABLE cv_experience RENAME COLUMN position TO title;
  END IF;
END $$;

ALTER TABLE cv_experience ADD COLUMN IF NOT EXISTS period VARCHAR(100);
ALTER TABLE cv_experience ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- Back-fill period / is_current from the legacy start_date / end_date columns.
DO $$
BEGIN
  IF to_regclass('cv_experience') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'cv_experience'
                   AND column_name = 'start_date') THEN
    UPDATE cv_experience
       SET period = to_char(start_date, 'Mon YYYY')
                    || CASE WHEN end_date IS NULL
                            THEN ' - Present'
                            ELSE ' - ' || to_char(end_date, 'Mon YYYY')
                       END
     WHERE period IS NULL OR period = '';

    UPDATE cv_experience
       SET is_current = (end_date IS NULL)
     WHERE is_current IS NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- cv_education: add period, back-fill from legacy start_date / end_date.
-- ---------------------------------------------------------------------------
ALTER TABLE cv_education ADD COLUMN IF NOT EXISTS period VARCHAR(100);

DO $$
BEGIN
  IF to_regclass('cv_education') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'cv_education'
                   AND column_name = 'start_date') THEN
    UPDATE cv_education
       SET period = to_char(start_date, 'Mon YYYY')
                    || CASE WHEN end_date IS NULL
                            THEN ''
                            ELSE ' - ' || to_char(end_date, 'Mon YYYY')
                       END
     WHERE period IS NULL OR period = '';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- project_likes: keyed by user instead of by IP.
-- ---------------------------------------------------------------------------
ALTER TABLE project_likes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF to_regclass('project_likes') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint
                     WHERE conname = 'project_likes_project_id_user_id_key') THEN
    ALTER TABLE project_likes
      ADD CONSTRAINT project_likes_project_id_user_id_key UNIQUE (project_id, user_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- project_comments: user_id / comment / updated_at instead of author_* / content.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('project_comments') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'project_comments'
                   AND column_name = 'content')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'project_comments'
                   AND column_name = 'comment') THEN
    ALTER TABLE project_comments RENAME COLUMN content TO comment;
  END IF;
END $$;

ALTER TABLE project_comments ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE project_comments ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE project_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------------------------
-- Indexes matching app/lib/schema.sql.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(year);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_cv_experience_cv_id ON cv_experience(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_cv_id ON cv_education(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_languages_cv_id ON cv_languages(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_data_active ON cv_data(is_active);

-- ---------------------------------------------------------------------------
-- Tables created lazily by the app; keep them present after the repair.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) NOT NULL,
  image_data TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT images_entity_type_check CHECK (entity_type IN ('avatar', 'project', 'user'))
);
CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  bucket_key CHAR(64) PRIMARY KEY,
  attempts INTEGER NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_reset_at ON api_rate_limits(reset_at);
