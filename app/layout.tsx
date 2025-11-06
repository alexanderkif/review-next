import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "./components/ConditionalNavigation";
import SessionProvider from "./components/SessionProvider";
import { ToastProvider } from "./components/ui/ToastContainer";
import { ConfirmProvider } from "./components/ui/ConfirmProvider";
import { validateEnvironment } from "./lib/env-check";
import { getCVData } from "./lib/cv-service";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";
import ClientThemeSync from "./components/ClientThemeSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cvData = await getCVData();
  
  if (!cvData) {
    return {
      title: {
        default: "Portfolio Website",
        template: "%s | Portfolio"
      },
      description: "Professional portfolio website showcasing software development skills and experience.",
      keywords: "software developer, portfolio, javascript, typescript, react, nextjs",
    };
  }

  const { personalInfo, skills } = cvData;
  const allSkills = [...skills.frontend, ...skills.tools, ...skills.backend];
  
  return {
    title: {
      default: `${personalInfo.name} - ${personalInfo.title}`,
      template: `%s | ${personalInfo.name} Portfolio`
    },
    description: `${personalInfo.title} portfolio. ${cvData.about?.split('\n')[0]?.replace(/[•\-]\s*/, '') || 'Professional experience in modern software development technologies.'}`,
    keywords: [
      personalInfo.title?.toLowerCase(),
      "portfolio",
      ...allSkills.map(skill => skill.toLowerCase()),
      personalInfo.name?.toLowerCase().replace(/\s+/g, ' ')
    ].filter(Boolean).join(", "),
    authors: [{ name: personalInfo.name }],
    creator: personalInfo.name,
    openGraph: {
      title: `${personalInfo.name} - ${personalInfo.title}`,
      description: `${personalInfo.title} portfolio. Professional experience in modern software development.`,
      url: personalInfo.website || undefined,
      siteName: `${personalInfo.name} Portfolio`,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${personalInfo.name} - ${personalInfo.title}`,
      description: `${personalInfo.title} portfolio. Professional experience in modern software development.`,
      creator: personalInfo.name,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check environment variables on startup
  if (typeof window === 'undefined') {
    validateEnvironment();
  }

  // Get pathname from middleware headers to determine theme on server
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  
  // Determine theme based on pathname
  const isGlassTheme = pathname.startsWith('/projects') || 
                      pathname.startsWith('/login') || 
                      pathname.startsWith('/register') ||
                      pathname.startsWith('/not-found');
  
  const theme = isGlassTheme ? 'theme-glass' : 'theme-clay';

  return (
    <html lang="en">
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icons/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" type="image/png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        
        {/* Android Chrome Icons */}
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/icons/icon-128x128.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/icons/icon-256x256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#e8edf2" />
        <meta name="msapplication-TileImage" content="/icons/mstile-144x144.png" />
        <meta name="msapplication-square70x70logo" content="/icons/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/icons/mstile-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/icons/mstile-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/icons/mstile-310x310.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#059669" />
        <meta name="msapplication-navbutton-color" content="#059669" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* PWA Meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Portfolio" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${theme}`}
      >
        <ClientThemeSync />
        <SessionProvider>
          <ToastProvider>
            <ConfirmProvider>
              <ConditionalNavigation />
              {children}
            </ConfirmProvider>
          </ToastProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
