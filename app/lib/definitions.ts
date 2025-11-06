// Типы для NextAuth и системы авторизации

export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
  email_verified?: boolean;
  email_verification_token?: string;
  email_verification_expires?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Расширяем стандартные типы NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';
      avatar_url?: string;
    };
  }

  interface User {
    id?: string;
    email?: string;
    name?: string;
    role?: 'user' | 'admin';
    avatar_url?: string;
    email_verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar_url?: string;
  }
}