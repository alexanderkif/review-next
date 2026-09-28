import { NextRequest, NextResponse } from 'next/server';
import { getCVAvatar } from '@/lib/image-service';
import { CVImageParamsSchema } from '@/types/schemas';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cvId: string }> }) {
  try {
    const parsedParams = CVImageParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return new NextResponse('CV ID is required', { status: 400 });
    }
    const { cvId } = parsedParams.data;

    const avatar = await getCVAvatar(cvId.toString());

    if (!avatar) {
      return new NextResponse('Avatar not found', { status: 404 });
    }

    return NextResponse.json({
      id: avatar.id,
      url: `/api/images/${avatar.id}`,
      mimeType: avatar.mime_type,
      width: avatar.width,
      height: avatar.height,
      sizeBytes: avatar.size_bytes,
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
