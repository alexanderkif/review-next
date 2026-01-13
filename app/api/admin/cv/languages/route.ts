import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../../lib/admin-auth';
import { revalidateCVData } from '../../../../lib/cv-service';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function PUT(request: NextRequest) {
  const { isAdmin } = await verifyAdminAuth();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { languages } = await request.json();

    // Получаем CV ID
    const cvResult = await sql`
      SELECT id FROM cv_data 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (cvResult.length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const cvId = cvResult[0].id;

    // Remove existing languages
    await sql`DELETE FROM cv_languages WHERE cv_id = ${cvId}`;

    // Add new languages
    for (const [index, lang] of languages.entries()) {
      if (lang.language && lang.level) {
        // Проверяем что есть основные поля
        await sql`
          INSERT INTO cv_languages (cv_id, language, level, sort_order)
          VALUES (${cvId}, ${lang.language}, ${lang.level}, ${index})
        `;
      }
    }

    await revalidateCVData();
    return NextResponse.json({ message: 'Languages updated successfully' });
  } catch (error) {
    console.error('Error updating languages:', error);
    return NextResponse.json({ error: 'Failed to update languages' }, { status: 500 });
  }
}
