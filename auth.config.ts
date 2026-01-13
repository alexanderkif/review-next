import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { z } from 'zod';
import type { User as DBUser } from './app/lib/definitions';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import type { User, Account, Profile, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<DBUser | undefined> {
  try {
    const users = await sql`
            SELECT id, email, name, password_hash as password, role, avatar_url, email_verified, created_at
            FROM users
            WHERE email = ${email}
        `;
    return users[0] as DBUser;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// Базовая конфигурация для middleware
export const authConfig = {
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: {
      auth: { user?: { role?: string } } | null;
      request: { nextUrl: URL };
    }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isAdminLogin = nextUrl.pathname === '/admin/login';

      // Admin panel access check
      if (isOnAdmin && !isAdminLogin) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/admin/login', nextUrl));
        }
        // Check if user is administrator
        if (auth.user?.role !== 'admin') {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Allow access to login/register pages even for logged in users
      // This allows proper callbackUrl handling

      // If admin is authorized and tries to access admin login page
      if (isLoggedIn && auth.user?.role === 'admin' && isAdminLogin) {
        return Response.redirect(new URL('/admin', nextUrl));
      }

      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Allow URLs on the same domain
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default fallback
      return baseUrl;
    },
  },
  providers: [], // Add providers with an empty array for now
};

// Полная конфигурация для NextAuth
export const nextAuthConfig = {
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          // Check email verification (admins can login without verification)
          if (!user.email_verified && user.role !== 'admin') {
            console.log('Email not verified for user:', email);
            throw new Error('EMAIL_NOT_VERIFIED');
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
              avatar_url: user.avatar_url,
              email_verified: user.email_verified,
            };
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }: { user: User; account: Account | null; profile?: Profile }) {
      // For OAuth providers, create user if doesn't exist
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await getUser(user.email ?? '');

          if (!existingUser) {
            // Create new user for OAuth
            await sql`
                            INSERT INTO users (email, name, email_verified, avatar_url, role)
                            VALUES (
                                ${user.email ?? ''},
                                ${user.name || (user.email ? user.email.split('@')[0] : 'User')},
                                true,
                                ${'image' in user ? user.image || null : null},
                                'user'
                            )
                        `;
            console.log('OAuth user created successfully:', user.email);
          } else {
            console.log('OAuth user already exists:', user.email);
            // Update avatar and verify email for OAuth users
            const avatarUrl =
              'image' in user ? user.image || existingUser.avatar_url : existingUser.avatar_url;
            const userEmail = user.email ?? '';
            await sql`
                            UPDATE users
                            SET email_verified = true, avatar_url = ${avatarUrl ?? null}
                            WHERE email = ${userEmail}
                        `;
            console.log('OAuth user updated:', user.email);
          }
          return true;
        } catch (error) {
          console.error('Error in OAuth signIn:', error);
          // Return true anyway to allow sign in, user might exist
          return true;
        }
      }
      return true;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
      trigger?: 'signIn' | 'signUp' | 'update';
      session?: unknown;
    }) {
      // user, account, profile доступны только при первом входе
      if (user) {
        // For OAuth, fetch user data from database
        if (account?.provider === 'google' || account?.provider === 'github') {
          const dbUser = await getUser(user.email ?? '');
          if (dbUser) {
            token.id = String(dbUser.id);
            token.role = dbUser.role;
            token.avatar_url =
              dbUser.avatar_url ?? ('image' in user ? user.image || undefined : undefined);
          }
        } else {
          // For credentials
          token.id = String(user.id);
          token.role = user.role ?? 'user';
          token.avatar_url = user.avatar_url;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar_url = token.avatar_url;
      }
      return session;
    },
  },
};
