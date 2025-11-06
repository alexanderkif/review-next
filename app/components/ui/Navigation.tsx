'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LazyAvatar from './LazyAvatar';
import { User, Settings, LogOut } from 'lucide-react';
import { logger } from '../../lib/logger';

interface CVPersonalInfo {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

const Navigation = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [cvData, setCvData] = useState<CVPersonalInfo | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  // Update current path on client side to avoid SSR/hydration issues
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Helper functions for route checking
  const isProjectsPage = currentPath?.startsWith('/projects') || false;
  const isGlassPage = pathname?.startsWith('/projects') || pathname?.startsWith('/login') || pathname?.startsWith('/register') || false;

  // Fetch CV data for navigation
  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await fetch('/api/cv-data');
        if (response.ok) {
          const data = await response.json();
          setCvData({
            id: data.id,
            name: data.personalInfo.name,
            title: data.personalInfo.title,
            avatar: data.personalInfo.avatar || '',
          });
        }
      } catch (error) {
        logger.error('Error fetching CV data:', error);
        // Fallback to default values
        setCvData({
          id: '0',
          name: 'Portfolio',
          title: 'Software Developer',
          avatar: '',
        });
      }
    };

    fetchCVData();
  }, []);

  const handleSignOut = async () => {
    try {
      const pathToRedirect = currentPath || '/';
      await signOut({ redirect: false });
      window.location.href = pathToRedirect;
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  };

  // Get first letter of name for avatar
  const avatarLetter = cvData?.name ? cvData.name[0].toUpperCase() : 'P';

  // Base link styles
  const getLinkStyles = (isActive: boolean) => {
    const baseStyles = 'inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/80';
    
    if (isGlassPage) {
      return `${baseStyles} ${
        isActive 
          ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-500 hover:to-blue-500 hover:text-white shadow-[inset_-2px_-2px_1px_rgba(0,0,0,0.3)]' 
          : 'bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md text-white hover:from-white/30 hover:to-white/20 hover:text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]'
      } focus:ring-white/50`;
    }
    
    return `${baseStyles} ${
      isActive
        ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-500 hover:to-blue-500 hover:text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1),_inset_-2px_-2px_1px_rgba(0,0,0,0.3)]'
        : 'bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-slate-800 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc] hover:from-[#edf2f7] hover:to-[#e5ecf1] hover:text-slate-900'
    } focus:ring-emerald-500`;
  };

  const buttonStyles = (variant: 'glass' | 'secondary' | 'ghost' | 'primary') => {
    const baseStyles = 'px-4 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 inline-flex items-center gap-2 cursor-pointer';
    
    if (variant === 'glass') {
      return `${baseStyles} bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md text-white hover:from-white/30 hover:to-white/20 hover:text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] focus:ring-white/50`;
    }
    if (variant === 'secondary') {
      return `${baseStyles} bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-slate-800 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc] hover:from-[#edf2f7] hover:to-[#e5ecf1] hover:text-slate-900 focus:ring-emerald-500`;
    }
    if (variant === 'ghost') {
      return `${baseStyles} bg-transparent text-slate-600 hover:bg-[#e8edf2]/50 hover:text-slate-800 focus:ring-slate-400`;
    }
    // Primary button - with shadows on resume page, without on glass pages
    if (isGlassPage) {
      return `${baseStyles} bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-500 hover:to-blue-500 hover:text-white shadow-[inset_-2px_-2px_1px_rgba(0,0,0,0.3)] focus:ring-white/50`;
    }
    return `${baseStyles} bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-500 hover:to-blue-500 hover:text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1),_inset_-2px_-2px_1px_rgba(0,0,0,0.3)] focus:ring-emerald-500`;
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isGlassPage
          ? 'glass-nav' 
          : 'backdrop-blur-md bg-gradient-to-br from-[#e8edf2] via-[#f0f4f8] to-[#dfe7ed] border-b border-slate-200/30 shadow-[0_3px_9px_rgba(199,206,212,0.3),_0_-1.5px_6px_rgba(255,255,255,0.4),_inset_0_-2px_1.5px_#8a8a8acc]'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="hidden sm:flex items-center space-x-2 focus:outline-none rounded-lg"
            aria-label="Home"
          >
            <div className="overflow-hidden">
              <LazyAvatar
                avatarUrl={Array.isArray(cvData?.avatar) ? cvData.avatar[0] : cvData?.avatar}
                name={cvData?.name || 'Portfolio'}
                size="sm"
                className="w-10 h-10 rounded-xl border-2 border-white/20"
                fallbackLetter={avatarLetter}
                disableRotation={true}
              />
            </div>
            <span className={`text-xl font-bold transition-colors hidden lg:inline ${
              isGlassPage ? 'text-white' : 'text-slate-800'
            }`}>
              {isProjectsPage ? 'My Projects' : (cvData?.title || 'Loading...')}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center justify-between flex-1 md:flex-initial md:space-x-1">
            <ul className="flex items-center space-x-1" role="list">
              <li>
                <Link 
                  href="/"
                  className={getLinkStyles(currentPath === '/' || currentPath === null)}
                  aria-current={currentPath === '/' ? 'page' : undefined}
                  style={{ WebkitFontSmoothing: 'antialiased' }}
                >
                  <span className="relative z-10">Resume</span>
                </Link>
              </li>
              
              <li>
                <Link 
                  href="/projects"
                  className={getLinkStyles(isProjectsPage)}
                  aria-current={isProjectsPage ? 'page' : undefined}
                  style={{ WebkitFontSmoothing: 'antialiased' }}
                >
                  <span className="relative z-10">Projects</span>
                </Link>
              </li>
            </ul>

            {/* User Authentication Section */}
            <div className="md:ml-6 md:pl-6 md:border-l border-slate-400/60 flex items-center space-x-1 md:space-x-2">
              {status === 'loading' ? (
                <div 
                  className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"
                  role="status"
                  aria-label="Loading user data"
                />
              ) : session?.user ? (
                <>
                  {/* Show Admin panel only for Admins */}
                  {session.user.role === 'admin' && (
                    <Link 
                      href="/admin"
                      className={buttonStyles(isGlassPage ? 'glass' : 'secondary')}
                      aria-label="Admin panel"
                    >
                      <Settings size={16} aria-hidden="true" />
                      <span className="hidden md:inline">Admin</span>
                    </Link>
                  )}
                  
                  {/* User information */}
                  <div className="flex items-center space-x-2 text-sm" aria-label={`Logged in as ${session.user.name}`}>
                    {session.user.avatar_url ? (
                      <img 
                        src={session.user.avatar_url} 
                        alt={session.user.name || 'User avatar'}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User 
                        size={16} 
                        className={isGlassPage ? 'text-white/80' : 'text-slate-600'}
                        aria-hidden="true"
                      />
                    )}
                    <span className={`font-medium hidden md:block truncate max-w-[150px] ${
                      isGlassPage ? 'text-white' : 'text-slate-700'
                    }`}>
                      {session.user.name}
                    </span>
                  </div>
                  
                  {/* Logout button */}
                  <button
                    onClick={handleSignOut}
                    className={buttonStyles(isGlassPage ? 'glass' : 'secondary')}
                    aria-label="Log out"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href={`/login?callbackUrl=${encodeURIComponent(currentPath || '/')}`}
                    className={buttonStyles(isGlassPage ? 'glass' : 'ghost')}
                  >
                    Log In
                  </Link>
                  
                  <Link 
                    href="/register"
                    className={buttonStyles('primary')}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
