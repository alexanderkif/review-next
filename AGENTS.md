# Agents & Skills

This file defines the specialized agents and skills available for the `review-next` project. Use these to guide the AI in performing specific tasks or adhering to project-specific standards.

## 🤖 Project Agents

### 🛠 Development Agent (Default)
The primary agent for general coding, refactoring, and feature implementation.
- **Focus**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- **Core Principles**:
    - Use Server Components by default.
    - Use `sql` from `@/lib/db` for all database operations.
    - Follow the theme-aware styling (Claymorphism & Glassmorphism).
    - Ensure Zod validation at all API boundaries.

### 🎨 UI/UX & Accessibility Agent
Specialized in creating accessible, high-quality user interfaces.
- **Focus**: WCAG 2.2 AAA compliance, Tailwind CSS 4, Framer Motion (if applicable), and responsive design.
- **Key Guidelines**:
    - Ensure all form inputs have proper `<label>` and `aria` attributes.
    - Implement focus traps for modals and skip-to-main links.
    - Maintain a 7:1 contrast ratio for normal text.
    - Respect `prefers-reduced-motion` preferences.

### 🛡 Security & Audit Agent
Specialized in security reviews and pre-deployment audits.
- **Focus**: OWASP Top 10, SQL injection prevention, XSS mitigation, and Auth isolation.
- **Key Guidelines**:
    - Verify `verifyAdminAuth()` on all admin routes.
    - Ensure all DB queries use tagged template literals.
    - Audit for `dangerouslySetInnerHTML` and raw `console.log` calls.

## 🛠 Skills

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
