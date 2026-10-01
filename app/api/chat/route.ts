import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { getAiSettings } from '@/lib/ai-settings';
import { buildChatSystemPrompt } from '@/lib/chat-prompt';
import { ChatRequestSchema } from '@/types/schemas';
import { consumeRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

export const maxDuration = 60; // Vercel: allow up to 60s for Gemini API calls

const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const gemini = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

// Track Gemini degraded state — if it returned 503, skip it for 5 minutes
// (module-level: persists within a warm serverless instance, resets on cold start)
let geminiDegradedUntil = 0;

// Groq is the default provider (faster, higher free limits).
// Gemini is used as fallback when Groq fails.

const GLOBAL_RPM_LIMIT = 13;
const RPH_LIMIT = 20;
const RPD_LIMIT = 450;

export async function POST(req: NextRequest) {
  const ip = getRateLimitIdentifier(req.headers);
  const dailyLimit = await consumeRateLimit('chat-global-daily', 'all', RPD_LIMIT, 86_400);
  if (!dailyLimit.allowed) {
    return NextResponse.json(
      { error: 'Daily message limit reached. Please come back tomorrow.' },
      { status: 429, headers: { 'Retry-After': String(dailyLimit.retryAfterSeconds) } },
    );
  }

  const minuteLimit = await consumeRateLimit('chat-global-minute', 'all', GLOBAL_RPM_LIMIT, 60);
  if (!minuteLimit.allowed) {
    return NextResponse.json(
      { error: 'Slow down a little — please wait a moment before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(minuteLimit.retryAfterSeconds) } },
    );
  }

  const hourlyLimit = await consumeRateLimit('chat-ip-hour', ip, RPH_LIMIT, 3_600);
  if (!hourlyLimit.allowed) {
    return NextResponse.json(
      { error: 'Hourly message limit reached. Please come back in an hour.' },
      { status: 429, headers: { 'Retry-After': String(hourlyLimit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const validationResult = ChatRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ error: 'No valid messages provided.' }, { status: 400 });
  }

  const validMessages = validationResult.data.messages.slice(-10).map((message) => ({
    role: message.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: message.content }],
  }));

  const allButLast = validMessages.slice(0, -1);
  const firstUserIndex = allButLast.findIndex((message) => message.role === 'user');
  const history = firstUserIndex === -1 ? [] : allButLast.slice(firstUserIndex);
  const lastUserText = validMessages[validMessages.length - 1].parts[0].text;

  // Model names live in the database (ai_settings). A provider is considered available
  // only when both its API key and its model name are configured.
  const settings = await getAiSettings();
  const groqModel = settings.groq_model;
  const geminiModel = settings.gemini_model;

  const geminiAvailable = gemini !== null && geminiModel !== '';
  const groqAvailable = groq !== null && groqModel !== '';

  if (!geminiAvailable && !groqAvailable) {
    console.error(
      '[chat/route] No AI model configured (empty ai_settings or providers not configured).',
    );
    return NextResponse.json(
      {
        error:
          'Sorry — my AI assistant stepped away for a moment. Please try again a little later.',
      },
      { status: 503 },
    );
  }

  // The system prompt (safety floor + persona + DB facts + extra context) is assembled
  // entirely on the server. The client only ever sends the conversation messages and
  // never sees this content.
  const systemPrompt = await buildChatSystemPrompt(settings);

  const groqMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map((message) => ({
      role: message.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: message.parts[0].text,
    })),
    { role: 'user' as const, content: lastUserText },
  ];

  async function tryGroq(): Promise<string> {
    if (!groq) throw new Error('Groq provider is not configured');

    const completion = await groq.chat.completions.create({
      model: groqModel,
      messages: groqMessages,
      max_tokens: 400,
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content ?? '';
  }

  async function tryGemini(): Promise<string> {
    if (!gemini) throw new Error('Gemini provider is not configured');

    const chat = gemini.chats.create({
      model: geminiModel,
      config: { systemInstruction: systemPrompt, maxOutputTokens: 400, temperature: 0.5 },
      history,
    });
    const response = await chat.sendMessage({ message: lastUserText });
    return response.text ?? '';
  }

  try {
    let responseText: string;

    if (geminiAvailable) {
      // Gemini is primary — use it first, then fall back to Groq if it fails
      const now = Date.now();
      if (now < geminiDegradedUntil) {
        if (!groqAvailable) {
          throw new Error('Both providers unavailable');
        }
        try {
          responseText = await tryGroq();
        } catch (err: unknown) {
          const e = err as { status?: number };
          console.error('[chat/route] Groq fallback failed:', e?.status);
          throw err;
        }
      } else {
        try {
          responseText = await tryGemini();
          geminiDegradedUntil = 0;
        } catch (err: unknown) {
          const e = err as { status?: number; httpErrorCode?: number };
          const httpStatus = e?.status ?? e?.httpErrorCode;
          if (httpStatus === 503) geminiDegradedUntil = Date.now() + 5 * 60_000;

          if (groqAvailable) {
            try {
              responseText = await tryGroq();
            } catch (groqErr: unknown) {
              const groqError = groqErr as { status?: number };
              console.error(
                '[chat/route] Gemini failed and Groq fallback failed:',
                groqError?.status,
              );
              throw groqErr;
            }
          } else {
            throw err;
          }
        }
      }
    } else if (groqAvailable) {
      // No Gemini key — use Groq only
      try {
        responseText = await tryGroq();
      } catch (err: unknown) {
        const e = err as { status?: number };
        console.error('[chat/route] Groq error:', e?.status);
        throw err;
      }
    } else {
      throw new Error('Both providers unavailable');
    }

    return NextResponse.json({ reply: responseText });
  } catch (err: unknown) {
    const error = err as { status?: number; httpErrorCode?: number; message?: string };
    const httpStatus = error?.status ?? error?.httpErrorCode;
    console.error('[chat/route] error:', httpStatus, error?.message);
    if (httpStatus === 429) {
      return NextResponse.json(
        { error: "You're sending messages a bit too fast 🙂 Please wait a few seconds." },
        { status: 429 },
      );
    }
    if (httpStatus === 503) {
      return NextResponse.json(
        { error: 'The AI is a little overloaded right now. Please try again in a few seconds.' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: 'Oops, something went wrong on my side. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
