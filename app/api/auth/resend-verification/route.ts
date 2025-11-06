import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import postgres from 'postgres';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email-service';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const resendSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    // Ищем пользователя
    const users = await sql`
      SELECT id, name, email, email_verified, created_at
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User with this email not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }

    // Check if emails are not sent too frequently (no more than once per 5 minutes)
    const recentEmails = await sql`
      SELECT updated_at 
      FROM users 
      WHERE id = ${user.id} 
      AND updated_at > NOW() - INTERVAL '5 minutes'
    `;

    if (recentEmails.length > 0) {
      return NextResponse.json(
        { error: 'Verification email can be requested no more than once every 5 minutes' },
        { status: 429 }
      );
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Update token in database
    await sql`
      UPDATE users 
      SET 
        email_verification_token = ${verificationToken},
        email_verification_expires = ${verificationExpires},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Отправляем новое письмо
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Error sending email. Try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'New verification email sent to your email address',
      sent: true
    }, { status: 200 });

  } catch (error) {
    console.error('Resend verification error:', error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}