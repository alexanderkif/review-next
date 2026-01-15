'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
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
    confirmPassword: '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
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
          router.push(
            `/auth/login?message=Registration successful! You can now log into the system.&callbackUrl=${encodeURIComponent(callbackUrl)}`,
          );
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="sr-only">Registration Confirmation</h1>
          <Card className="backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-blue-600">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-semibold text-white">Check your email!</h2>
            </CardHeader>

            <CardContent className="space-y-6 text-center">
              <div className="space-y-3">
                <p className="text-white/90">We sent a confirmation email to:</p>
                <div className="rounded-lg border border-white/20 bg-white/10 p-3">
                  <Mail className="mr-2 inline-block" size={16} />
                  <span className="font-medium text-white">{userEmail}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-white/80">
                <p>📧 Check your &quot;Inbox&quot; and &quot;Spam&quot; folders</p>
                <p>🔗 Click the link in the email to confirm</p>
                <p>⏰ Link is valid for 24 hours</p>
              </div>

              {resendMessage && (
                <div className="rounded-lg border border-white/20 bg-white/10 p-3">
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
                      <RefreshCw className="mr-2 animate-spin" size={16} />
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
                  onClick={() =>
                    router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
                  }
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

              <div className="text-xs text-white/80">
                Didn&apos;t receive the email? Check your email address or try resending.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Register</h1>
        <Card className="backdrop-blur-lg">
          <CardHeader className="text-center">
            <div className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-blue-600">
              <User className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-white">Registration</h2>
            <p className="mt-2 text-white/90">Create an account to comment on projects</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {errors.general && (
              <div className="animate-fade-in rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-sm text-red-100">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="name"
                  type="text"
                  id="register-name"
                  label="Name"
                  hideLabel
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  className={errors.name ? 'border-red-500/50' : ''}
                  variant="glass"
                />
              </div>

              <div>
                <Input
                  name="email"
                  type="email"
                  id="register-email"
                  label="Email"
                  hideLabel
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  className={errors.email ? 'border-red-500/50' : ''}
                  variant="glass"
                />
              </div>

              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  label="Password"
                  hideLabel
                  placeholder="Enter password (minimum 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  className={errors.password ? 'border-red-500/50' : ''}
                  variant="glass"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded text-white/70 transition-colors hover:text-white focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="register-confirm-password"
                  label="Confirm Password"
                  hideLabel
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  className={errors.confirmPassword ? 'border-red-500/50' : ''}
                  variant="glass"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded text-white/70 transition-colors hover:text-white focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button type="submit" className="mt-6 w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                  <span className="bg-white/10 px-2 text-white/70">Or continue with</span>
                </div>
              </div>
              <div className="mt-6">
                <OAuthButtons callbackUrl={callbackUrl} />
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-white/70">
              Already have an account?{' '}
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-white transition-colors hover:text-blue-200"
              >
                Log In
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
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
