'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, LogOut, Send, BarChart, CreditCard, History, Home, Users, Sparkles, Settings, Clock, Briefcase } from 'lucide-react';

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
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Marketer</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{user?.email}</div>
              <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {user?.paidLifetime ? '✨ Unlimited Credits' : `⚡ ${user?.freeCredits} Credits`}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors">
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
            <Card className="border-0 shadow-lg sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</h3>
                  <nav className="space-y-1">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Home className="h-5 w-5 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/compose-new">
                      <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Send className="h-5 w-5 mr-3" />
                        Compose Campaign
                      </Button>
                    </Link>
                    <Link href="/dashboard/ai-content">
                      <Button variant="ghost" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors">
                        <Sparkles className="h-5 w-5 mr-3" />
                        AI Content
                      </Button>
                    </Link>
                    <Link href="/dashboard/leads">
                      <Button variant="ghost" className="w-full justify-start hover:bg-green-50 hover:text-green-700 transition-colors">
                        <Users className="h-5 w-5 mr-3" />
                        Lead Generation
                      </Button>
                    </Link>
                  </nav>
                </div>
                
                <div className="mb-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tracking</h3>
                  <nav className="space-y-1">
                    <Link href="/dashboard/jobs">
                      <Button variant="ghost" className="w-full justify-start hover:bg-orange-50 hover:text-orange-700 transition-colors">
                        <Clock className="h-5 w-5 mr-3" />
                        Background Jobs
                      </Button>
                    </Link>
                    <Link href="/dashboard/campaigns">
                      <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        <History className="h-5 w-5 mr-3" />
                        Campaigns
                      </Button>
                    </Link>
                    <Link href="/dashboard/analytics">
                      <Button variant="ghost" className="w-full justify-start hover:bg-teal-50 hover:text-teal-700 transition-colors">
                        <BarChart className="h-5 w-5 mr-3" />
                        Analytics
                      </Button>
                    </Link>
                  </nav>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                  <nav className="space-y-1">
                    <Link href="/dashboard/settings">
                      <Button variant="ghost" className="w-full justify-start hover:bg-slate-50 hover:text-slate-700 transition-colors">
                        <Settings className="h-5 w-5 mr-3" />
                        Settings
                      </Button>
                    </Link>
                    <Link href="/dashboard/billing">
                      <Button variant="ghost" className="w-full justify-start hover:bg-pink-50 hover:text-pink-700 transition-colors">
                        <CreditCard className="h-5 w-5 mr-3" />
                        Billing
                      </Button>
                    </Link>
                  </nav>
                </div>
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
