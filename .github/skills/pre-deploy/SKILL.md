---
name: pre-deploy
description: "Pre-deployment audit for the review-next portfolio. USE WHEN: preparing to deploy, before git push to main, before Vercel deploy. Runs full checklist: build, lint, security (XSS/injection/env leaks), auth data isolation, unused code, secrets in files, README sync."
---

# Pre-Deploy Audit

Run all checks sequentially. Report every finding with file + line. At the end print a summary table with ✅/❌ per section.

---

## 1. Build & Types

```bash
npm run build
```

- Fix all TypeScript errors before proceeding
- Note any warnings (bundle size, missing keys, etc.)

---

## 2. Linter

```bash
npm run lint
```

- Zero errors required
- Warnings: review and fix if related to security or correctness

---

## 3. Dependency Security

```bash
npm audit --audit-level=moderate
```

Also check for unused dependencies:

```bash
npx depcheck
```

- Remove unused packages from `package.json`
- Flag `high` / `critical` vulnerabilities — must fix before deploy

---

## 4. Security — OWASP Top 10 Audit

### 4a. SQL Injection
- All DB queries must use tagged template literals: `` sql`...${variable}` ``
- Zero string concatenation in SQL: `"SELECT ... WHERE id = " + id` → FAIL
- Check all files in `app/api/` and `app/lib/`

### 4b. XSS (Cross-Site Scripting)
- Search for `dangerouslySetInnerHTML` — must have explicit justification
- User-supplied data rendered directly without sanitization → FAIL
- Check comment rendering, project descriptions, CV fields

### 4c. Authentication & Authorization
- Every admin API route (`app/api/admin/**`) must call `verifyAdminAuth()` before doing anything
- Routes that return user data must validate the requesting user owns that data
- Check `app/api/comments/[id]/route.ts` — can user A edit user B's comment?
- Check `app/api/images/` — can user A delete user B's image?

### 4d. Data Isolation Between Users
- No module-level mutable variables storing user data (e.g., `let currentUser = ...`)
- Server Actions in `actions.ts` — verify auth before mutating data
- All user-specific queries must include `WHERE user_id = ${userId}` (or equivalent)

### 4e. CSRF
- State-mutating operations use POST/PUT/DELETE (not GET)
- Server Actions are protected by Next.js CSRF token automatically
- Custom JWT endpoints in `/api/admin/login` — verify `SameSite` cookie attribute

### 4f. Security Headers
Check `next.config.ts` has headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 5. Console Logs in Production Code

Search for `console.log`, `console.error`, `console.warn` (excluding `logger.*` calls):

```
app/**/*.ts
app/**/*.tsx
```

All logging must go through `app/lib/logger.ts`. Remove or replace any raw `console.*` calls.

---

## 6. Unused Code

- Unused imports — TypeScript will catch most, also check manually in key files
- Dead functions / unreachable code
- Components imported in `index.ts` but never used in pages
- API routes that are no longer called from frontend

---

## 7. Environment Variables

Verify all required env vars are documented:

**Required for production (Vercel):**
```
POSTGRES_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_ID
GITHUB_SECRET
GEMINI_API_KEY
SMTP_HOST / SMTP_USER / SMTP_PASS (if email enabled)
```

- Check `app/lib/env-check.ts` — all required vars must be listed there
- No `!` non-null assertions on `process.env.*` without a runtime check

---

## 8. README & Docs

- `README.md` mentions current tech stack (Next.js 16, not 14/15)
- Setup instructions are accurate (correct env var names)
- No references to deprecated features or old architecture

---

## 9. Rate Limiting & Abuse Protection

- `/api/chat` — verify rate limiter is active (global RPM + per-IP per-hour + daily)
- `/api/auth/register` — check for brute-force protection
- `/api/admin/login` — check for brute-force protection

---

## 10. Final: Secrets Scan Across All Project Files

> Run this **last** — after all code corrections, refactoring, and doc updates are done.
> This catches any secrets accidentally introduced during the session.

Read the actual values from `.env.local` first, then search every tracked file for those values:

```bash
# 1. Find all env values (excluding comments and empty lines)
grep -v '^#' .env.local | grep '=' | cut -d'=' -f2- | grep -v '^$'

# 2. For each non-trivial value (length > 8), grep the entire repo
git grep -r "<value>" -- ':!.env*'
```

Also search by known patterns regardless of .env contents:

```
patterns to grep across ALL files (*.ts, *.tsx, *.js, *.md, *.sql, *.json, *.yaml, *.yml):
- postgres://
- postgresql://
- supabase.co
- mongodb+srv://
- sk-          (OpenAI keys)
- ghp_         (GitHub tokens)
- AIza         (Google API keys)
- eyJ          (raw JWT tokens)
- AKIA         (AWS keys)
```

**Verify `.gitignore`** covers:
```
.env
.env.local
.env.*.local
*.pem
*.key
```

**Check git history** for past leaks:
```bash
git log --all --full-history -- .env*
git log --all -p --follow -- "*.md" | grep -i "postgres\|secret\|password\|token"
```

- Any match → **BLOCKER**, do not deploy until removed from history (`git filter-repo` or BFG)

---

## Summary Report Format

After all checks, print:

| # | Check | Status | Issues |
|---|-------|--------|--------|
| 1 | Build & Types | ✅/❌ | ... |
| 2 | Lint | ✅/❌ | ... |
| 3 | npm audit | ✅/❌ | ... |
| 4a | SQL Injection | ✅/❌ | ... |
| 4b | XSS | ✅/❌ | ... |
| 4c | Auth/Authz | ✅/❌ | ... |
| 4d | Data Isolation | ✅/❌ | ... |
| 4e | CSRF | ✅/❌ | ... |
| 4f | Security Headers | ✅/❌ | ... |
| 5 | Console Logs | ✅/❌ | ... |
| 6 | Unused Code | ✅/❌ | ... |
| 7 | Env Vars Documented | ✅/❌ | ... |
| 8 | README Accuracy | ✅/❌ | ... |
| 9 | Rate Limiting | ✅/❌ | ... |
| 10 | **Secrets Scan (final)** | ✅/❌ | ... |

**Deploy decision**: READY / BLOCKED (list blockers)
| 6 | Console Logs | ✅/❌ | ... |
| 7 | Unused Code | ✅/❌ | ... |
| 8 | Env Vars Documented | ✅/❌ | ... |
| 9 | README Accuracy | ✅/❌ | ... |
| 10 | Rate Limiting | ✅/❌ | ... |

**Deploy decision**: READY / BLOCKED (list blockers)
