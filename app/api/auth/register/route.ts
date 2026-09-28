import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email-service';
import { RegisterRequestSchema, validate } from '@/types/schemas';
import { consumeRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { serverLogger } from '@/lib/logger';

function getRegistrationErrorDetails(error: unknown) {
  const properties =
    typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};
  const message =
    error instanceof Error
      ? error.message
      : typeof properties.message === 'string'
        ? properties.message
        : String(error);

  return {
    name: error instanceof Error ? error.name : properties.name,
    code: properties.code,
    command: properties.command,
    responseCode: properties.responseCode,
    syscall: properties.syscall,
    message: message.replace(/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/gi, '[redacted-email]'),
  };
}

export async function POST(request: NextRequest) {
  console.log('POST /api/auth/register');
  const requestId = request.headers.get('x-vercel-id') || randomUUID();
  let stage = 'request_started';
  const log = (event: string, details: Record<string, unknown> = {}) =>
    serverLogger.info('[registration]', { requestId, event, ...details });

  log('started', {
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    nodeVersion: process.version,
  });

  try {
    stage = 'ip_rate_limit';
    log('ip rate limit check started');
    const ipLimit = await consumeRateLimit(
      'registration-ip',
      getRateLimitIdentifier(request.headers),
      5,
      15 * 60,
    );
    log('ip rate limit check completed', {
      allowed: ipLimit.allowed,
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    });
    if (!ipLimit.allowed) {
      log('request rejected', { status: 429, reason: 'ip_rate_limit' });
      return NextResponse.json(
        { message: 'Too many registration attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } },
      );
    }

    stage = 'request_body_validation';
    log('request body parsing started');
    const validationResult = validate(RegisterRequestSchema, await request.json());
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      log('request rejected', {
        status: 400,
        reason: 'validation',
        field: firstError.path[0],
      });
      return NextResponse.json(
        { message: firstError.message, field: firstError.path[0] },
        { status: 400 },
      );
    }

    const { name, email, password } = validationResult.data;
    stage = 'email_rate_limit';
    log('email rate limit check started');
    const emailLimit = await consumeRateLimit('registration-email', email, 5, 60 * 60);
    log('email rate limit check completed', {
      allowed: emailLimit.allowed,
      retryAfterSeconds: emailLimit.retryAfterSeconds,
    });
    if (!emailLimit.allowed) {
      log('request rejected', { status: 429, reason: 'email_rate_limit' });
      return NextResponse.json(
        { message: 'Too many registration attempts for this email. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfterSeconds) } },
      );
    }

    // Check if user with this email exists
    stage = 'existing_user_lookup';
    log('existing user lookup started');
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    log('existing user lookup completed', { exists: existingUser.length > 0 });

    if (existingUser.length > 0) {
      log('request rejected', { status: 400, reason: 'user_already_exists' });
      return NextResponse.json(
        { message: 'User with this email already exists', field: 'email' },
        { status: 400 },
      );
    }

    // Hash password
    stage = 'password_hash';
    log('password hashing started');
    const hashedPassword = await bcrypt.hash(password, 12);
    log('password hashing completed');

    // Generate verification token
    stage = 'verification_token';
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
    log('verification token generated');

    // Create new user (not yet verified)
    stage = 'user_insert';
    log('user insert started');
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
    log('user insert completed');

    // Send confirmation email
    stage = 'verification_email';
    log('verification email handoff started');
    const emailSent = await sendVerificationEmail(email, name, verificationToken);
    log('verification email handoff completed', { sent: emailSent });

    if (!emailSent) {
      // If email failed to send, delete user
      stage = 'delete_user_after_email_failure';
      log('user cleanup after email failure started');
      await sql`DELETE FROM users WHERE id = ${newUser.id}`;
      log('user cleanup after email failure completed');

      log('request completed', { status: 500, reason: 'verification_email_failed' });
      return NextResponse.json(
        {
          message: 'Error sending verification email. Please try later.',
        },
        { status: 500 },
      );
    }

    log('request completed', { status: 201 });
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
    serverLogger.error('[registration] failed', {
      requestId,
      stage,
      ...getRegistrationErrorDetails(error),
    });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
