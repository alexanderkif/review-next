import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { verifyAdminAuth } from '../../../lib/admin-auth';
import { seedDatabase } from '../../../lib/seed-data';
import type { ResetDatabaseResponse, ApiError } from '../../../types/api';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(): Promise<NextResponse<ResetDatabaseResponse | ApiError>> {
  try {
    // Check admin authorization
    const { isAdmin, user } = await verifyAdminAuth();
    
    if (!isAdmin || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear all tables except users (with error handling for non-existent tables)
    const tablesToClear = [
      'project_comments',
      'project_likes', 
      'projects',
      'cv_education',
      'cv_experience',
      'cv_languages',
      'cv_data',
      'images'
    ];

    const clearedTables = [];
    const skippedTables = [];

    for (const table of tablesToClear) {
      try {
        // Use unsafe() for table names since they're not user input but predefined
        await sql.unsafe(`DELETE FROM ${table}`);
        clearedTables.push(table);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
          // Table doesn't exist, skip it
          skippedTables.push(table);
        } else {
          // Other error, rethrow
          throw error;
        }
      }
    }

    // Seed database with sample data
    const seedResult = await seedDatabase();

    // Clear CV data cache after database reset and seeding
    const { revalidatePath, revalidateTag } = await import('next/cache');
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidateTag('cv', 'max');

    return NextResponse.json({ 
      message: 'Database reset and seeded successfully',
      cleared_tables: clearedTables,
      skipped_tables: skippedTables,
      seeded_data: seedResult,
      info: 'Database cleared and populated with sample data'
    });

  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}