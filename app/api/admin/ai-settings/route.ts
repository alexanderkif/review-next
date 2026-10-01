import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getAiSettings, saveAiSettings } from '@/lib/ai-settings';
import { AiSettingsUpdateSchema, validate } from '@/types/schemas';

// GET - read the AI avatar configuration (effective values, defaults included)
export async function GET() {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getAiSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json({ error: 'Failed to fetch AI settings' }, { status: 500 });
  }
}

// PUT - update the AI avatar configuration
export async function PUT(request: NextRequest) {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const validationResult = validate(AiSettingsUpdateSchema, await request.json());
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid AI settings', details: validationResult.error.issues[0]?.message },
        { status: 400 },
      );
    }

    await saveAiSettings(validationResult.data);
    return NextResponse.json({ message: 'AI settings updated successfully' });
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json({ error: 'Failed to update AI settings' }, { status: 500 });
  }
}
