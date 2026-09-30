# Typography Scale

The site uses Tailwind CSS text utilities, which are defined in `rem` (relative to the
`16px` root font size). Do not hard-code `px` font sizes or introduce new ad-hoc steps of
the scale — pick the semantic role below instead.

## Scale

| Role | Utility | rem | px (16px root) | Weight |
| --- | --- | --- | --- | --- |
| Display (hero name) | `text-3xl` | 1.875rem | 30 | `font-bold` |
| Page title (`h1`/`h2` of a page) | `text-2xl` | 1.5rem | 24 | `font-bold` |
| Section title (`CardTitle`) | `text-lg` | 1.125rem | 18 | `font-semibold` |
| Lead / subtitle (under a heading) | `text-lg` | 1.125rem | 18 | normal |
| Item title (job, degree) | `text-base` | 1rem | 16 | `font-semibold` |
| Brand (nav / admin header) | `text-base` | 1rem | 16 | `font-semibold` |
| Body / description | `text-sm` | 0.875rem | 14 | normal |
| Meta (dates, captions, helper text) | `text-xs` | 0.75rem | 12 | normal |

## Rules

- Page titles are always `text-2xl font-bold`.
- Section titles come from `CardTitle` (`app/components/ui/Card.tsx`) and default to
  `text-lg font-semibold`; only override the size for a deliberate exception.
- The brand in the navigation and the admin header both use `text-base font-semibold`, and
  the label must be truncatable (`truncate` + a `max-w-*`) so long titles never wrap.
- Body copy inside cards is `text-sm`; use `text-base` only for item titles.
- A lead/subtitle directly under a heading uses `text-lg`. Short helper captions in forms
  and admin panels (e.g. under a login title) use `text-sm` instead.

## Exemptions

Decorative or layout-driven sizes are intentionally outside this scale:

- `404` / "Oops!" artwork (`app/not-found.tsx`).
- Avatar fallback letters (`app/components/ui/LazyAvatar.tsx`).
- Project cover placeholders and responsive metric numbers
  (`app/components/ProjectCard.tsx`, `app/projects/page.tsx`).
