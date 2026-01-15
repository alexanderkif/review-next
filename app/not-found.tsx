'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          'linear-gradient(135deg, #1e40af 0%, #059669 25%, #7c3aed 50%, #0891b2 75%, #4338ca 100%)',
        backgroundAttachment: 'fixed',
      }}
      data-is-404
    >
      <div className="mx-auto max-w-2xl text-center">
        {/* Animated 404 */}
        <div className="animate-float mb-8">
          <div className="mb-4 text-8xl font-bold text-white/20 md:text-9xl">404</div>
          <div className="animate-glow mb-6 text-6xl font-bold text-white md:text-7xl">Oops!</div>
        </div>

        {/* Main message */}
        <div className="animate-fade-in mb-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-md">
          <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">Page Not Found</h1>
          <p className="mb-6 text-lg leading-relaxed text-white/80">
            It seems you&apos;ve landed on a page that doesn&apos;t exist. The link might have been
            entered incorrectly or the page has been moved.
          </p>

          {/* Possible reasons */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <h3 className="mb-3 font-semibold text-white">Possible reasons:</h3>
            <ul className="space-y-1 text-left text-sm text-white/70">
              <li>• Incorrect address entered in browser</li>
              <li>• Page was deleted or moved</li>
              <li>• Link is outdated or contains an error</li>
              <li>• You don&apos;t have access to this page</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/" className="group">
              <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-white shadow-md transition-all hover:bg-white/20 hover:shadow-xl">
                <Home size={18} />
                <span>Home</span>
              </div>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-white shadow-md transition-all hover:bg-white/20 hover:shadow-xl"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <Link href="/projects" className="group">
              <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-white shadow-md transition-all hover:bg-white/20 hover:shadow-xl">
                <Search size={18} />
                <span>Projects</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Popular links */}
        <div className="animate-fade-in mt-8">
          <h3 className="mb-4 font-semibold text-white">Popular sections:</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <span className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white">
                Resume
              </span>
            </Link>
            <Link href="/projects">
              <span className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white">
                Projects
              </span>
            </Link>
            <Link href="/auth/login">
              <span className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white">
                Login
              </span>
            </Link>
          </div>
        </div>

        {/* Error code for developers */}
        <div className="mt-8 text-xs text-white/40">
          <details className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <summary className="cursor-pointer transition-colors hover:text-white/80 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none">
              Technical information
            </summary>
            <div className="mt-2 text-left font-mono">
              <p>Error Code: 404</p>
              <p suppressHydrationWarning>
                Path: {typeof window !== 'undefined' ? window.location.pathname : 'Unknown'}
              </p>
              <p suppressHydrationWarning>Timestamp: {new Date().toISOString()}</p>
              <p suppressHydrationWarning>
                User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
