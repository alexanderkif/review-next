import { NextRequest, NextResponse } from 'next/server';
import { getActivityData } from '../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'month' | 'year' || 'month';
    
    // Get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    const locale = acceptLanguage?.split(',')[0]?.split('-')[0] || 'en';
    const fullLocale = acceptLanguage?.split(',')[0] || 'en-US';

    const data = await getActivityData(period, fullLocale);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}