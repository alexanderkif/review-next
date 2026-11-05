// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ sql: mocks.sql }));
vi.mock('@/lib/email-service', () => ({ sendWelcomeEmail: mocks.sendWelcomeEmail }));

import { GET, POST } from '@/api/auth/verify-email/route';

const verifiedTokenUser = {
  id: 10,
  name: 'E2E test user',
  email: 'e2e@example.com',
  email_verification_expires: new Date(Date.now() + 60_000),
  email_verified: false,
};

function request(method: 'GET' | 'POST', token = 'valid-token') {
  return new NextRequest(`http://localhost/api/auth/verify-email?token=${token}`, { method });
}

describe('email verification route', () => {
  beforeEach(() => {
    mocks.sql.mockReset().mockResolvedValue([]);
    mocks.sendWelcomeEmail.mockReset().mockResolvedValue(true);
  });

  it('GET validates the token but does not mutate verification state or send email', async () => {
    mocks.sql.mockResolvedValueOnce([verifiedTokenUser]);

    const response = await GET(request('GET'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ confirmationRequired: true });
    expect(mocks.sql).toHaveBeenCalledOnce();
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('rejects an empty token before querying the database', async () => {
    const response = await GET(request('GET', ''));

    expect(response.status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('rejects an unknown token after lookup', async () => {
    const response = await GET(request('GET', 'unknown'));

    expect(response.status).toBe(400);
    expect(mocks.sql).toHaveBeenCalledOnce();
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('rejects an expired token without mutating the account', async () => {
    mocks.sql.mockResolvedValueOnce([
      { ...verifiedTokenUser, email_verification_expires: new Date(Date.now() - 60_000) },
    ]);

    const response = await POST(request('POST'));

    expect(response.status).toBe(400);
    expect(mocks.sql).toHaveBeenCalledOnce();
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('rejects a token without an expiration timestamp', async () => {
    mocks.sql.mockResolvedValueOnce([{ ...verifiedTokenUser, email_verification_expires: null }]);

    const response = await GET(request('GET'));

    expect(response.status).toBe(400);
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('confirms the email and sends the welcome message after POST', async () => {
    mocks.sql.mockResolvedValueOnce([verifiedTokenUser]).mockResolvedValueOnce([{ id: 10 }]);

    const response = await POST(request('POST'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ verified: true });
    expect(mocks.sql).toHaveBeenCalledTimes(2);
    expect(mocks.sendWelcomeEmail).toHaveBeenCalledWith(
      verifiedTokenUser.email,
      verifiedTokenUser.name,
    );
  });

  it('does not send a welcome message when the token was already consumed', async () => {
    mocks.sql.mockResolvedValueOnce([verifiedTokenUser]).mockResolvedValueOnce([]);

    const response = await POST(request('POST'));

    expect(response.status).toBe(400);
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('does not send a second welcome message for an already verified account', async () => {
    mocks.sql.mockResolvedValueOnce([{ ...verifiedTokenUser, email_verified: true }]);

    const response = await POST(request('POST'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ alreadyVerified: true });
    expect(mocks.sql).toHaveBeenCalledOnce();
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });
});
