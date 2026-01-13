import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../../lib/admin-auth';
import type { Project, ProjectUpdateRequest, ApiError } from '../../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// GET - получить конкретный проект
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<Project | ApiError>> {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const project = await sql`
      SELECT * FROM projects WHERE id = ${projectId}
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project[0] as unknown as Project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PUT - обновить проект
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | ApiError>> {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const data: ProjectUpdateRequest = await request.json();

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

    // Get old image URLs for cleanup
    const oldProject = await sql`
      SELECT image_urls FROM projects
      WHERE id = ${projectId}
    `;

    const oldImageUrls = oldProject.length > 0 ? oldProject[0].image_urls || [] : [];
    const newImageUrls = image_urls || [];

    // Find unused image IDs
    const unusedImageIds = oldImageUrls.filter((id: string) => !newImageUrls.includes(id));

    await sql`
      UPDATE projects SET
        title = ${title ?? ''},
        description = ${description ?? ''},
        short_description = ${short_description ?? ''},
        technologies = ${technologies ?? []},
        github_url = ${github_url ?? null},
        demo_url = ${demo_url ?? null},
        image_urls = ${image_urls ?? []},
        year = ${year ?? new Date().getFullYear()},
        featured = ${featured ?? false},
        status = ${status ?? 'completed'}
      WHERE id = ${projectId}
    `;

    // Clean up unused project images
    if (unusedImageIds.length > 0) {
      try {
        await sql`
          DELETE FROM images
          WHERE id = ANY(${unusedImageIds})
          AND entity_type = 'project'
          AND entity_id = ${projectId.toString()}
        `;
        console.log(`Cleaned up ${unusedImageIds.length} unused project images`);
      } catch (cleanupError) {
        console.warn('Failed to cleanup unused project images:', cleanupError);
      }
    }

    return NextResponse.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - удалить проект
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | ApiError>> {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const projectId = parseInt(id);

    // Get project images for cleanup
    const project = await sql`
      SELECT image_urls FROM projects WHERE id = ${projectId}
    `;

    const imageUrls = project.length > 0 ? project[0].image_urls || [] : [];

    // Удаляем проект (связанные лайки и комментарии удалятся автоматически благодаря CASCADE)
    await sql`
      DELETE FROM projects WHERE id = ${projectId}
    `;

    // Clean up project images
    if (imageUrls.length > 0) {
      try {
        await sql`
          DELETE FROM images
          WHERE id = ANY(${imageUrls})
          AND entity_type = 'project'
          AND entity_id = ${projectId.toString()}
        `;
        console.log(`Cleaned up ${imageUrls.length} project images`);
      } catch (cleanupError) {
        console.warn('Failed to cleanup project images:', cleanupError);
      }
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
