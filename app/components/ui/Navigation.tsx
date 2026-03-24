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
  id?: string;
  name: string;
  title: string;
  avatar: string;
}

interface NavigationProps {
  initialCvData?: CVPersonalInfo | null;
}

const Navigation = ({ initialCvData = null }: NavigationProps) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [cvData, setCvData] = useState<CVPersonalInfo | null>(initialCvData);

  // Helper functions for route checking
  const isProjectsPage = pathname?.startsWith('/projects') || false;
  const isClayPage = pathname === '/' || pathname?.startsWith('/admin') || false;

  // Fetch CV data only if not provided via SSR prop
  useEffect(() => {
    if (initialCvData) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = pathname || '/';
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
          ? 'theme-clay border-b border-slate-200/30 bg-gradient-to-br from-[#e8edf2] via-[#f0f4f8] to-[#dfe7ed] shadow-[0_3px_9px_rgba(199,206,212,0.3),_0_-1.5px_6px_rgba(255,255,255,0.4),_inset_0_-2px_1.5px_#8a8a8acc] backdrop-blur-md'
          : 'theme-glass glass-nav'
      }`}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Col 1: Logo — flex-1 so it takes equal space as auth, preventing center shift */}
          <div className="hidden flex-1 items-center sm:flex">
            <Link
              href={isProjectsPage ? '/projects' : '/'}
              className="flex items-center space-x-2 rounded-lg transition-all focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
              aria-label={isProjectsPage ? 'Projects' : 'Home'}
            >
              <div className="overflow-hidden">
                <LazyAvatar
                  avatarUrl={Array.isArray(cvData?.avatar) ? cvData.avatar[0] : cvData?.avatar}
                  name={cvData?.name || 'Portfolio'}
                  size="sm"
                  className="h-10 w-10 rounded-xl border-2 border-white/20"
                  fallbackLetter={avatarLetter}
                  disableRotation={true}
                />
              </div>
              <span
                className={`hidden text-xl font-bold transition-colors lg:inline ${
                  isClayPage ? 'text-slate-800' : 'text-white'
                }`}
              >
                {isProjectsPage ? 'My Projects' : cvData?.title}
              </span>
            </Link>
          </div>

          {/* Col 2: Navigation Links — flex-none, always truly centered */}
          <ul className="flex flex-none items-center space-x-1" role="list">
            <li>
              {pathname === '/' ? (
                <span
                  className={getLinkStyles(true)}
                  style={{ WebkitFontSmoothing: 'antialiased' }}
                  aria-current="page"
                >
                  <span className="relative z-10">Resume</span>
                </span>
              ) : (
                <Link
                  href="/"
                  className={getLinkStyles(false)}
                  style={{ WebkitFontSmoothing: 'antialiased' }}
                >
                  <span className="relative z-10">Resume</span>
                </Link>
              )}
            </li>

            <li>
              {isProjectsPage ? (
                <span
                  className={getLinkStyles(true)}
                  style={{ WebkitFontSmoothing: 'antialiased' }}
                  aria-current="page"
                >
                  <span className="relative z-10">Projects</span>
                </span>
              ) : (
                <Link
                  href="/projects"
                  className={getLinkStyles(false)}
                  style={{ WebkitFontSmoothing: 'antialiased' }}
                >
                  <span className="relative z-10">Projects</span>
                </Link>
              )}
            </li>
          </ul>

          {/* Col 3: Auth — flex-1 justify-end, mirrors logo column width */}
          <div className="flex flex-1 items-center justify-end space-x-1 border-slate-400/60 md:space-x-2 md:border-l md:pl-6">
            {status === 'loading' ? (
              <div
                className="invisible flex items-center space-x-1 md:space-x-2"
                aria-hidden="true"
              >
                <div className={buttonStyles('secondary')}>Log In</div>
                <div className={buttonStyles('primary')}>Register</div>
              </div>
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
                <div
                  className="flex items-center space-x-2 text-sm"
                  aria-label={`Logged in as ${session.user.name}`}
                >
                  {session.user.avatar_url ? (
                    <Image
                      src={session.user.avatar_url}
                      alt=""
                      width={24}
                      height={24}
                      sizes="24px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User
                      size={16}
                      className={isClayPage ? 'text-slate-600' : 'text-white/90'}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`hidden max-w-[150px] truncate font-medium md:block ${
                      isClayPage ? 'text-slate-700' : 'text-white'
                    }`}
                  >
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
                  href={`/auth/login?callbackUrl=${encodeURIComponent(pathname || '/')}`}
                  className={buttonStyles('secondary')}
                >
                  Log In
                </Link>

                <Link href="/auth/register" className={buttonStyles('primary')}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
