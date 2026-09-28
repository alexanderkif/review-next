# Agents & Skills

This file defines project-specific guidance for agents working in `review-next`. Keep durable conventions here and in the linked documentation; do not treat completed migration plans as active instructions.

## 🤖 Project Agents

### 🛠 Development Agent (Default)
The primary agent for general coding, refactoring, and feature implementation.
- **Focus**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- **Core Principles**:
    - Use Server Components by default.
    - Use `sql` from `@/lib/db` for all database operations.
    - Follow the theme-aware styling (Claymorphism & Glassmorphism).
    - Validate untrusted API bodies, query parameters, and route parameters with centralized Zod schemas before side effects.
    - Follow [docs/validation.md](docs/validation.md) for schema and validation patterns.

### 🎨 UI/UX & Accessibility Agent
Specialized in creating accessible, high-quality user interfaces.
- **Focus**: WCAG 2.2 guidance, Tailwind CSS 4, Framer Motion (if applicable), and responsive design.
- **Key Guidelines**:
    - Ensure all form inputs have proper `<label>` and `aria` attributes.
    - Implement focus traps for modals and skip-to-main links.
    - Check contrast against the target WCAG level; do not claim full conformance without auditing the affected experience.
    - Respect `prefers-reduced-motion` preferences.
    - Consult [docs/accessibility.md](docs/accessibility.md) for current implementation notes and manual checks.

### 🛡 Security & Audit Agent
Specialized in security reviews and pre-deployment audits.
- **Focus**: OWASP Top 10, SQL injection prevention, XSS mitigation, and Auth isolation.
- **Key Guidelines**:
    - Verify `verifyAdminAuth()` on all admin routes.
    - Ensure all DB queries use tagged template literals.
    - Audit for `dangerouslySetInnerHTML` and raw `console.log` calls.

## 🛠 Skills

### Validation and Checks
- Validation guidance: `docs/validation.md`.
- No automated test runner is configured; do not claim tests passed unless a test suite is added and run.
- For code changes, run `npx tsc --noEmit`, `npm run lint`, and `npm run format:check` when applicable.

### `pre-deploy`
**Description**: Pre-deployment audit for the review-next portfolio.
**Use When**: Preparing to deploy, before git push to main, or before Vercel deploy.
**Checklist**:
- Build & Types: `npm run build` (Zero TS errors).
- Linter: `npm run lint` (Zero errors).
- Dependency Security: `npm audit` and `npx depcheck`.
- Security Audit: SQL Injection, XSS, Auth/Authz, Data Isolation, CSRF, Security Headers.
- Production Logs: Remove raw `console.*` calls.

### `accessibility-audit`
**Description**: Audit the project against WCAG 2.2 AAA standards.
**Use When**: Reviewing new UI components or performing a full accessibility check.
**Checklist**:
- Form Accessibility (Labels, `aria-describedby`, `aria-invalid`).
- Skip to Main Content.
- ARIA Live Regions for toasts.
- Modal Focus Management (Focus traps, Escape key).
- Reduced Motion Support.
- Color Contrast (7:1 ratio).
- Keyboard Navigation & Touch Targets (≥ 44x44px).
- Semantic HTML Hierarchy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
