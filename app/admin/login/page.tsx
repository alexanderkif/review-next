'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Shield, User, Eye, EyeOff } from 'lucide-react';
import DatabaseSetup from '../components/DatabaseSetup';
import { logger } from '../../lib/logger';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);

  // Check database status on load
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/admin/setup');
        if (!response.ok) {
          throw new Error('Failed to check database status');
        }
        const data = await response.json();
        setNeedsSetup(data.needsSetup);
      } catch (error) {
        logger.error('Database check error:', error);
        setNeedsSetup(true);
      } finally {
        setCheckingDb(false);
      }
    };

    checkDatabase();
  }, []);

  const handleSetupComplete = () => {
    setNeedsSetup(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Заполните все поля' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/admin',
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid email or password' });
      } else if (result?.url) {
        // Используем window.location для гарантированного редиректа
        window.location.href = '/admin';
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      logger.error('Admin login error:', error);
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setLoading(false);
    }
  };

  // Показываем загрузку при проверке базы данных
  if (checkingDb) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Показываем форму инициализации, если база не настроена
  if (needsSetup) {
    return <DatabaseSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back navigation */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg px-2 py-1 transition-all"
          >
            <ArrowLeft size={16} />
            На главную
          </Link>
        </div>

        {/* Форма авторизации */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="text-white" size={24} />
            </div>
            <CardTitle className="text-2xl text-slate-800">
              Admin Panel
            </CardTitle>
            <p className="text-slate-600 text-sm mt-2">
              Enter credentials to access the admin panel
            </p>
          </CardHeader>

          <CardContent>
            {/* Error messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error === 'CredentialsSignin' ? 'Invalid email or password' : 'An error occurred during login'}
              </div>
            )}

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@portfolio.dev"
                  className="w-full"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Введите Password"
                    className="w-full pr-12"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1),_inset_-2px_-2px_1px_rgba(0,0,0,0.3)] transition-all hover:[background:linear-gradient(90deg,#10b981_0%,#3b82f6_100%)]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <User size={16} className="mr-2" />
                    Login to Admin Panel
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
