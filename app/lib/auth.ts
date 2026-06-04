import 'server-only';
import { getServerSession } from 'next-auth/next';
import { nextAuthConfig } from './auth.config';
import { User } from 'next-auth';

export async function auth() {
  return await getServerSession<typeof nextAuthConfig, { user: User }>(nextAuthConfig);
}
