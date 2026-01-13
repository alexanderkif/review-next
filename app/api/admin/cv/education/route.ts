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
    const { education } = await request.json();

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

    // Remove existing education
    await sql`DELETE FROM cv_education WHERE cv_id = ${cvId}`;

    // Add new education
    for (const [index, edu] of education.entries()) {
      if (edu.degree && edu.institution) {
        // Проверяем что есть основные поля
        await sql`
          INSERT INTO cv_education (cv_id, degree, institution, period, description, sort_order)
          VALUES (${cvId}, ${edu.degree}, ${edu.institution}, ${edu.period}, ${edu.description || ''}, ${index})
        `;
      }
    }

    await revalidateCVData();
    return NextResponse.json({ message: 'Education updated successfully' });
  } catch (error) {
    console.error('Error updating education:', error);
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 });
  }
}
