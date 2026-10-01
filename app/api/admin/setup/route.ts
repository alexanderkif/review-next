import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { AdminSetupRequestSchema, validate } from '@/types/schemas';
import { consumeRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

export async function GET() {
  try {
    // Check if admin users exist
    const adminUsers = await sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'admin'
    `;

    const needsSetup = parseInt(adminUsers[0].count) === 0;

    return NextResponse.json({
      needsSetup,
      message: needsSetup ? 'Database setup required' : 'Database is ready',
    });
  } catch {
    // If tables don't exist, setup is needed
    return NextResponse.json({
      needsSetup: true,
      message: 'Database setup required',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ipLimit = await consumeRateLimit(
      'admin-setup-ip',
      getRateLimitIdentifier(request.headers),
      3,
      60 * 60,
    );
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many setup attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } },
      );
    }

    // Сначала проверим, не инициализирована ли уже база
    try {
      const existingUsers = await sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE role = 'admin'
      `;

      if (parseInt(existingUsers[0].count) > 0) {
        return NextResponse.json({ error: 'Database is already initialized' }, { status: 400 });
      }
    } catch {
      // Если таблицы не существуют, продолжаем инициализацию
    }

    const configuredSetupToken = process.env.ADMIN_SETUP_TOKEN;
    if (
      process.env.NODE_ENV === 'production' &&
      (!configuredSetupToken || configuredSetupToken.length < 32)
    ) {
      return NextResponse.json(
        { error: 'Initial administrator setup is not configured' },
        { status: 503 },
      );
    }
    if (configuredSetupToken && configuredSetupToken.length < 32) {
      return NextResponse.json(
        { error: 'ADMIN_SETUP_TOKEN must be at least 32 characters' },
        { status: 503 },
      );
    }

    const validationResult = validate(AdminSetupRequestSchema, await request.json());
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const { name, email, password, setupToken } = validationResult.data;
    if (configuredSetupToken) {
      const configuredTokenBuffer = Buffer.from(configuredSetupToken);
      const providedTokenBuffer = Buffer.from(setupToken ?? '');
      if (
        configuredTokenBuffer.length !== providedTokenBuffer.length ||
        !timingSafeEqual(configuredTokenBuffer, providedTokenBuffer)
      ) {
        return NextResponse.json({ error: 'Invalid setup token' }, { status: 401 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255), -- NULL allowed for OAuth users
        role VARCHAR(50) DEFAULT 'user',
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cv_data (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        location VARCHAR(255),
        website VARCHAR(255),
        avatar_url TEXT,
        github_url VARCHAR(255),
        linkedin_url VARCHAR(255),
        about TEXT,
        skills_frontend TEXT[],
        skills_tools TEXT[],
        skills_backend TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cv_experience (
        id SERIAL PRIMARY KEY,
        cv_id INTEGER REFERENCES cv_data(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        description TEXT,
        technologies TEXT[],
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cv_education (
        id SERIAL PRIMARY KEY,
        cv_id INTEGER REFERENCES cv_data(id) ON DELETE CASCADE,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field_of_study VARCHAR(255),
        start_date DATE NOT NULL,
        end_date DATE,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cv_languages (
        id SERIAL PRIMARY KEY,
        cv_id INTEGER REFERENCES cv_data(id) ON DELETE CASCADE,
        language VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        technologies TEXT[] DEFAULT '{}',
        github_url VARCHAR(255),
        demo_url VARCHAR(255),
        image_urls TEXT[] DEFAULT '{}',
        year INTEGER,
        featured BOOLEAN DEFAULT false,
        hidden BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_likes (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(project_id, ip_address)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_comments (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        ip_address INET,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create images table for lazy loading
    await sql`
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
      )
    `;

    // Create indexes for images table
    await sql`
      CREATE INDEX IF NOT EXISTS idx_images_entity
      ON images(entity_type, entity_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_images_created_at
      ON images(created_at DESC)
    `;

    // AI avatar configuration (persona, extra chat context, model names).
    // API keys stay in environment variables.
    await sql`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        chat_instructions TEXT NOT NULL DEFAULT '',
        chat_extra TEXT NOT NULL DEFAULT '',
        groq_model VARCHAR(120) NOT NULL DEFAULT 'openai/gpt-oss-20b',
        gemini_model VARCHAR(120) NOT NULL DEFAULT 'gemini-3.5-flash-lite',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING
    `;

    // Serialize first-admin creation so concurrent public setup requests cannot both succeed.
    const adminCreated = await sql.begin(async (transaction) => {
      await transaction`SELECT pg_advisory_xact_lock(2026092801::bigint)`;

      const existingAdmins = await transaction`
        SELECT COUNT(*) AS count FROM users WHERE role = 'admin'
      `;
      if (Number(existingAdmins[0].count) > 0) return false;

      await transaction`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${hashedPassword}, 'admin')
      `;
      return true;
    });

    if (!adminCreated) {
      return NextResponse.json({ error: 'Database is already initialized' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      admin: { name, email },
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: 'Database initialization error' }, { status: 500 });
  }
}
