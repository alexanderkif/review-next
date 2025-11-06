import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../../lib/admin-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const { isAdmin } = await verifyAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      entityType, 
      oldEntityId, 
      newEntityId, 
      imageIds 
    } = body;

    // Validate required fields
    if (!entityType || !oldEntityId || !newEntityId || !imageIds || !Array.isArray(imageIds)) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid imageIds' }, 
        { status: 400 }
      );
    }

    // Validate entity type
    if (!['avatar', 'project', 'user'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type' }, 
        { status: 400 }
      );
    }

    if (imageIds.length === 0) {
      return NextResponse.json({ message: 'No images to reassign' });
    }

    // Update entity_id for the specified images
    const result = await sql`
      UPDATE images 
      SET entity_id = ${newEntityId}, updated_at = NOW()
      WHERE entity_type = ${entityType} 
        AND entity_id = ${oldEntityId}
        AND id = ANY(${imageIds})
    `;

    console.log(`Reassigned ${result.count} images from ${entityType}:${oldEntityId} to ${entityType}:${newEntityId}`);

    return NextResponse.json({ 
      message: 'Images reassigned successfully',
      reassignedCount: result.count
    });

  } catch (error) {
    console.error('Error reassigning images:', error);
    return NextResponse.json(
      { error: 'Failed to reassign images' },
      { status: 500 }
    );
  }
}