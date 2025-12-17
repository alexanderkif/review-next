'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #1e40af 0%, #059669 25%, #7c3aed 50%, #0891b2 75%, #4338ca 100%)',
      backgroundAttachment: 'fixed'
    }} data-is-404>
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <div className="animate-float mb-8">
            <div className="text-8xl md:text-9xl font-bold text-white/20 mb-4">
              404
            </div>
            <div className="text-6xl md:text-7xl font-bold text-white mb-6 animate-glow">
              Oops!
            </div>
          </div>

          {/* Main message */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fade-in shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Page Not Found
            </h1>
            <p className="text-white/80 text-lg mb-6 leading-relaxed">
              It seems you&apos;ve landed on a page that doesn&apos;t exist. The link might 
              have been entered incorrectly or the page has been moved.
            </p>

            {/* Possible reasons */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold mb-3 text-white">Possible reasons:</h3>
              <ul className="text-sm text-white/70 space-y-1 text-left">
                <li>• Incorrect address entered in browser</li>
                <li>• Page was deleted or moved</li>
                <li>• Link is outdated or contains an error</li>
                <li>• You don&apos;t have access to this page</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="group">
                <div className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-all shadow-md hover:shadow-xl">
                  <Home size={18} />
                  <span>Home</span>
                </div>
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-all shadow-md hover:shadow-xl"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              
              <Link href="/projects" className="group">
                <div className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-all shadow-md hover:shadow-xl">
                  <Search size={18} />
                  <span>Projects</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Popular links */}
          <div className="mt-8 animate-fade-in">
            <h3 className="text-white font-semibold mb-4">Popular sections:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm shadow-md">
                  Resume
                </span>
              </Link>
              <Link href="/projects">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm shadow-md">
                  Projects
                </span>
              </Link>
              <Link href="/auth/login">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm shadow-md">
                  Login
                </span>
              </Link>
            </div>
          </div>

          {/* Error code for developers */}
          <div className="mt-8 text-xs text-white/40">
            <details className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <summary className="cursor-pointer hover:text-white/60 transition-colors">
                Technical information
              </summary>
              <div className="mt-2 text-left font-mono">
                <p>Error Code: 404</p>
                <p suppressHydrationWarning>Path: {typeof window !== 'undefined' ? window.location.pathname : 'Unknown'}</p>
                <p suppressHydrationWarning>Timestamp: {new Date().toISOString()}</p>
                <p suppressHydrationWarning>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
  );
};

export default NotFoundPage;
