import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import { saveImage, revalidateImageCache, getImagesByEntity } from '../../../lib/image-service';
import type {
  ImageMetadata,
  ImageUploadRequest,
  ImageUploadResponse,
  ApiError,
} from '../../../types/api';

export async function GET(request: NextRequest): Promise<NextResponse<ImageMetadata[] | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing entityType or entityId' }, { status: 400 });
    }

    // Validate entity type
    if (!['avatar', 'project', 'user'].includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    const images = await getImagesByEntity(entityType as 'avatar' | 'project' | 'user', entityId);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ImageUploadResponse | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ImageUploadRequest = await request.json();
    const { entityType, entityId, imageData, mimeType, width, height } = body;

    // Validate required fields
    if (!entityType || !entityId || !imageData || !mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate entity type
    if (!['avatar', 'project', 'user'].includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const postgres = (await import('postgres')).default;
    const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

    let imageId: string | null = null;
    let updatedImageIds: string[] = [];

    await sql.begin(async (sql) => {
      // Save image
      imageId = await saveImage(entityType, entityId, imageData, mimeType, width, height);

      if (!imageId) {
        throw new Error('Failed to save image');
      }

      // Add image ID to appropriate array in parent entity
      if (entityType === 'project' && entityId !== 'new') {
        await sql`
          UPDATE projects 
          SET image_urls = array_append(
            COALESCE(image_urls, ARRAY[]::text[]), 
            ${imageId}
          )
          WHERE id = ${entityId}
        `;

        // Get updated list of image IDs for this project
        const images = await sql`
          SELECT id FROM images 
          WHERE entity_type = 'project' AND entity_id = ${entityId}
          ORDER BY created_at ASC
        `;
        updatedImageIds = images.map((img) => (img as { id: string }).id);
      } else if (entityType === 'avatar') {
        // Get current avatar_url value
        const currentData = await sql`
          SELECT avatar_url FROM cv_data WHERE id = ${entityId}
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

          // Add new image ID to array
          avatarArray.push(imageId);

          await sql`
            UPDATE cv_data 
            SET avatar_url = ${JSON.stringify(avatarArray)}
            WHERE id = ${entityId}
          `;

          updatedImageIds = avatarArray;
        }
      }
    });

    // Revalidate cache
    await revalidateImageCache(entityType);

    if (!imageId) {
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageId,
      imageIds: updatedImageIds,
      url: `/api/images/${imageId}`,
    });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing entityType or entityId' }, { status: 400 });
    }

    const { deleteImagesForEntity } = await import('../../../lib/image-service');
    const success = await deleteImagesForEntity(
      entityType as 'avatar' | 'project' | 'user',
      entityId,
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 });
    }

    // Revalidate cache
    await revalidateImageCache(entityType);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
