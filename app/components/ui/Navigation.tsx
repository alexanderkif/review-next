'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const isClayPage = pathname === '/' || pathname?.startsWith('/admin') || false;

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
    if (isActive) {
      return 'btn is-active';
    }
    // On clay pages (resume, admin), use btn-secondary for inactive links
    return isClayPage ? 'btn btn-secondary' : 'btn';
  };

  const buttonStyles = (variant: 'primary' | 'secondary') => {
    if (variant === 'primary') {
      return 'btn btn-primary';
    }
    // On clay pages (resume, admin), use btn-secondary
    return isClayPage ? 'btn btn-secondary' : 'btn';
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isClayPage
          ? 'theme-clay backdrop-blur-md bg-gradient-to-br from-[#e8edf2] via-[#f0f4f8] to-[#dfe7ed] border-b border-slate-200/30 shadow-[0_3px_9px_rgba(199,206,212,0.3),_0_-1.5px_6px_rgba(255,255,255,0.4),_inset_0_-2px_1.5px_#8a8a8acc]'
          : 'theme-glass glass-nav'
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
              isClayPage ? 'text-slate-800' : 'text-white'
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
                      className={buttonStyles('secondary')}
                      aria-label="Admin panel"
                    >
                      <Settings size={16} aria-hidden="true" />
                      <span className="hidden md:inline">Admin</span>
                    </Link>
                  )}
                  
                  {/* User information */}
                  <div className="flex items-center space-x-2 text-sm" aria-label={`Logged in as ${session.user.name}`}>
                    {session.user.avatar_url ? (
                      <Image 
                        src={session.user.avatar_url} 
                        alt={session.user.name || 'User avatar'}
                        width={24}
                        height={24}
                        sizes="24px"
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User 
                        size={16} 
                        className={isClayPage ? 'text-slate-600' : 'text-white/80'}
                        aria-hidden="true"
                      />
                    )}
                    <span className={`font-medium hidden md:block truncate max-w-[150px] ${
                      isClayPage ? 'text-slate-700' : 'text-white'
                    }`}>
                      {session.user.name}
                    </span>
                  </div>
                  
                  {/* Logout button */}
                  <button
                    onClick={handleSignOut}
                    className={buttonStyles('secondary')}
                    aria-label="Log out"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href={`/auth/login?callbackUrl=${encodeURIComponent(currentPath || '/')}`}
                    className={buttonStyles('secondary')}
                  >
                    Log In
                  </Link>
                  
                  <Link 
                    href="/auth/register"
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
