import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import type { SyncImagesResponse, ApiError } from '../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * Sync endpoint to fix image_urls for projects where images exist in images table
 * but are not properly referenced in projects.image_urls
 */
export async function POST(): Promise<NextResponse<SyncImagesResponse | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting image synchronization...');

    // Get all projects
    const projects = await sql`
      SELECT id, image_urls FROM projects
    `;

    let updatedCount = 0;
    const results = [];

    for (const project of projects) {
      // Get images from images table for this project
      const images = await sql`
        SELECT id FROM images
        WHERE entity_type = 'project'
        AND entity_id = ${project.id.toString()}
        ORDER BY created_at ASC
      `;

      if (images.length > 0) {
        const imageIds = images.map((img) => (img as { id: string }).id);
        const currentImageUrls = project.image_urls || [];

        // Check if sync is needed
        const needsSync =
          imageIds.length !== currentImageUrls.length ||
          !imageIds.every((id: string) => currentImageUrls.includes(id));

        if (needsSync) {
          // Update project with correct image URLs
          await sql`
            UPDATE projects
            SET image_urls = ${imageIds}
            WHERE id = ${project.id}
          `;

          updatedCount++;
          results.push({
            projectId: project.id,
            oldImageUrls: currentImageUrls,
            newImageUrls: imageIds,
          });

          console.log(`Updated project ${project.id}: ${imageIds.length} images synced`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${updatedCount} projects`,
      updatedCount,
      details: results,
    });
  } catch (error) {
    console.error('Error synchronizing images:', error);
    return NextResponse.json(
      {
        error: 'Failed to synchronize images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
