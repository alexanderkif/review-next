// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  hash: vi.fn(),
  generateVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
  consumeRateLimit: vi.fn(),
  getRateLimitIdentifier: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ sql: mocks.sql }));
vi.mock('bcryptjs', () => ({ default: { hash: mocks.hash } }));
vi.mock('@/lib/email-service', () => ({
  generateVerificationToken: mocks.generateVerificationToken,
  sendVerificationEmail: mocks.sendVerificationEmail,
}));
vi.mock('@/lib/rate-limit', () => ({
  consumeRateLimit: mocks.consumeRateLimit,
  getRateLimitIdentifier: mocks.getRateLimitIdentifier,
}));
vi.mock('@/lib/logger', () => ({
  serverLogger: { info: mocks.info, error: mocks.error },
}));

import { POST } from '@/api/auth/register/route';

function registrationRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('registration route', () => {
  beforeEach(() => {
    mocks.sql.mockReset().mockResolvedValue([]);
    mocks.hash.mockReset().mockResolvedValue('hashed-password');
    mocks.generateVerificationToken.mockReset().mockReturnValue('fixed-verification-token');
    mocks.sendVerificationEmail.mockReset().mockResolvedValue(true);
    mocks.consumeRateLimit.mockReset().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.getRateLimitIdentifier.mockReset().mockReturnValue('test-ip');
    mocks.info.mockReset();
    mocks.error.mockReset();
  });

  it('rejects invalid registration data before querying users', async () => {
    const response = await POST(registrationRequest({ name: '', email: 'bad', password: '123' }));

    expect(response.status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
    expect(mocks.hash).not.toHaveBeenCalled();
  });

  it('returns 429 before parsing or writing when the IP rate limit is exceeded', async () => {
    mocks.consumeRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 90 });

    const response = await POST(
      registrationRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('90');
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('does not hash or insert an existing account', async () => {
    mocks.sql.mockResolvedValueOnce([{ id: 2 }]);

    const response = await POST(
      registrationRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.sql).toHaveBeenCalledOnce();
    expect(mocks.hash).not.toHaveBeenCalled();
  });

  it('creates an unverified account and sends its verification email', async () => {
    mocks.sql.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 3,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        created_at: '2026-01-01',
      },
    ]);

    const response = await POST(
      registrationRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.user).toMatchObject({ id: 3, email_verified: false });
    expect(body).not.toHaveProperty('password');
    expect(body.user).not.toHaveProperty('password_hash');
    expect(mocks.hash).toHaveBeenCalledWith('password123', 12);
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      'fixed-verification-token',
    );
  });

  it('removes the newly created user if the verification email cannot be sent', async () => {
    mocks.sql
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 4,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      ])
      .mockResolvedValueOnce([]);
    mocks.sendVerificationEmail.mockResolvedValueOnce(false);

    const response = await POST(
      registrationRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    );

    expect(response.status).toBe(500);
    expect(mocks.sql).toHaveBeenCalledTimes(3);
    expect(mocks.sendVerificationEmail).toHaveBeenCalledOnce();
  });
});
