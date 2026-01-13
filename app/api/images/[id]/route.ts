import { NextRequest, NextResponse } from 'next/server';
import { getImageById } from '../../../lib/image-service';
import sharp from 'sharp';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: imageId } = await params;

    if (!imageId) {
      return new NextResponse('Image ID is required', { status: 400 });
    }

    // Get query parameters for image optimization
    const { searchParams } = new URL(request.url);
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : 80;

    const image = await getImageById(imageId);

    if (!image) {
      console.warn(`Image not found: ${imageId}`);
      return new NextResponse('Image not found', { status: 404 });
    }

    // Additional validation for image data
    if (!image.image_data) {
      console.warn(`Image data is empty for: ${imageId}`);
      return new NextResponse('Image data is corrupted', { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = image.image_data.includes(',')
      ? image.image_data.split(',')[1]
      : image.image_data;

    let imageBuffer = Buffer.from(base64Data, 'base64');
    let contentType = image.mime_type;

    // Optimize image if width parameter is provided
    if (width || quality < 100) {
      const sharpInstance = sharp(imageBuffer);

      if (width) {
        sharpInstance.resize(width, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to WebP with quality setting for better compression
      imageBuffer = Buffer.from(await sharpInstance.webp({ quality }).toBuffer());

      contentType = 'image/webp';
    }

    // Generate ETag based on image ID and optimization params
    const etag = `"${imageId}-w${width || 'orig'}-q${quality}"`;

    // Set appropriate headers for caching
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
        ETag: etag,
        'Last-Modified': image.updated_at.toUTCString(),
      },
    });

    return response;
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
