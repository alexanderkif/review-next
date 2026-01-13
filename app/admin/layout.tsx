import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Portfolio Management',
  description: 'Portfolio site administration panel',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
