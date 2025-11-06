-- Database schema for portfolio website

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- NULL allowed for OAuth users
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  technologies TEXT[] NOT NULL,
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  image_urls TEXT[],
  year INTEGER NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'completed', -- 'in-progress', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project likes table
CREATE TABLE IF NOT EXISTS project_likes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Project comments table
CREATE TABLE IF NOT EXISTS project_comments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(year);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Note: This schema file is for reference only.
-- Actual tables are created by /api/admin/setup endpoint.

-- CV data table
CREATE TABLE IF NOT EXISTS cv_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  website VARCHAR(500),
  avatar_url TEXT,
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  about TEXT NOT NULL,
  skills_frontend TEXT[],
  skills_tools TEXT[],
  skills_backend TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work experience table
CREATE TABLE IF NOT EXISTS cv_experience (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER REFERENCES cv_data(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  period VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE IF NOT EXISTS cv_education (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER REFERENCES cv_data(id) ON DELETE CASCADE,
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  period VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Languages table
CREATE TABLE IF NOT EXISTS cv_languages (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER REFERENCES cv_data(id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL,
  level VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_cv_experience_cv_id ON cv_experience(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_cv_id ON cv_education(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_languages_cv_id ON cv_languages(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_data_active ON cv_data(is_active);

-- Initial setup is handled by /api/admin/setup endpoint