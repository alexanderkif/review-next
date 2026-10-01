-- AI avatar configuration: persona, extra chat context and model names.
-- Idempotent: safe to run on databases that already have the table/row.
--
-- API keys (GROQ_API_KEY / GEMINI_API_KEY) intentionally stay in environment variables;
-- this table only stores the editable, non-secret configuration.

CREATE TABLE IF NOT EXISTS ai_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- Editable persona / tone / rules. An immutable safety floor is always prepended in code.
  chat_instructions TEXT NOT NULL DEFAULT '',
  -- Extra chat-only info (facts not present in the resume, anecdotes, etc.).
  chat_extra TEXT NOT NULL DEFAULT '',
  groq_model VARCHAR(120) NOT NULL DEFAULT 'openai/gpt-oss-20b',
  gemini_model VARCHAR(120) NOT NULL DEFAULT 'gemini-3.5-flash-lite',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the singleton row exists.
INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
