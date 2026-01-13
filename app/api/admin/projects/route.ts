import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import type { Project, ProjectCreateRequest, ApiError } from '../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// GET - get all projects
export async function GET(): Promise<NextResponse<Project[] | ApiError>> {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await sql`
      SELECT 
        p.*,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count
      FROM projects p
      LEFT JOIN project_likes pl ON p.id = pl.project_id
      LEFT JOIN project_comments pc ON p.id = pc.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json(projects as unknown as Project[]);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - create new project
export async function POST(request: NextRequest): Promise<NextResponse<Project | ApiError>> {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data: ProjectCreateRequest = await request.json();

    const {
      title,
      description,
      short_description,
      technologies,
      github_url,
      demo_url,
      image_urls,
      year,
      featured,
      status,
    } = data;

    const result = await sql`
      INSERT INTO projects (
        title,
        description,
        short_description,
        technologies,
        github_url,
        demo_url,
        image_urls,
        year,
        featured,
        status
      ) VALUES (
        ${title},
        ${description},
        ${short_description},
        ${technologies},
        ${github_url ?? null},
        ${demo_url ?? null},
        ${image_urls ?? []},
        ${year},
        ${featured ?? false},
        ${status ?? 'completed'}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0] as unknown as Project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
