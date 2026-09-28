import { NextRequest, NextResponse } from 'next/server';
import { getActivityData } from '@/lib/db';
import { ActivityQuerySchema } from '@/types/schemas';
import type { ActivityResponse, ApiError } from '../../types/api';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ActivityResponse | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const validationResult = ActivityQuerySchema.safeParse({
      period: searchParams.get('period') ?? undefined,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid period', details: validationResult.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { period } = validationResult.data;

    // Get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    const fullLocale = acceptLanguage?.split(',')[0] || 'en-US';

    const data = await getActivityData(period, fullLocale);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json({ error: 'Failed to fetch activity data' }, { status: 500 });
  }
}
