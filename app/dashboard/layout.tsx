'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, LogOut, Send, BarChart, CreditCard, History } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">MailPulse</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">{user?.email}</div>
              <div className="text-xs font-semibold text-primary">
                {user?.paidLifetime ? 'Unlimited Credits' : `${user?.freeCredits} Credits`}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard/compose">
                    <Button variant="ghost" className="w-full justify-start">
                      <Send className="h-4 w-4 mr-2" />
                      Compose
                    </Button>
                  </Link>
                  <Link href="/dashboard/campaigns">
                    <Button variant="ghost" className="w-full justify-start">
                      <History className="h-4 w-4 mr-2" />
                      Campaigns
                    </Button>
                  </Link>
                  <Link href="/dashboard/analytics">
                    <Button variant="ghost" className="w-full justify-start">
                      <BarChart className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/dashboard/billing">
                    <Button variant="ghost" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </Button>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
