# Copilot Instructions — review-next

Portfolio website built with Next.js App Router (16.x), React 19, TypeScript, PostgreSQL, Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16 App Router — use Server Components by default, add `'use client'` only when needed (interactivity, browser APIs, hooks)
- **Database**: `postgres` npm package (raw SQL, no ORM) — always import `sql` from `@/lib/db`, never create new `postgres()` instances
- **Auth**: NextAuth v4 with JWT strategy — roles: `'user'` | `'admin'`
- **Styles**: Tailwind CSS v4 (PostCSS) — utility classes only, no CSS modules
- **Validation**: Zod at API boundaries
- **Icons**: lucide-react
- **Charts**: recharts

## Code Conventions

### Server vs Client
- Server-only modules must start with `import 'server-only'` (db.ts, image-service.ts, cv-service.ts, admin-auth.ts)
- Server actions in `app/lib/actions.ts` start with `'use server'`
- Client components start with `'use client'`

### Database
```ts
// ✅ Always use the shared singleton
import { sql } from '@/lib/db';
const result = await sql`SELECT * FROM users WHERE id = ${id}`;

// ❌ Never create a new pool
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
```

### API Routes
- Return `NextResponse.json(...)` with explicit TypeScript return types
- Validate body with Zod before using
- Check auth with `verifyAdminAuth()` from `@/lib/admin-auth` for admin routes

### Caching
- Use `unstable_cache` for cross-request caching, wrap with `React.cache()` for per-request deduplication
- Invalidate via `revalidateTag('cv')` or `revalidatePath(...)`

### Components
- Shared UI atoms → `app/components/ui/`
- Feature components → `app/components/`
- Charts → `app/components/charts/`

## Themes

Two visual themes coexist on one site:
- **`theme-clay`** — neumorphic, light (resume `/` and admin `/admin`)
- **`theme-glass`** — glassmorphism, dark (projects `/projects`, auth `/auth`)

Add theme-aware classes: `.theme-clay .card { ... }` and `.theme-glass .card { ... }` in `globals.css`.

## File Structure

```
app/
  api/          # API route handlers (route.ts)
  components/   # React components
    ui/         # Shared atoms (Button, Card, Navigation, etc.)
    charts/     # Recharts wrappers
  lib/          # Server-side services and utilities
    db.ts       # Shared PostgreSQL singleton ← import sql from here
    cv-service.ts
    image-service.ts
    actions.ts  # Server actions
  types/        # Shared TypeScript types
  globals.css   # Tailwind + CSS custom properties
```

## What NOT to do

- Do not create new `postgres()` instances — always use `import { sql } from '@/lib/db'`
- Do not add `console.log` in production code
- Do not use fetch inside Server Components to call own API routes — call service functions directly
- Do not use CSS modules — use Tailwind utility classes
- Do not hardcode color values — use Tailwind tokens or existing CSS variables
