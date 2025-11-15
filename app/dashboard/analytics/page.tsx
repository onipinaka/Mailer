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
  const campaignChartData = (data.campaigns || []).map(c => ({
    name: c.subject.substring(0, 20) + (c.subject.length > 20 ? '...' : ''),
    sent: c.sent,
    delivered: c.delivered,
    opened: c.opened,
    bounced: c.bounced,
  }));

  const pieData = [
    { name: 'Delivered', value: data.totalDelivered ?? 0, color: '#10b981' },
    { name: 'Opened', value: data.totalOpened ?? 0, color: '#8b5cf6' },
    { name: 'Bounced', value: data.totalBounced ?? 0, color: '#ef4444' },
    { name: 'Failed', value: data.totalFailed ?? 0, color: '#f97316' },
  ];

  const performanceData = [
    { name: 'Open Rate', value: data.averageOpenRate ?? 0 },
    { name: 'Delivery Rate', value: data.averageDeliveryRate ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Track your email campaign performance and engagement metrics</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Campaigns</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data.totalCampaigns}</div>
            <p className="text-xs text-gray-500 mt-1">Email campaigns sent</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Emails Sent</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{(data.totalSent ?? 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Emails delivered to recipients</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Average Open Rate</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{(data.averageOpenRate ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Recipients who opened emails</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-teal-50 to-white border-teal-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Delivery Rate</CardTitle>
            <div className="p-2 bg-teal-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{(data.averageDeliveryRate ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      {data.campaigns.length > 0 ? (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Campaign Performance Bar Chart */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Campaign Performance
                </CardTitle>
                <CardDescription>Sent, delivered, and opened emails per campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" fontSize={12} stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sent" fill="#3b82f6" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delivered" fill="#10b981" name="Delivered" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opened" fill="#8b5cf6" name="Opened" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Overall Distribution Pie Chart */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Overall Distribution
                </CardTitle>
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
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Average open rate and delivery rate trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Stats */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Detailed Statistics
              </CardTitle>
              <CardDescription>Complete breakdown of email performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Delivered</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{(data.totalDelivered ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Opened</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{(data.totalOpened ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Bounced</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{(data.totalBounced ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Failed</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{(data.totalFailed ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Sent</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{(data.totalSent ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Campaigns</span>
                    </div>
                    <span className="text-xl font-bold text-gray-600">{data.totalCampaigns}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <TrendingUp className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No analytics data yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Send your first campaign to see detailed analytics and performance metrics
            </p>
            <Button onClick={() => router.push('/dashboard/compose')} size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
