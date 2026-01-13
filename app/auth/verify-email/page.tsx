'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { logger } from '../../lib/logger';

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'already-verified';
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>({
    status: 'loading',
    message: 'Checking verification token...',
  });

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setState({
            status: 'already-verified',
            message: data.message,
            user: data.user,
          });
        } else {
          setState({
            status: 'success',
            message: data.message,
            user: data.user,
          });
        }
      } else {
        setState({
          status: 'error',
          message: data.error || 'Email verification error',
        });
      }
    } catch (error) {
      logger.error('Verification error:', error);
      setState({
        status: 'error',
        message: 'An error occurred during email verification. Please try later.',
      });
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setTimeout(() => {
        setState({
          status: 'error',
          message: 'Verification token not found in link',
        });
      }, 0);
      return;
    }

    // Send verification request
    setTimeout(() => verifyEmail(token), 0);
  }, [searchParams]);

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="py-8 text-center">
            <RefreshCw className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
            <p className="text-slate-600">{state.message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
            <h2 className="mb-4 text-2xl font-bold text-green-700">🎉 Email Verified!</h2>
            <p className="mb-6 text-slate-700">{state.message}</p>
            {state.user && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="font-semibold text-green-800">Welcome, {state.user.name}!</h3>
                <p className="text-sm text-green-700">{state.user.email}</p>
              </div>
            )}
            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push('/auth/login')}>
                Login to Account
              </Button>
              <Button className="w-full" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        );

      case 'already-verified':
        return (
          <div className="py-8 text-center">
            <Mail className="mx-auto mb-4 text-blue-500" size={64} />
            <h2 className="mb-4 text-2xl font-bold text-blue-700">Email Already Verified</h2>
            <p className="mb-6 text-slate-700">{state.message}</p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push('/auth/login')}>
                Login to Account
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="py-8 text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={64} />
            <h2 className="mb-4 text-2xl font-bold text-red-700">Verification Error</h2>
            <p className="mb-6 text-slate-700">{state.message}</p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push('/auth/register')}>
                Retry Registration
              </Button>
              <Button className="w-full" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <Link href="/" className="text-slate-500 transition-colors hover:text-slate-700">
                <ArrowLeft size={20} />
              </Link>
              <CardTitle>Email Verification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
