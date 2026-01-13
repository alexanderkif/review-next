import postgres from 'postgres';
import { unstable_cache } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export interface ImageRecord {
  id: string;
  entity_type: 'avatar' | 'project' | 'user';
  entity_id: string;
  image_data: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ImageMetadata {
  id: string;
  entity_type: string;
  entity_id: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
}

// Create images table if not exists
export async function createImagesTable() {
  try {
    // First drop the existing table if it exists with wrong schema
    await sql`DROP TABLE IF EXISTS images CASCADE`;

    await sql`
      CREATE TABLE images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        image_data TEXT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size_bytes INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT images_entity_type_check CHECK (entity_type IN ('avatar', 'project', 'user'))
      )
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX idx_images_entity 
      ON images(entity_type, entity_id)
    `;

    await sql`
      CREATE INDEX idx_images_created_at 
      ON images(created_at DESC)
    `;

    console.log('Images table created successfully with VARCHAR entity_id');
    return true;
  } catch (error) {
    console.error('Error creating images table:', error);
    return false;
  }
}

// Save image to database
export async function saveImage(
  entityType: 'avatar' | 'project' | 'user',
  entityId: string,
  imageData: string,
  mimeType: string,
  width?: number,
  height?: number,
): Promise<string | null> {
  try {
    // Calculate size from base64
    const base64Data = imageData.split(',')[1] || imageData;
    const sizeBytes = Math.ceil((base64Data.length * 3) / 4);

    // Note: For multiple avatars support, we don't delete existing images
    // The cleanup will be handled by the CV update API when saving the form
    // This allows users to upload multiple avatars sequentially

    const result = await sql`
      INSERT INTO images (
        entity_type, entity_id, image_data, mime_type, 
        size_bytes, width, height, updated_at
      ) VALUES (
        ${entityType}, ${entityId}, ${imageData}, ${mimeType},
        ${sizeBytes}, ${width || null}, ${height || null}, NOW()
      )
      RETURNING id
    `;

    return (result[0] as { id: string })?.id || null;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
}

// Get image by ID
export async function getImageById(imageId: string): Promise<ImageRecord | null> {
  try {
    const result = await sql`
      SELECT * FROM images WHERE id = ${imageId} LIMIT 1
    `;
    return (result[0] as ImageRecord) || null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// Get images for entity
export async function getImagesForEntity(
  entityType: 'avatar' | 'project' | 'user',
  entityId: string,
): Promise<ImageMetadata[]> {
  try {
    const result = await sql`
      SELECT id, entity_type, entity_id, mime_type, size_bytes, width, height
      FROM images 
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
      ORDER BY created_at DESC
    `;
    return result as unknown as ImageMetadata[];
  } catch (error) {
    console.error('Error fetching images for entity:', error);
    return [];
  }
}

// Get avatar for CV
const getAvatarForCV = async (cvId: string): Promise<ImageMetadata | null> => {
  try {
    const result = await sql`
      SELECT id, entity_type, entity_id, mime_type, size_bytes, width, height
      FROM images 
      WHERE entity_type = 'avatar' AND entity_id = ${cvId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return (result[0] as ImageMetadata) || null;
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return null;
  }
};

// Cached version for better performance
export const getCVAvatar = unstable_cache(getAvatarForCV, ['cv-avatar'], {
  revalidate: 3600, // 1 hour
  tags: ['images', 'cv'],
});

// Delete images for entity
export async function deleteImagesForEntity(
  entityType: 'avatar' | 'project' | 'user',
  entityId: string,
): Promise<boolean> {
  try {
    await sql`
      DELETE FROM images 
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    `;
    return true;
  } catch (error) {
    console.error('Error deleting images:', error);
    return false;
  }
}

// Create image from buffer (for seeding from external URLs)
export async function createImageFromUrl(
  imageBuffer: Buffer,
  contentType: string,
  entityType: 'avatar' | 'project' | 'user',
  entityId: string,
): Promise<{ id: string }> {
  try {
    // Convert buffer to base64
    const base64Data = `data:${contentType};base64,${imageBuffer.toString('base64')}`;

    // Calculate size
    const sizeBytes = imageBuffer.length;

    // Remove existing images for this entity if avatar
    if (entityType === 'avatar') {
      await sql`
        DELETE FROM images 
        WHERE entity_type = ${entityType} AND entity_id = ${entityId}
      `;
    }

    const result = await sql`
      INSERT INTO images (
        entity_type, entity_id, image_data, mime_type, 
        size_bytes, updated_at
      ) VALUES (
        ${entityType}, ${entityId}, ${base64Data}, ${contentType},
        ${sizeBytes}, NOW()
      )
      RETURNING id
    `;

    return { id: result[0].id };
  } catch (error) {
    console.error('Error creating image from buffer:', error);
    throw error;
  }
}

// Get all images for a specific entity
export async function getImagesByEntity(
  entityType: 'avatar' | 'project' | 'user',
  entityId: string,
): Promise<ImageMetadata[]> {
  try {
    const result = await sql`
      SELECT id, entity_type, entity_id, mime_type, size_bytes, width, height
      FROM images 
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
      ORDER BY created_at ASC
    `;

    return result as unknown as ImageMetadata[];
  } catch (error) {
    console.error('Error fetching images by entity:', error);
    return [];
  }
}

// Revalidate image cache
export async function revalidateImageCache(entityType?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('images', 'default');
  if (entityType === 'avatar') {
    revalidateTag('cv', 'default');
  }
}
