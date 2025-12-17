'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, ArrowLeft, Eye, EyeOff, CheckCircle, RefreshCw } from 'lucide-react';
import { logger } from '../../lib/logger';
import OAuthButtons from '../../components/ui/OAuthButtons';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must contain at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Successful registration
        if (result.requiresVerification) {
          // Email verification required
          setRegistrationSuccess(true);
          setUserEmail(formData.email);
        } else {
          // Registration without verification (for backward compatibility)
          router.push(`/auth/login?message=Registration successful! You can now log into the system.&callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      } else {
        // Registration error
        if (result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          setErrors({ general: result.message || 'Registration error occurred' });
        }
      }
    } catch (regError) {
      logger.error('Registration error:', regError);
      setErrors({ general: 'Registration error occurred. Please try later.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        setResendMessage('✅ Verification email sent again!');
      } else {
        setResendMessage(`❌ ${result.error || 'Error sending email'}`);
      }
    } catch {
      setResendMessage('❌ Error sending email');
    } finally {
      setResendLoading(false);
    }
  };

  // Компонент успешной регистрации
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="text-white" size={24} />
              </div>
              <CardTitle className="text-2xl text-white">Check your email!</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 text-center">
              <div className="space-y-3">
                <p className="text-white/90">
                  We sent a confirmation email to:
                </p>
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <Mail className="inline-block mr-2" size={16} />
                  <span className="font-medium text-white">{userEmail}</span>
                </div>
              </div>

              <div className="space-y-2 text-white/80 text-sm">
                <p>📧 Check your &quot;Inbox&quot; and &quot;Spam&quot; folders</p>
                <p>🔗 Click the link in the email to confirm</p>
                <p>⏰ Link is valid for 24 hours</p>
              </div>

              {resendMessage && (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <p className="text-sm text-white">{resendMessage}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2" size={16} />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  className="w-full"
                  onClick={() => router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
                >
                  Go to Login
                </Button>

                <Button
                  className="w-full opacity-75"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                >
                  Change Registration Data
                </Button>
              </div>

              <div className="text-xs text-white/60">
                Didn&apos;t receive the email? Check your email address or try resending.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <User className="text-white" size={24} />
            </div>
            <CardTitle className="text-2xl text-white">Registration</CardTitle>
            <p className="text-white/70 mt-2">
              Create an account to comment on projects
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-100 text-sm animate-fade-in">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  className={errors.name ? 'border-red-500/50' : ''}
                />
              </div>

              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  className={errors.email ? 'border-red-500/50' : ''}
                />
              </div>

              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password (minimum 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  className={errors.password ? 'border-red-500/50' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors z-10 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  className={errors.confirmPassword ? 'border-red-500/50' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors z-10 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
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
                  <span className="px-2 bg-white/10 text-white/70">Or continue with</span>
                </div>
              </div>
              <div className="mt-6">
                <OAuthButtons callbackUrl={callbackUrl} />
              </div>
            </div>

            <div className="text-center text-white/70 text-sm mt-6">
              Already have an account?{' '}
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="text-white hover:text-blue-200 transition-colors font-medium"
              >
                Log In
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}