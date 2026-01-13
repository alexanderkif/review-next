import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import { revalidateCVData } from '../../../lib/cv-service';
import type { Experience, Education, Language, ApiError } from '../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// GET - get CV data
export async function GET(): Promise<
  NextResponse<
    | {
        cv: Record<string, unknown>;
        experience: Experience[];
        education: Education[];
        languages: Language[];
      }
    | ApiError
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

    return NextResponse.json({
      cv: cv as unknown as Record<string, unknown>,
      experience: experience as unknown as Experience[],
      education: education as unknown as Education[],
      languages: languages as unknown as Language[],
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
    const data = await request.json();

    const {
      name,
      title,
      email,
      phone,
      location,
      website,
      avatar_url,
      github_url,
      linkedin_url,
      about,
      skills_frontend,
      skills_tools,
      skills_backend,
    } = data;

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
            if (!avatarUrl || avatarUrl === '[]') return [];
            try {
              return Array.isArray(avatarUrl) ? avatarUrl : JSON.parse(avatarUrl);
            } catch {
              return avatarUrl ? [avatarUrl] : [];
            }
          })()
        : [];

    const newAvatarUrls = (() => {
      if (!avatar_url || avatar_url === '[]') return [];
      try {
        return Array.isArray(avatar_url) ? avatar_url : JSON.parse(avatar_url);
      } catch {
        return avatar_url ? [avatar_url] : [];
      }
    })();

    // Find unused avatar image IDs
    const unusedAvatarIds = oldAvatarUrls.filter((id: string) => !newAvatarUrls.includes(id));

    console.log('Avatar cleanup debug:', {
      oldAvatarUrls,
      newAvatarUrls,
      unusedAvatarIds,
      cvId,
    });

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
        console.log(
          `Attempting to cleanup ${unusedAvatarIds.length} unused avatar images:`,
          unusedAvatarIds,
        );

        const deletedImages = await sql`
          DELETE FROM images
          WHERE id = ANY(${unusedAvatarIds})
          AND entity_type = 'avatar'
          AND entity_id = ${cvId.toString()}
          RETURNING id
        `;

        console.log(
          `Successfully cleaned up ${deletedImages.length} unused avatar images:`,
          deletedImages.map((img) => img.id),
        );
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
