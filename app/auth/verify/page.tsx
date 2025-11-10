'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams?.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>}
          {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />}
          {status === 'error' && <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Alert variant={status === 'success' ? 'success' : status === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message || 'Please wait...'}</AlertDescription>
          </Alert>

          {status === 'success' && (
            <Link href="/auth/login">
              <Button className="w-full mt-4">
                Go to Login
              </Button>
            </Link>
          )}

          {status === 'error' && (
            <Link href="/auth/register">
              <Button className="w-full mt-4" variant="outline">
                Back to Register
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
