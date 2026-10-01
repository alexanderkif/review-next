# review-next

A portfolio website with a public CV, project pages, an admin area, email verification, image management, and an optional AI chat assistant.

## Stack

- Next.js 16 App Router, React 19, TypeScript 5
- Tailwind CSS 4
- PostgreSQL via the `postgres` package
- NextAuth v4, Zod 4
- ESLint 9 and Prettier 3

## Requirements

- Node.js 20.9 or newer
- npm
- A PostgreSQL database

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set the required values:

   ```env
   POSTGRES_URL="postgresql://user:password@host:5432/database"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="a-long-random-secret"
   ADMIN_SETUP_TOKEN="a-separate-random-secret-at-least-32-characters"
   ```

   Generate a secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Generate a separate value for `ADMIN_SETUP_TOKEN` before initializing the first administrator in production. It is optional in local development. Remove it from the production environment after bootstrap.

   Optional integrations:
   - Email verification uses one SMTP config in all environments: `SMTP_HOST` (defaults to `smtp.gmail.com`), `SMTP_PORT` (defaults to `587`), `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`. `EMAIL_USER` / `EMAIL_PASS` are read as a fallback for the user/password when the `SMTP_*` names are not set.
   - OAuth sign-in uses `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, and `GITHUB_SECRET`.
   - The chat assistant needs `GEMINI_API_KEY` and/or `GROQ_API_KEY`. Provider model names and the assistant persona/content are configured in the admin panel and stored in the database — see [AI Chat Assistant](#ai-chat-assistant).

   Keep `.env.local` private and never commit real credentials.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`. To initialize the database and create the first administrator, open `http://localhost:3000/admin/login` and follow the setup form. The PostgreSQL database must be reachable first.

## Database Migrations

SQL migrations live in [`migrations/`](migrations/) and are applied manually to the configured `POSTGRES_URL`. They are written to be idempotent, so running them repeatedly (or against an up-to-date database) is safe.

The chat assistant reads its configuration from the `ai_settings` table, added by [`migrations/2026-10-01_add_ai_settings.sql`](migrations/).

## AI Chat Assistant

The public widget (`app/components/ChatWidget.tsx`) posts the conversation to `/api/chat`. Only the messages leave the browser; the system prompt and all persona/profile data are assembled on the server, so they cannot be tampered with from the client.

Configuration lives in the `ai_settings` singleton row and is edited in the admin panel under the **AI Avatar** tab:

- `chat_instructions` — persona, tone, positioning and honest boundaries.
- `chat_extra` — additional context that is not part of the resume (hobbies, stories, etc.).
- `groq_model` / `gemini_model` — provider model names.

API keys stay in environment variables (`GROQ_API_KEY`, `GEMINI_API_KEY`). Only the model names and content are stored in the database, so they can be changed without a code change or redeploy. There are no model-name fallbacks: a provider is used only when it has both an API key and a non-empty model name.

For every message the server rebuilds the system prompt from three sources:

1. An immutable safety floor in `app/lib/chat-prompt.ts` (anti-prompt-injection, scope limit, no-hallucination rules). It is always prepended and cannot be edited from the UI.
2. The editable persona and extra context from `ai_settings`.
3. Structured facts read from the database: identity and contacts (email + LinkedIn only), summary, skills, experience, education, languages and all non-hidden projects.

The handler is stateless — there is no server-side session or cache. The conversation history is kept in the browser and sent with each request, and the settings and profile are read from the database on every message. If neither provider has both a key and a model name, the handler does not call any provider and returns a friendly "assistant unavailable" message, which the widget renders as an error bubble with a warning icon.

Provider order: Gemini is used first when configured, with Groq as the fallback.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run a production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format supported source and documentation files |
| `npm run format:check` | Check formatting without writing changes |
| `npx tsc --noEmit` | Run the TypeScript type check |

There is currently no automated test runner or test script.

## Project Structure

```text
app/
  admin/       Admin pages and editors
  api/         Route handlers
  auth/        Sign-in, registration, and email verification pages
  components/ Shared and feature components
  lib/         Database, authentication, and application services
  types/       Shared TypeScript types and Zod schemas
docs/          Accessibility and validation guidance
public/        Static assets
proxy.ts       Request proxy
```

## Documentation

- [Accessibility guide](docs/accessibility.md)
- [Request validation guide](docs/validation.md)
- [Agent guidance](AGENTS.md)

## Checks Before Deployment

Run the production build, type check, linter, and formatting check before deploying:

```bash
npm run build
npx tsc --noEmit
npm run lint
npm run format:check
```
