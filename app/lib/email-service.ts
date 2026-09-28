import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { serverLogger } from '@/lib/logger';

function getMailErrorDetails(error: unknown) {
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

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  pass: string | undefined;
  from: string | undefined;
};

// Single source of truth for SMTP settings in every environment.
// Prefers SMTP_* and falls back to the legacy EMAIL_USER / EMAIL_PASS names,
// so one set of variables works for both local development and production.
function getMailConfig(): MailConfig {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  return { host, port, secure, user, pass, from: process.env.EMAIL_FROM || user };
}

// Create email transport
const createTransporter = (config: MailConfig) =>
  nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

// Generate verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  const config = getMailConfig();

  serverLogger.info('[email] verification send started', {
    transport: 'smtp',
    smtpHost: config.host,
    smtpPort: config.port,
    smtpSecure: config.secure,
    authConfigured: Boolean(config.user && config.pass),
    senderSource: process.env.EMAIL_FROM ? 'EMAIL_FROM' : config.user ? 'user' : 'missing',
    nextAuthUrlConfigured: Boolean(process.env.NEXTAUTH_URL),
  });

  try {
    const transporter = createTransporter(config);

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: config.from,
      to: email,
      subject: 'Email Verification - Portfolio Site',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
            .token { background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome!</h1>
            </div>
            <div class="content">
              <h2>Hello, ${name}!</h2>
              <p>Thank you for registering on our portfolio site. To complete your registration, please verify your email address.</p>
              
              <p>Click the button below to verify:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="token">${verificationUrl}</div>
              
              <p><strong>Important:</strong> This link is valid for 24 hours.</p>
              
              <hr style="margin: 30px 0; border: none; height: 1px; background: #ddd;">
              
              <p>If you didn't register on our site, simply ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Portfolio Site. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello, ${name}!
        
        Thank you for registering on our portfolio site. 
        To complete your registration, please verify your email address.
        
        Click the link to verify:
        ${verificationUrl}
        
        This link is valid for 24 hours.
        
        If you didn't register on our site, simply ignore this email.
        
        © ${new Date().getFullYear()} Portfolio Site
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    serverLogger.info('[email] verification send succeeded', {
      acceptedCount: result.accepted.length,
      rejectedCount: result.rejected.length,
    });
    return true;
  } catch (error) {
    serverLogger.error('[email] verification send failed', getMailErrorDetails(error));
    return false;
  }
}

// Send successful verification notification
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const config = getMailConfig();

  try {
    const transporter = createTransporter(config);

    const mailOptions = {
      from: config.from,
      to: email,
      subject: '✅ Email Verified - Welcome!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
            .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email Verified!</h1>
            </div>
            <div class="content">
              <h2>Great, ${name}!</h2>
              <p>Your email address has been successfully verified. Now you can use all the features of our site:</p>
              
              <div class="features">
                <div class="feature">
                  <strong>💬 Comments</strong><br>
                  Leave comments on projects and participate in discussions
                </div>
                <div class="feature">
                  <strong>❤️ Likes</strong><br>
                  Like projects you enjoy
                </div>
                <div class="feature">
                  <strong>🔔 Notifications</strong><br>
                  Get notified about new projects and updates
                </div>
              </div>
              
              <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Login to Account</a>
              
              <p>Thank you for joining us!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Portfolio Site. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    serverLogger.error('[email] welcome send failed', getMailErrorDetails(error));
    return false;
  }
}
