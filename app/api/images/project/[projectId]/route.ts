import { NextRequest, NextResponse } from 'next/server';
import { getImagesForEntity } from '@/lib/image-service';
import { ProjectImageParamsSchema } from '@/types/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const parsedParams = ProjectImageParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return new NextResponse('Project ID is required', { status: 400 });
    }
    const { projectId } = parsedParams.data;

    const images = await getImagesForEntity('project', projectId.toString());

    return NextResponse.json({
      count: images.length,
      images: images.map((img) => ({
        id: img.id,
        url: `/api/images/${img.id}`,
        mimeType: img.mime_type,
        width: img.width,
        height: img.height,
        sizeBytes: img.size_bytes,
      })),
    });
  } catch (error) {
    console.error('Error fetching project images:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
