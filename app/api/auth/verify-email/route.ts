import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { sendWelcomeEmail } from '@/lib/email-service';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token not found' },
        { status: 400 }
      );
    }

    // Find user with given token
    const users = await sql`
      SELECT id, name, email, email_verification_expires, email_verified
      FROM users 
      WHERE email_verification_token = ${token}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check if token has not expired
    if (new Date() > new Date(user.email_verification_expires)) {
      return NextResponse.json(
        { error: 'Verification token has expired. Request a new verification email.' },
        { status: 400 }
      );
    }

    // Check if email is not already verified
    if (user.email_verified) {
      return NextResponse.json(
        { message: 'Email already verified', alreadyVerified: true },
        { status: 200 }
      );
    }

    // Подтверждаем email
    await sql`
      UPDATE users 
      SET 
        email_verified = true,
        email_verification_token = null,
        email_verification_expires = null,
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Отправляем приветственное письмо
    await sendWelcomeEmail(user.email, user.name);

    console.log(`Email verified for user: ${user.email}`);

    return NextResponse.json({
      message: 'Email successfully verified! You can now log into the system.',
      verified: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during email verification' },
      { status: 500 }
    );
  }
}