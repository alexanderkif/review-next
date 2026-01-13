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
    const { experience } = await request.json();

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

    // Remove existing work experience
    await sql`DELETE FROM cv_experience WHERE cv_id = ${cvId}`;

    // Add new work experience
    for (const [index, exp] of experience.entries()) {
      if (exp.title && exp.company) {
        // Проверяем что есть основные поля
        await sql`
          INSERT INTO cv_experience (cv_id, title, company, period, description, is_current, sort_order)
          VALUES (${cvId}, ${exp.title}, ${exp.company}, ${exp.period}, ${exp.description}, ${exp.is_current}, ${index})
        `;
      }
    }

    await revalidateCVData();
    return NextResponse.json({ message: 'Experience updated successfully' });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}
