import { NextResponse } from 'next/server';
import postgres from 'postgres';
import type { CVData, ApiError } from '../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(): Promise<NextResponse<CVData | ApiError>> {
  try {
    // Получаем данные CV
    const cvData = await sql`
      SELECT * FROM cv_data 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (cvData.length === 0) {
      return NextResponse.json({ error: 'CV data not found' }, { status: 404 });
    }

    const cv = cvData[0];

    // Получаем опыт работы
    const experience = await sql`
      SELECT * FROM cv_experience 
      WHERE cv_id = ${cv.id} 
      ORDER BY sort_order ASC, created_at DESC
    `;

    // Получаем образование
    const education = await sql`
      SELECT * FROM cv_education 
      WHERE cv_id = ${cv.id} 
      ORDER BY sort_order ASC, created_at DESC
    `;

    // Получаем языки
    const languages = await sql`
      SELECT * FROM cv_languages 
      WHERE cv_id = ${cv.id} 
      ORDER BY sort_order ASC, id DESC
    `;

    // Получаем проекты (все featured проекты)
    const projects = await sql`
      SELECT id, title, short_description, github_url, demo_url, year, status
      FROM projects 
      WHERE featured = true 
      ORDER BY year DESC, created_at DESC
    `;

    return NextResponse.json({
      personalInfo: {
        name: cv.name,
        title: cv.title,
        email: cv.email,
        phone: cv.phone,
        location: cv.location,
        website: cv.website,
        github: cv.github_url,
        linkedin: cv.linkedin_url,
        avatar: (() => {
          if (!cv.avatar_url) return [];

          // Skip empty JSON arrays
          if (cv.avatar_url === '[]') return [];

          try {
            // Handle both array and JSON string formats
            const avatarUrls = Array.isArray(cv.avatar_url)
              ? cv.avatar_url
              : JSON.parse(cv.avatar_url);
            return avatarUrls.map((uuid: string) => `/api/images/${uuid}`);
          } catch {
            // If parsing fails, treat as direct image UUID (legacy format)
            return cv.avatar_url ? [`/api/images/${cv.avatar_url}`] : [];
          }
        })(),
      },
      about: cv.about,
      skills: {
        frontend: cv.skills_frontend || [],
        tools: cv.skills_tools || [],
        backend: cv.skills_backend || [],
      },
      experience: experience.map((exp) => ({
        title: exp.title,
        company: exp.company,
        period: exp.period,
        description: exp.description,
        current: exp.is_current,
      })),
      education: education.map((edu) => ({
        degree: edu.degree,
        institution: edu.institution,
        period: edu.period,
        description: edu.description,
      })),
      languages: languages.map((lang) => ({
        language: lang.language,
        level: lang.level,
      })),
      projects: projects.map((proj) => ({
        title: proj.title,
        description: proj.short_description,
        year: proj.year,
        github_url: proj.github_url,
        demo_url: proj.demo_url,
        status: proj.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching CV data:', error);
    return NextResponse.json({ error: 'Failed to fetch CV data' }, { status: 500 });
  }
}
