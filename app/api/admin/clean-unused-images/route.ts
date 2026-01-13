import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import { logger } from '../../../lib/logger';
import type { CleanUnusedImagesResponse, ApiError } from '../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * DELETE /api/admin/clean-unused-images
 * Deletes images that are not associated with any existing projects or CV
 */
export async function DELETE(): Promise<NextResponse<CleanUnusedImagesResponse | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting cleanup of unused images');

    // Find orphaned project images (images with entity_type='project' but entity_id not in projects table)
    const orphanedProjectImages = await sql`
      SELECT i.id, i.entity_id
      FROM images i
      WHERE i.entity_type = 'project'
        AND NOT EXISTS (
          SELECT 1 FROM projects p WHERE p.id::text = i.entity_id
        )
    `;

    // Find orphaned avatar images (images with entity_type='avatar' but entity_id not in cv table)
    const orphanedAvatarImages = await sql`
      SELECT i.id, i.entity_id
      FROM images i
      WHERE i.entity_type = 'avatar'
        AND NOT EXISTS (
          SELECT 1 FROM cv_data WHERE cv_data.id::text = i.entity_id
        )
    `;

    const totalOrphaned = orphanedProjectImages.length + orphanedAvatarImages.length;

    if (totalOrphaned === 0) {
      logger.info('No unused images found');
      return NextResponse.json({
        success: true,
        message: 'No unused images found',
        deleted: 0,
      });
    }

    // Delete orphaned images
    let deletedCount = 0;

    if (orphanedProjectImages.length > 0) {
      const projectImageIds = orphanedProjectImages.map((img) => (img as { id: string }).id);
      await sql`
        DELETE FROM images
        WHERE id = ANY(${projectImageIds})
      `;
      deletedCount += orphanedProjectImages.length;
      logger.info(`Deleted ${orphanedProjectImages.length} orphaned project images`);
    }

    if (orphanedAvatarImages.length > 0) {
      const avatarImageIds = orphanedAvatarImages.map((img) => (img as { id: string }).id);
      await sql`
        DELETE FROM images
        WHERE id = ANY(${avatarImageIds})
      `;
      deletedCount += orphanedAvatarImages.length;
      logger.info(`Deleted ${orphanedAvatarImages.length} orphaned avatar images`);
    }

    logger.info(`Successfully deleted ${deletedCount} unused images`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} unused image${deletedCount !== 1 ? 's' : ''}`,
      deleted: deletedCount,
    });
  } catch (error) {
    logger.error('Error cleaning unused images:', error);
    return NextResponse.json(
      {
        error: 'Failed to clean unused images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
