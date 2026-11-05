import { beforeEach, describe, expect, it, vi } from 'vitest';

const mailMocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mailMocks.createTransport,
  },
}));

vi.mock('@/lib/logger', () => ({
  serverLogger: {
    info: mailMocks.info,
    error: mailMocks.error,
  },
}));

import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email-service';

describe('email templates', () => {
  beforeEach(() => {
    vi.stubEnv('NEXTAUTH_URL', 'https://portfolio.example');
    vi.stubEnv('SMTP_HOST', 'smtp.example');
    mailMocks.sendMail.mockResolvedValue({ accepted: ['user@example.com'], rejected: [] });
    mailMocks.createTransport.mockReturnValue({ sendMail: mailMocks.sendMail });
  });

  it('escapes user-controlled names in verification HTML but preserves plain text', async () => {
    const name = '<img src=x onerror=alert(1)> & "Alex"';

    await expect(sendVerificationEmail('user@example.com', name, 'token123')).resolves.toBe(true);

    const message = mailMocks.sendMail.mock.calls[0][0];
    expect(message.html).toContain('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;Alex&quot;');
    expect(message.html).not.toContain('<img src=x');
    expect(message.text).toContain(`Hello, ${name}!`);
    expect(message.html).toContain('https://portfolio.example/auth/verify-email?token=token123');
  });

  it('escapes apostrophes in HTML template text', async () => {
    await sendWelcomeEmail('user@example.com', "O'Neil");

    expect(mailMocks.sendMail.mock.calls[0][0].html).toContain('O&#39;Neil');
  });

  it('reports SMTP failure instead of returning success', async () => {
    mailMocks.sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));

    await expect(sendWelcomeEmail('user@example.com', 'Alex')).resolves.toBe(false);
    expect(mailMocks.error).toHaveBeenCalled();
  });
});
