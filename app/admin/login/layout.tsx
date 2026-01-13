import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Portfolio Management',
  description: 'Administration panel login page',
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
