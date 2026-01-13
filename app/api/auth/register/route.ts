import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email-service';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const registerSchema = z.object({
  name: z.string().min(1, 'Имя обязательно для заполнения').max(255),
  email: z.string().email('Enter a valid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { name, email, password } = validatedData;

    // Check if user with this email exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists', field: 'email' },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Create new user (not yet verified)
    const result = await sql`
      INSERT INTO users (
        name, 
        email, 
        password_hash, 
        role, 
        email_verified,
        email_verification_token,
        email_verification_expires,
        created_at, 
        updated_at
      )
      VALUES (
        ${name}, 
        ${email}, 
        ${hashedPassword}, 
        'user', 
        false,
        ${verificationToken},
        ${verificationExpires},
        NOW(), 
        NOW()
      )
      RETURNING id, email, name, role, created_at
    `;

    const newUser = result[0];

    // Send confirmation email
    const emailSent = await sendVerificationEmail(email, name, verificationToken);

    if (!emailSent) {
      // If email failed to send, delete user
      await sql`DELETE FROM users WHERE id = ${newUser.id}`;

      return NextResponse.json(
        {
          message: 'Error sending verification email. Please try later.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          'Registration almost complete! Check your email and follow the link to confirm your email address.',
        requiresVerification: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          created_at: newUser.created_at,
          email_verified: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { message: firstError.message, field: firstError.path[0] },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
