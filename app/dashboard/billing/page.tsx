'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Mail,
  RefreshCw
} from 'lucide-react';

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setProcessingPayment(true);
      setError('');

      // Create Razorpay order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const { orderId, amount, currency, keyId } = await response.json();

      // Razorpay Checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'MailPulse',
        description: 'Lifetime Unlimited Plan',
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful - verify on backend
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              // Refresh user data
              await fetchUser();
              setError('');
              alert('Payment successful! Your account has been upgraded.');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      // Load Razorpay script and open checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setError('Failed to load payment gateway');
        setProcessingPayment(false);
      };
      document.body.appendChild(script);
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold">
                  {user?.paidLifetime ? 'Unlimited Plan' : 'Free Plan'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {user?.paidLifetime 
                  ? 'Unlimited email sends forever' 
                  : `${user?.freeCredits || 0} free credits remaining`
                }
              </p>
            </div>
            {user?.paidLifetime && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      {!user?.paidLifetime && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Perfect for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">100 free email credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">CSV import</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Unlimited Plan */}
          <Card className="border-primary shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Unlimited Plan</CardTitle>
                  <CardDescription>Best value for power users</CardDescription>
                </div>
                <div className="bg-primary text-white px-2 py-1 rounded text-xs font-bold">
                  POPULAR
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$99</span>
                <span className="text-gray-500">/lifetime</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold">Unlimited email sends</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">CSV & bulk import</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold">One-time payment</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Benefits */}
      {user?.paidLifetime && (
        <Card>
          <CardHeader>
            <CardTitle>Your Benefits</CardTitle>
            <CardDescription>What you get with the Unlimited Plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Unlimited Sends</h3>
                  <p className="text-sm text-gray-500">Send as many emails as you need</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Analytics</h3>
                  <p className="text-sm text-gray-500">Track opens, clicks, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded">
                  <Check className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Priority Support</h3>
                  <p className="text-sm text-gray-500">Get help when you need it</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
