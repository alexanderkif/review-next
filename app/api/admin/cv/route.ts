import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { revalidateCVData } from '@/lib/cv-service';
import {
  AdminCVUpdateSchema,
  ExperienceSchema,
  EducationSchema,
  LanguageSchema,
  validate,
} from '@/types/schemas';
import type { ExperienceData, EducationData, LanguageData } from '@/types/schemas';

export async function GET(): Promise<
  NextResponse<
    | {
        cv: Record<string, unknown>;
        experience: ExperienceData[];
        education: EducationData[];
        languages: LanguageData[];
      }
    | { error: string }
  >
> {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    // Get work experience
    const experience = await sql`
      SELECT * FROM cv_experience
      WHERE cv_id = ${cv.id}
      ORDER BY sort_order ASC, created_at DESC
    `;

    // Get education
    const education = await sql`
      SELECT * FROM cv_education
      WHERE cv_id = ${cv.id}
      ORDER BY sort_order ASC, created_at DESC
    `;

    // Get languages
    const languages = await sql`
      SELECT * FROM cv_languages
      WHERE cv_id = ${cv.id}
      ORDER BY sort_order ASC
    `;

    // Validate and transform database results using Zod schemas
    const validatedExperience = experience.map((exp) => ExperienceSchema.parse(exp));
    const validatedEducation = education.map((edu) => EducationSchema.parse(edu));
    const validatedLanguages = languages.map((lang) => LanguageSchema.parse(lang));

    return NextResponse.json({
      cv: cv,
      experience: validatedExperience,
      education: validatedEducation,
      languages: validatedLanguages,
    });
  } catch (error) {
    console.error('Error fetching CV data:', error);
    return NextResponse.json({ error: 'Failed to fetch CV data' }, { status: 500 });
  }
}

// PUT - update main CV data
export async function PUT(request: NextRequest) {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const validationResult = validate(AdminCVUpdateSchema, await request.json());
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid CV data', details: validationResult.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const parsed = validationResult.data;

    // Only pick fields that are actually present (not undefined)
    const name = parsed.name ?? null;
    const title = parsed.title ?? null;
    const email = parsed.email ?? null;
    const phone = parsed.phone ?? null;
    const location = parsed.location ?? null;
    const website = parsed.website ?? null;
    const avatar_url = parsed.avatar_url ?? null;
    const github_url = parsed.github_url ?? null;
    const linkedin_url = parsed.linkedin_url ?? null;
    const about = parsed.about ?? null;
    const skills_frontend = parsed.skills_frontend ?? null;
    const skills_tools = parsed.skills_tools ?? null;
    const skills_backend = parsed.skills_backend ?? null;

    // Находим активное CV
    const currentCV = await sql`
      SELECT id FROM cv_data
      WHERE is_active = true
      LIMIT 1
    `;

    if (currentCV.length === 0) {
      return NextResponse.json({ error: 'Active CV not found' }, { status: 404 });
    }

    const cvId = currentCV[0].id;

    // Get old avatar URLs for cleanup
    const oldCV = await sql`
      SELECT avatar_url FROM cv_data
      WHERE id = ${cvId}
    `;

    const oldAvatarUrls =
      oldCV.length > 0
        ? (() => {
            const avatarUrl = oldCV[0].avatar_url;
            if (!avatarUrl || String(avatarUrl) === '[]') return [];
            try {
              return Array.isArray(avatarUrl) ? avatarUrl : JSON.parse(String(avatarUrl));
            } catch {
              return avatarUrl ? [String(avatarUrl)] : [];
            }
          })()
        : [];

    const newAvatarUrls = (() => {
      if (!avatar_url || String(avatar_url) === '[]') return [];
      try {
        return Array.isArray(avatar_url) ? avatar_url : JSON.parse(String(avatar_url));
      } catch {
        return avatar_url ? [String(avatar_url)] : [];
      }
    })();

    // Find unused avatar image IDs
    const unusedAvatarIds = oldAvatarUrls.filter((id: string) => !newAvatarUrls.includes(id));

    // Update data
    await sql`
      UPDATE cv_data SET
        name = ${name},
        title = ${title},
        email = ${email},
        phone = ${phone},
        location = ${location},
        website = ${website},
        avatar_url = ${avatar_url},
        github_url = ${github_url},
        linkedin_url = ${linkedin_url},
        about = ${about},
        skills_frontend = ${skills_frontend},
        skills_tools = ${skills_tools},
        skills_backend = ${skills_backend},
        updated_at = NOW()
      WHERE id = ${cvId}
    `;

    // Clean up unused avatar images
    if (unusedAvatarIds.length > 0) {
      try {
        await sql`
          DELETE FROM images
          WHERE id = ANY(${unusedAvatarIds})
          AND entity_type = 'avatar'
          AND entity_id = ${cvId.toString()}
        `;
      } catch (cleanupError) {
        console.warn('Failed to cleanup unused avatar images:', cleanupError);
      }
    }

    await revalidateCVData();
    return NextResponse.json({ message: 'CV updated successfully' });
  } catch (error) {
    console.error('Error updating CV:', error);
    return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 });
  }
}
