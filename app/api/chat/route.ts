import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { MY_CONTEXT } from '../../lib/chat-context';

export const maxDuration = 60; // Vercel: allow up to 60s for Gemini API calls

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Track Gemini degraded state — if it returned 503, skip it for 5 minutes
// (module-level: persists within a warm serverless instance, resets on cold start)
let geminiDegradedUntil = 0;

// Groq is the default provider (faster, higher free limits).
// Gemini is used as fallback when Groq fails.

// Rate limiter: global per-minute (hard Gemini project limit) + per-IP per-hour + global per-day
interface RateBucket {
  count: number;
  resetTime: number;
}
const perHourMap = new Map<string, RateBucket>();

// Global RPM — Gemini allows 15 RPM per project across ALL users
let globalMinCount = 0;
let globalMinReset = Date.now() + 60_000;
const GLOBAL_RPM_LIMIT = 13; // leave 2 as buffer under Gemini's 15 RPM

// Per-IP hourly cap — prevents a single user from burning the daily budget
const RPH_LIMIT = 20;

// Global RPD — Gemini allows 500 RPD per project
const RPD_LIMIT = 450;
const ONE_DAY_MS = 86_400_000;
let globalDailyCount = 0;
let globalDailyReset = Date.now() + ONE_DAY_MS;

function isRateLimited(ip: string): '429-minute' | '429-hour' | null {
  const now = Date.now();

  // Global per-minute check (protects against concurrent users hitting Gemini limit)
  if (now > globalMinReset) {
    globalMinCount = 0;
    globalMinReset = now + 60_000;
  }
  if (globalMinCount >= GLOBAL_RPM_LIMIT) return '429-minute';
  globalMinCount++;

  // Per-IP hourly check
  const hour = perHourMap.get(ip);
  if (!hour || now > hour.resetTime) {
    perHourMap.set(ip, { count: 1, resetTime: now + 3_600_000 });
  } else if (hour.count >= RPH_LIMIT) {
    return '429-hour';
  } else {
    hour.count++;
  }

  return null;
}

function isGlobalDailyLimitReached(): boolean {
  const now = Date.now();
  if (now > globalDailyReset) {
    globalDailyCount = 0;
    globalDailyReset = now + ONE_DAY_MS;
  }
  if (globalDailyCount >= RPD_LIMIT) return true;
  globalDailyCount++;
  return false;
}

interface RawMessage {
  role: unknown;
  content: unknown;
}
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isGlobalDailyLimitReached()) {
    return NextResponse.json(
      { error: 'Daily message limit reached. Please come back tomorrow.' },
      { status: 429 },
    );
  }

  const limited = isRateLimited(ip);
  if (limited === '429-minute') {
    return NextResponse.json(
      { error: 'Slow down a little — please wait a moment before sending another message.' },
      { status: 429 },
    );
  }
  if (limited === '429-hour') {
    return NextResponse.json(
      { error: 'Hourly message limit reached. Please come back in an hour.' },
      { status: 429 },
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
  }

  // Validate and sanitise messages — keep last 10, max 600 chars each (reduce token usage)
  const validMessages = (body.messages as RawMessage[])
    .filter(
      (m): m is { role: 'user' | 'model'; content: string } =>
        m !== null &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'model') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.content.slice(0, 600) }],
    }));

  if (validMessages.length === 0) {
    return NextResponse.json({ error: 'No valid messages.' }, { status: 400 });
  }

  // Prepare history (last message is sent separately)
  const allButLast = validMessages.slice(0, -1);
  const firstUserIndex = allButLast.findIndex((m) => m.role === 'user');
  const history = firstUserIndex === -1 ? [] : allButLast.slice(firstUserIndex);
  const lastUserText = validMessages[validMessages.length - 1].parts[0].text;

  // Groq history uses 'assistant' role instead of 'model'
  const groqMessages = [
    { role: 'system' as const, content: MY_CONTEXT },
    ...history.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.parts[0].text,
    })),
    { role: 'user' as const, content: lastUserText },
  ];

  async function tryGroq(): Promise<string> {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // free tier, fast, high quality
      messages: groqMessages,
      max_tokens: 400,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content ?? '';
  }

  async function tryGemini(): Promise<string> {
    const chat = gemini.chats.create({
      model: 'gemini-3.1-flash-lite-preview',
      config: { systemInstruction: MY_CONTEXT, maxOutputTokens: 400, temperature: 0.7 },
      history,
    });
    const response = await chat.sendMessage({ message: lastUserText });
    return response.text ?? '';
  }

  try {
    let responseText: string;

    if (process.env.GROQ_API_KEY) {
      // Groq is primary — fast, generous free limits
      try {
        responseText = await tryGroq();
      } catch (err: unknown) {
        const e = err as { status?: number };
        // Fall back to Gemini on any Groq error
        console.error('[chat/route] Groq error, falling back to Gemini:', e?.status);
        responseText = await tryGemini();
        geminiDegradedUntil = 0;
      }
    } else {
      // No Groq key — use Gemini with degraded-state tracking
      const now = Date.now();
      if (now < geminiDegradedUntil) {
        throw new Error('Both providers unavailable');
      }
      try {
        responseText = await tryGemini();
        geminiDegradedUntil = 0;
      } catch (err: unknown) {
        const e = err as { status?: number; httpErrorCode?: number };
        const httpStatus = e?.status ?? e?.httpErrorCode;
        if (httpStatus === 503) geminiDegradedUntil = Date.now() + 5 * 60_000;
        throw err;
      }
    }

    return NextResponse.json({ reply: responseText });
  } catch (err: unknown) {
    const error = err as { status?: number; httpErrorCode?: number; message?: string };
    const httpStatus = error?.status ?? error?.httpErrorCode;
    console.error('[chat/route] error:', httpStatus, error?.message);
    if (httpStatus === 429) {
      return NextResponse.json(
        { error: 'AI rate limit reached. Please try again in a moment.' },
        { status: 429 },
      );
    }
    if (httpStatus === 503) {
      return NextResponse.json(
        { error: 'AI is temporarily overloaded. Please try again in a few seconds.' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to get a response. Please try again.' },
      { status: 500 },
    );
  }
}
