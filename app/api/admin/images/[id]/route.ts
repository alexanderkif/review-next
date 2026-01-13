import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../../lib/admin-auth';
import type { ImageDeleteResponse, ApiError } from '../../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ImageDeleteResponse | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: imageId } = await params;

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Start transaction to ensure data consistency
    let updatedImageIds: string[] = [];

    await sql.begin(async (sql) => {
      // First, get image info before deleting
      const imageInfo = await sql`
        SELECT id, entity_type, entity_id 
        FROM images 
        WHERE id = ${imageId}
      `;

      if (imageInfo.length === 0) {
        throw new Error('Image not found');
      }

      const image = imageInfo[0];

      // Delete the image from the database
      await sql`
        DELETE FROM images WHERE id = ${imageId}
      `;

      // If it's a project image, also remove ID from project's image_urls array
      if (image.entity_type === 'project' && image.entity_id) {
        await sql`
          UPDATE projects 
          SET image_urls = array_remove(image_urls, ${imageId})
          WHERE id = ${image.entity_id}
        `;

        // Get updated list of image IDs for this project
        const images = await sql`
          SELECT id FROM images 
          WHERE entity_type = 'project' AND entity_id = ${image.entity_id}
          ORDER BY created_at ASC
        `;
        updatedImageIds = images.map((img) => (img as { id: string }).id);
      }

      // If it's an avatar, remove from cv_data avatar_url array
      if (image.entity_type === 'avatar' && image.entity_id) {
        // Get current avatar_url value
        const currentData = await sql`
          SELECT avatar_url FROM cv_data WHERE id = ${image.entity_id}
        `;

        if (currentData.length > 0) {
          let avatarArray;
          const currentAvatar = currentData[0].avatar_url;

          if (!currentAvatar || currentAvatar === '[]' || currentAvatar === '') {
            avatarArray = [];
          } else {
            try {
              avatarArray = Array.isArray(currentAvatar)
                ? currentAvatar
                : JSON.parse(currentAvatar);
            } catch {
              avatarArray = [currentAvatar];
            }
          }

          // Remove the image ID from array
          const updatedArray = avatarArray.filter((id: string) => id !== imageId);

          await sql`
            UPDATE cv_data 
            SET avatar_url = ${JSON.stringify(updatedArray)}
            WHERE id = ${image.entity_id}
          `;

          updatedImageIds = updatedArray;
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully and references updated',
      imageIds: updatedImageIds,
    });
  } catch (error) {
    console.error('DELETE /api/admin/images/[id]: Error deleting image:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
