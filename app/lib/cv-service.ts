import postgres from 'postgres';
import { unstable_cache } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
import { CVData } from './types/cv';

async function fetchCVData(): Promise<CVData | null> {
  try {
    console.log('Fetching CV data...');
    // Check for environment variable
    if (!process.env.POSTGRES_URL) {
      console.warn('POSTGRES_URL not found, no data available');
      return null;
    }

    // Check if cv_data table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cv_data'
      )
    `;

    if (!tableExists[0].exists) {
      console.log('cv_data table does not exist');
      return null;
    }

    // Get main CV data
    const cvResult = await sql`
      SELECT * FROM cv_data 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    console.log('CV data query result:', cvResult.length, 'rows');

    if (cvResult.length === 0) {
      console.log('No CV data found in database, returning null');
      return null;
    }

    const cv = cvResult[0];

    // Get work experience
    const experienceResult = await sql`
      SELECT * FROM cv_experience 
      WHERE cv_id = ${cv.id}
      ORDER BY sort_order ASC, created_at DESC
    `;

    // Get education
    const educationResult = await sql`
      SELECT * FROM cv_education 
      WHERE cv_id = ${cv.id}
      ORDER BY sort_order ASC, created_at DESC
    `;

    // Get languages
    const languagesResult = await sql`
      SELECT * FROM cv_languages 
      WHERE cv_id = ${cv.id}
      ORDER BY sort_order ASC
    `;

    // Get projects
    const projectsResult = await sql`
      SELECT * FROM projects
      WHERE featured = true
      ORDER BY year DESC, created_at DESC
    `;

    // Parse avatar URLs array
    let avatarUrls: string[] = [];
    if (cv.avatar_url) {
      try {
        avatarUrls = Array.isArray(cv.avatar_url) ? cv.avatar_url : JSON.parse(cv.avatar_url);
      } catch {
        // If it's a single UUID string, convert to array
        if (typeof cv.avatar_url === 'string' && cv.avatar_url.trim() !== '' && !cv.avatar_url.startsWith('data:')) {
          avatarUrls = [cv.avatar_url];
        }
      }
    }

    // Form CVData object
    const cvData: CVData = {
      id: cv.id.toString(),
      personalInfo: {
        name: cv.name,
        title: cv.title,
        email: cv.email,
        phone: cv.phone || '',
        location: cv.location || '',
        website: cv.website || '',
        avatar: avatarUrls.length > 0 ? avatarUrls.map(url => `/api/images/${url}`) : [],
        github: cv.github_url || '',
        linkedin: cv.linkedin_url || '',
      },
      about: cv.about,
      experience: experienceResult.map(exp => ({
        id: exp.id.toString(),
        title: exp.title,
        company: exp.company,
        period: exp.period,
        description: exp.description,
        current: exp.is_current,
      })),
      education: educationResult.map(edu => ({
        id: edu.id.toString(),
        degree: edu.degree,
        institution: edu.institution,
        period: edu.period,
        description: edu.description,
      })),
      skills: {
        frontend: cv.skills_frontend || [],
        tools: cv.skills_tools || [],
        backend: cv.skills_backend || [],
      },
      languages: languagesResult.map(lang => ({
        language: lang.language,
        level: lang.level,
      })),
      projects: projectsResult.map(proj => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        short_description: proj.short_description,
        technologies: proj.technologies || [],
        github_url: proj.github_url,
        demo_url: proj.demo_url,
        year: proj.year,
        status: proj.status,
      })),
      createdAt: cv.created_at,
      updatedAt: cv.updated_at,
      isActive: cv.is_active,
    };

    return cvData;
  } catch (error: unknown) {
    console.error('Error fetching CV data:', error);
    
    // For any database errors, return null to show proper "no data" state
    console.warn('Database error, returning null');
    return null;
  }
}



// Cached version of the function
export const getCVData = unstable_cache(
  fetchCVData,
  ['cv-data'],
  { 
    revalidate: 3600, // 1 hour
    tags: ['cv']
  }
);

// Function to invalidate CV cache (for admin panel)
export async function revalidateCVData() {
  const { revalidatePath, revalidateTag } = await import('next/cache');
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidateTag('cv', 'default');
}

// Function to clear CV cache completely
export async function clearCVCache() {
  const { revalidatePath, revalidateTag } = await import('next/cache');
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidateTag('cv', 'default');
}
