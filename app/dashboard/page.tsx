'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, Send, TrendingUp, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [userRes, analyticsRes] = await Promise.all([
      fetch('/api/user'),
      fetch('/api/analytics'),
    ]);

    if (userRes.ok) {
      const userData = await userRes.json();
      setUser(userData.user);
    }

    if (analyticsRes.ok) {
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.totals);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your email marketing overview.</p>
      </div>

      {/* Credits Card */}
      {!user?.paidLifetime && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Free Trial Credits</CardTitle>
            <CardDescription>
              You have {user?.freeCredits || 0} free email credits remaining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Upgrade to lifetime plan for unlimited emails
                </p>
                <p className="text-2xl font-bold">₹4,000 <span className="text-sm font-normal text-gray-500">one-time</span></p>
              </div>
              <Link href="/dashboard/billing">
                <Button>
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.sent || 0}</div>
            <p className="text-xs text-gray-600 mt-1">emails sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.delivered || 0}</div>
            <p className="text-xs text-gray-600 mt-1">successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.openRate || 0}%</div>
            <p className="text-xs text-gray-600 mt-1">emails opened</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bounce Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.bounceRate || 0}%</div>
            <p className="text-xs text-gray-600 mt-1">emails bounced</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Send className="h-12 w-12 text-primary mb-2" />
            <CardTitle>Send Campaign</CardTitle>
            <CardDescription>
              Create and send a new email campaign to your contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/compose">
              <Button className="w-full">
                Compose Email
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-12 w-12 text-primary mb-2" />
            <CardTitle>View Analytics</CardTitle>
            <CardDescription>
              Track performance of your email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
