'use client';

/**
 * Skip to Main Content link for keyboard accessibility
 * Allows keyboard users to bypass navigation and jump directly to main content
 */
export default function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="absolute top-4 left-4 z-[10001] -translate-y-20 rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white opacity-0 shadow-lg transition-all focus:translate-y-0 focus:opacity-100 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
