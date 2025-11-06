import NextAuth from 'next-auth';
import { nextAuthConfig } from '../../../../auth.config';

const handler = NextAuth(nextAuthConfig);

export { handler as GET, handler as POST };