'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Mail, 
  Users, 
  CheckCircle, 
  Eye,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalCampaigns: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalBounced: number;
  totalFailed: number;
  averageOpenRate: number;
  averageDeliveryRate: number;
  campaigns: any[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Alert variant="destructive">
          <AlertDescription>{error || 'No data available'}</AlertDescription>
        </Alert>
        <Button onClick={fetchAnalytics}>Try Again</Button>
      </div>
    );
  }

  // Prepare chart data
  const campaignChartData = data.campaigns.map(c => ({
    name: c.subject.substring(0, 20) + (c.subject.length > 20 ? '...' : ''),
    sent: c.sent,
    delivered: c.delivered,
    opened: c.opened,
    bounced: c.bounced,
  }));

  const pieData = [
    { name: 'Delivered', value: data.totalDelivered, color: '#10b981' },
    { name: 'Opened', value: data.totalOpened, color: '#8b5cf6' },
    { name: 'Bounced', value: data.totalBounced, color: '#ef4444' },
    { name: 'Failed', value: data.totalFailed, color: '#f97316' },
  ];

  const performanceData = [
    { name: 'Open Rate', value: data.averageOpenRate },
    { name: 'Delivery Rate', value: data.averageDeliveryRate },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your email campaign performance</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCampaigns}</div>
            <p className="text-xs text-gray-500 mt-1">Email campaigns sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSent}</div>
            <p className="text-xs text-gray-500 mt-1">Emails delivered to recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.averageOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Recipients who opened emails</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.averageDeliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      {data.campaigns.length > 0 ? (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Campaign Performance Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Sent, delivered, and opened emails per campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                    <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                    <Bar dataKey="opened" fill="#8b5cf6" name="Opened" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Overall Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Distribution</CardTitle>
                <CardDescription>Email status breakdown across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Average open rate and delivery rate trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>Complete breakdown of email performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">Delivered</span>
                    <span className="text-lg font-bold text-green-600">{data.totalDelivered}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-sm font-medium">Opened</span>
                    <span className="text-lg font-bold text-purple-600">{data.totalOpened}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-sm font-medium">Bounced</span>
                    <span className="text-lg font-bold text-red-600">{data.totalBounced}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Failed</span>
                    <span className="text-lg font-bold text-orange-600">{data.totalFailed}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Total Sent</span>
                    <span className="text-lg font-bold text-blue-600">{data.totalSent}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Campaigns</span>
                    <span className="text-lg font-bold text-gray-600">{data.totalCampaigns}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
            <p className="text-gray-500 mb-4">Send your first campaign to see analytics</p>
            <Button onClick={() => router.push('/dashboard/compose')}>
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
