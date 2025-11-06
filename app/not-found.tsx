'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';
import { Card, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
          <Card className="text-white mb-8 animate-fade-in">
            <CardContent className="py-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Page Not Found
              </h1>
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                It seems you&apos;ve landed on a page that doesn&apos;t exist. The link might 
                have been entered incorrectly or the page has been moved.
              </p>

              {/* Possible reasons */}
              <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 text-white">Possible reasons:</h3>
                <ul className="text-sm text-white/80 space-y-1 text-left">
                  <li>• Incorrect address entered in browser</li>
                  <li>• Page was deleted or moved</li>
                  <li>• Link is outdated or contains an error</li>
                  <li>• You don&apos;t have access to this page</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="md" className="flex items-center gap-2">
                    <Home size={18} />
                    Home
                  </Button>
                </Link>
                
                <Button 
                  size="md" 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </Button>
                
                <Link href="/projects">
                  <Button size="md" className="flex items-center gap-2">
                    <Search size={18} />
                    Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional information */}
          <Card className="text-white/70 animate-fade-in">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <p>If the problem persists, contact us:</p>
                <Button size="sm" className="flex items-center gap-2">
                  <Mail size={16} />
                  alex@example.com
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Popular links */}
          <div className="mt-8 animate-fade-in">
            <h3 className="text-white font-semibold mb-4">Popular sections:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm">
                  Resume
                </span>
              </Link>
              <Link href="/projects">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm">
                  Projects
                </span>
              </Link>
              <Link href="/login">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm">
                  Login
                </span>
              </Link>
            </div>
          </div>

          {/* Error code for developers */}
          <div className="mt-8 text-xs text-white/40">
            <details className="bg-black/20 rounded-lg p-4 backdrop-blur-sm">
              <summary className="cursor-pointer hover:text-white/60 transition-colors">
                Technical information
              </summary>
              <div className="mt-2 text-left font-mono">
                <p>Error Code: 404</p>
                <p>Path: {typeof window !== 'undefined' ? window.location.pathname : 'Unknown'}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
                <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
  );
};

export default NotFoundPage;
