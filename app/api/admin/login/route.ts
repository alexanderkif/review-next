import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { LoginSchema, validateFormData } from '@/types/schemas';
import { consumeRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ipLimit = await consumeRateLimit(
      'legacy-admin-login-ip',
      getRateLimitIdentifier(request.headers),
      5,
      15 * 60,
    );
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } },
      );
    }

    const formData = await request.formData();
    const validationResult = validateFormData(LoginSchema, formData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message ?? 'Invalid login data' },
        { status: 400 },
      );
    }

    const { email, password } = validationResult.data;
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Authentication is not configured' }, { status: 500 });
    }

    // Найти пользователя в базе данных
    const userResult = await sql`
      SELECT id, email, name, password_hash, role
      FROM users
      WHERE email = ${email} AND role = 'admin'
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = userResult[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(secret));

    // Set cookie with token
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    // Redirect to admin panel
    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Authorization error' }, { status: 500 });
  }
}
