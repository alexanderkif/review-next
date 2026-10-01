import 'server-only';
import { sql } from '@/lib/db';

/**
 * AI avatar configuration stored in the `ai_settings` singleton row.
 *
 * API keys (GROQ_API_KEY / GEMINI_API_KEY) stay in environment variables.
 * Everything else — persona, extra context and the model names — lives ONLY in the
 * database, so it can be changed from the admin panel without a code change or redeploy.
 *
 * There are no model-name fallbacks: if a model name is empty, the chat route must not
 * call that provider and should surface an "unavailable" error to the user.
 */
export interface AiSettings {
  chat_instructions: string;
  chat_extra: string;
  groq_model: string;
  gemini_model: string;
}

const EMPTY_SETTINGS: AiSettings = {
  chat_instructions: '',
  chat_extra: '',
  groq_model: '',
  gemini_model: '',
};

function normalizeSettings(row: Record<string, unknown>): AiSettings {
  const text = (value: unknown): string => (typeof value === 'string' ? value : '');
  const model = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

  return {
    chat_instructions: text(row.chat_instructions),
    chat_extra: text(row.chat_extra),
    groq_model: model(row.groq_model),
    gemini_model: model(row.gemini_model),
  };
}

/**
 * Loads the AI settings from the database. If the row/table is missing (migration not
 * applied yet) or the database is unreachable, everything is returned empty so the chat
 * route can report that the assistant is temporarily unavailable.
 */
export async function getAiSettings(): Promise<AiSettings> {
  try {
    const rows = await sql`
      SELECT chat_instructions, chat_extra, groq_model, gemini_model
      FROM ai_settings
      WHERE id = 1
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { ...EMPTY_SETTINGS };
    }

    return normalizeSettings(rows[0] as unknown as Record<string, unknown>);
  } catch (error) {
    console.error('[ai-settings] Failed to load settings from the database:', error);
    return { ...EMPTY_SETTINGS };
  }
}

/** Persists the AI settings into the singleton row. */
export async function saveAiSettings(values: AiSettings): Promise<void> {
  await sql`
    INSERT INTO ai_settings (id, chat_instructions, chat_extra, groq_model, gemini_model, updated_at)
    VALUES (
      1,
      ${values.chat_instructions},
      ${values.chat_extra},
      ${values.groq_model},
      ${values.gemini_model},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      chat_instructions = EXCLUDED.chat_instructions,
      chat_extra = EXCLUDED.chat_extra,
      groq_model = EXCLUDED.groq_model,
      gemini_model = EXCLUDED.gemini_model,
      updated_at = NOW()
  `;
}
