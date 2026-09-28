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
   - The chat assistant needs `GEMINI_API_KEY` or `GROQ_API_KEY`. Gemini is tried first when configured; Groq is the fallback.

   Keep `.env.local` private and never commit real credentials.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`. To initialize the database and create the first administrator, open `http://localhost:3000/admin/login` and follow the setup form. The PostgreSQL database must be reachable first.

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
