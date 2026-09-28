import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { ImageReassignSchema, validate } from '@/types/schemas';
import type { ImageReassignResponse, ApiError } from '../../../../types/api';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ImageReassignResponse | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validationResult = validate(ImageReassignSchema, await request.json());
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid image reassignment data' }, { status: 400 });
    }

    const { entityType, oldEntityId, newEntityId, imageIds } = validationResult.data;

    if (imageIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No images to reassign',
        reassignedCount: 0,
      });
    }

    // Update entity_id for the specified images
    const result = await sql`
      UPDATE images
      SET entity_id = ${newEntityId}, updated_at = NOW()
      WHERE entity_type = ${entityType}
        AND entity_id = ${oldEntityId}
        AND id = ANY(${imageIds})
    `;

    // Also update the image_urls array in the parent entity table
    if (entityType === 'project') {
      await sql`
        UPDATE projects
        SET image_urls = ${imageIds}
        WHERE id = ${newEntityId}
      `;
    } else if (entityType === 'avatar') {
      await sql`
        UPDATE cv_data
        SET avatar_url = ${JSON.stringify(imageIds)}
        WHERE id = ${newEntityId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Images reassigned successfully',
      reassignedCount: result.count,
    });
  } catch (error) {
    console.error('Error reassigning images:', error);
    return NextResponse.json({ error: 'Failed to reassign images' }, { status: 500 });
  }
}
