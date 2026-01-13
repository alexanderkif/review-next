'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { logger } from '../../lib/logger';
import OAuthButtons from '../../components/ui/OAuthButtons';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Debug logging
  // LoginForm initialized with callbackUrl

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must contain at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          // Redirect to email confirmation page
          router.push('/auth/verify-email');
        } else {
          setErrors({ general: 'Invalid email or password' });
        }
      } else if (result?.ok) {
        // Successful authorization - redirect to callbackUrl
        // Login successful, redirecting
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      logger.error('Login error:', error);
      setErrors({ general: 'An error occurred during login. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-in w-full max-w-md">
        <Card className="text-white backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 text-2xl font-bold text-white shadow-lg">
              А
            </div>
            <CardTitle className="text-2xl text-white">Welcome</CardTitle>
            <p className="text-sm text-white/70">Log into your account to leave comments</p>
          </CardHeader>

          <CardContent>
            {/* Сообщения */}
            {message && (
              <div className="animate-fade-in mb-4 rounded-lg border border-green-500/30 bg-green-500/20 p-3 text-sm text-green-100">
                {message}
              </div>
            )}

            {error && (
              <div className="animate-fade-in mb-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-sm text-red-100">
                {error === 'CredentialsSignin'
                  ? 'Invalid email or password'
                  : 'An error occurred during login'}
              </div>
            )}

            {errors.general && (
              <div className="animate-fade-in mb-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-sm text-red-100">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  className={`pl-12 ${errors.email ? 'border-red-500/50' : ''}`}
                />
                <Mail
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-600"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  className={`pr-12 pl-12 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <Lock
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-600 transition-colors hover:text-slate-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                size="md"
                type="submit"
                className="mt-6 w-full font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </div>
                ) : (
                  'Log In'
                )}
              </Button>
            </form>

            {/* OAuth Buttons */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/10 px-2 text-white/70">Or continue with</span>
                </div>
              </div>
              <div className="mt-6">
                <OAuthButtons callbackUrl={callbackUrl} />
              </div>
            </div>

            {/* Переход к регистрации */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                No account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-white underline transition-colors hover:text-blue-300"
                >
                  Register
                </Link>
              </p>
            </div>

            {/* Ссылка на главную */}
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <ArrowLeft size={16} />
                Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
