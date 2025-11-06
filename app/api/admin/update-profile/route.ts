import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '../../../lib/admin-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function PUT(request: NextRequest) {
  const { isAdmin, user } = await verifyAdminAuth();
  
  if (!isAdmin || !user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId: string = user.id; // Type assertion - guaranteed to be defined after check

  try {
    const { action, email, currentPassword, newPassword, name } = await request.json();

    // Check current password for any action (except name updates)
    if (action !== 'update_name') {
      const userResult = await sql`
        SELECT password_hash FROM users 
        WHERE id = ${userId} AND role = 'admin'
      `;

      if (userResult.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword, 
        userResult[0].password_hash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
      }
    }

    if (action === 'update_name') {
      // Update name without password verification
      await sql`
        UPDATE users 
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${user.id}
      `;

      return NextResponse.json({ message: 'Name successfully updated' });

    } else if (action === 'update_email') {
      // Check if new email is taken
      const emailExists = await sql`
        SELECT id FROM users 
        WHERE email = ${email} AND id != ${user.id}
      `;

      if (emailExists.length > 0) {
        return NextResponse.json({ error: 'This email is already in use' }, { status: 400 });
      }

      // Update email
      await sql`
        UPDATE users 
        SET email = ${email}, updated_at = NOW()
        WHERE id = ${user.id}
      `;

      return NextResponse.json({ message: 'Email successfully updated' });

    } else if (action === 'update_password') {
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await sql`
        UPDATE users 
        SET password_hash = ${hashedNewPassword}, updated_at = NOW()
        WHERE id = ${user.id}
      `;

      return NextResponse.json({ message: 'Password successfully updated' });

    } else {
      return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json(
      { error: 'Profile update error' },
      { status: 500 }
    );
  }
}