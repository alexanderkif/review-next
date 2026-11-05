import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email-service';
import { VerificationTokenQuerySchema } from '@/types/schemas';

type VerificationUser = {
  id: number;
  name: string;
  email: string;
  email_verification_expires: Date | string | null;
  email_verified: boolean | null;
};

type VerificationLookupResult =
  | { type: 'error'; response: NextResponse }
  | { type: 'success'; token: string; user: VerificationUser };

async function getVerificationUser(request: NextRequest): Promise<VerificationLookupResult> {
  const { searchParams } = new URL(request.url);
  const validationResult = VerificationTokenQuerySchema.safeParse({
    token: searchParams.get('token'),
  });
  if (!validationResult.success) {
    return {
      type: 'error',
      response: NextResponse.json({ error: 'Invalid verification token' }, { status: 400 }),
    };
  }

  const users = await sql<VerificationUser[]>`
    SELECT id, name, email, email_verification_expires, email_verified
    FROM users
    WHERE email_verification_token = ${validationResult.data.token}
  `;

  if (users.length === 0) {
    return {
      type: 'error',
      response: NextResponse.json({ error: 'Invalid verification token' }, { status: 400 }),
    };
  }

  const user = users[0];
  if (!user.email_verification_expires || new Date() > new Date(user.email_verification_expires)) {
    return {
      type: 'error',
      response: NextResponse.json(
        { error: 'Verification token has expired. Request a new verification email.' },
        { status: 400 },
      ),
    };
  }

  return { type: 'success', token: validationResult.data.token, user };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const result = await getVerificationUser(request);
    if (result.type === 'error') {
      return result.response;
    }

    if (result.user.email_verified) {
      return NextResponse.json(
        { message: 'Email already verified', alreadyVerified: true },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: 'Confirm below to verify your email.', confirmationRequired: true },
      { status: 200 },
    );
  } catch (error) {
    console.error('Email verification check error:', error);
    return NextResponse.json(
      { error: 'Internal server error during email verification' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const result = await getVerificationUser(request);
    if (result.type === 'error') {
      return result.response;
    }

    const { user, token } = result;
    if (user.email_verified) {
      return NextResponse.json(
        { message: 'Email already verified', alreadyVerified: true },
        { status: 200 },
      );
    }

    const updatedUsers = await sql`
      UPDATE users
      SET
        email_verified = true,
        email_verification_token = null,
        email_verification_expires = null,
        updated_at = NOW()
      WHERE
        id = ${user.id}
        AND email_verification_token = ${token}
        AND email_verification_expires > NOW()
        AND email_verified = false
      RETURNING id
    `;

    if (updatedUsers.length === 0) {
      return NextResponse.json(
        { error: 'Verification token is invalid or has expired.' },
        { status: 400 },
      );
    }

    await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json(
      {
        message: 'Email successfully verified! You can now log into the system.',
        verified: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during email verification' },
      { status: 500 },
    );
  }
}
