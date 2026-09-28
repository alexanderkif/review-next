import 'server-only';
import { createHmac } from 'node:crypto';
import { sql } from '@/lib/db';

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

let rateLimitTableReady: Promise<void> | undefined;
let lastCleanupAt = 0;

async function ensureRateLimitTable(): Promise<void> {
  if (!rateLimitTableReady) {
    rateLimitTableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS api_rate_limits (
          bucket_key CHAR(64) PRIMARY KEY,
          attempts INTEGER NOT NULL,
          reset_at TIMESTAMPTZ NOT NULL
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_api_rate_limits_reset_at
        ON api_rate_limits(reset_at)
      `;
    })().catch((error: unknown) => {
      rateLimitTableReady = undefined;
      throw error;
    });
  }

  await rateLimitTableReady;
}

export function getRateLimitIdentifier(headers: Headers): string {
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function consumeRateLimit(
  scope: string,
  identifier: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  await ensureRateLimitTable();

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is required for rate limiting.');

  const bucketKey = createHmac('sha256', secret)
    .update(`${scope}\0${identifier.trim().toLowerCase()}`)
    .digest('hex');

  const result = await sql`
    INSERT INTO api_rate_limits (bucket_key, attempts, reset_at)
    VALUES (${bucketKey}, 1, NOW() + (${windowSeconds} * INTERVAL '1 second'))
    ON CONFLICT (bucket_key) DO UPDATE SET
      attempts = CASE
        WHEN api_rate_limits.reset_at <= NOW() THEN 1
        ELSE api_rate_limits.attempts + 1
      END,
      reset_at = CASE
        WHEN api_rate_limits.reset_at <= NOW()
          THEN NOW() + (${windowSeconds} * INTERVAL '1 second')
        ELSE api_rate_limits.reset_at
      END
    RETURNING
      attempts,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM reset_at - NOW())))::INTEGER AS retry_after_seconds
  `;

  const now = Date.now();
  if (now - lastCleanupAt > 60 * 60 * 1000) {
    lastCleanupAt = now;
    void sql`
      DELETE FROM api_rate_limits
      WHERE reset_at < NOW() - INTERVAL '1 day'
    `.catch(() => {
      lastCleanupAt = 0;
    });
  }

  return {
    allowed: Number(result[0].attempts) <= maxAttempts,
    retryAfterSeconds: Number(result[0].retry_after_seconds),
  };
}
