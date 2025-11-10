'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Campaign {
  _id: string;
  campaignId: string;
  subject: string;
  sent: number;
  delivered: number;
  opened: number;
  bounced: number;
  failed: number;
  recipients: number;
  sendMethod: string;
  createdAt: string;
}

interface Recipient {
  _id: string;
  recipientEmail: string;
  recipientName?: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened';
  errorMessage?: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
}

interface RecipientData {
  campaignId: string;
  totalRecipients: number;
  recipients: {
    all: Recipient[];
    sent: Recipient[];
    delivered: Recipient[];
    opened: Recipient[];
    bounced: Recipient[];
    failed: Recipient[];
  };
  counts: {
    all: number;
    sent: number;
    delivered: number;
    opened: number;
    bounced: number;
    failed: number;
  };
}


export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async (campaignId: string) => {
    try {
      setLoadingRecipients(true);
      const response = await fetch(`/api/campaigns/recipients?campaignId=${campaignId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipients');
      }

      const data = await response.json();
      setRecipientData(data);
    } catch (err) {
      console.error('Error fetching recipients:', err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const toggleCampaign = async (campaign: Campaign) => {
    if (expandedCampaign === campaign.campaignId) {
      setExpandedCampaign(null);
      setRecipientData(null);
      setStatusFilter('all');
      setSearchQuery('');
    } else {
      setExpandedCampaign(campaign.campaignId);
      await fetchRecipients(campaign.campaignId);
    }
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (campaign.delivered === 0) return 0;
    return ((campaign.opened / campaign.delivered) * 100).toFixed(1);
  };

  const calculateDeliveryRate = (campaign: Campaign) => {
    if (campaign.sent === 0) return 0;
    return ((campaign.delivered / campaign.sent) * 100).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, color: string }> = {
      sent: { variant: 'secondary', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
      delivered: { variant: 'default', label: 'Delivered', color: 'bg-green-100 text-green-800' },
      opened: { variant: 'default', label: 'Opened', color: 'bg-purple-100 text-purple-800' },
      bounced: { variant: 'destructive', label: 'Bounced', color: 'bg-red-100 text-red-800' },
      failed: { variant: 'destructive', label: 'Failed', color: 'bg-orange-100 text-orange-800' },
    };

    const config = variants[status] || { variant: 'outline' as const, label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getFilteredRecipients = () => {
    if (!recipientData) return [];
    
    let recipients = statusFilter === 'all' 
      ? recipientData.recipients.all 
      : recipientData.recipients[statusFilter as keyof typeof recipientData.recipients] as Recipient[];

    if (searchQuery) {
      recipients = recipients.filter(r => 
        r.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.recipientName && r.recipientName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return recipients;
  };

  const exportToCSV = (campaign: Campaign) => {
    const filtered = getFilteredRecipients();
    const csv = [
      ['Email', 'Name', 'Status', 'Sent At', 'Delivered At', 'Opened At', 'Error'].join(','),
      ...filtered.map(r => [
        r.recipientEmail,
        r.recipientName || '',
        r.status,
        new Date(r.sentAt).toLocaleString(),
        r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : '',
        r.openedAt ? new Date(r.openedAt).toLocaleString() : '',
        r.errorMessage || ''
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaign.campaignId}-recipients.csv`;
    a.click();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Campaign History
          </h1>
          <p className="text-gray-500 mt-1">View all your email campaigns and track recipient engagement</p>
        </div>
        <Button onClick={fetchCampaigns} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">
              Start your first email campaign to see analytics and track recipient engagement
            </p>
            <Button onClick={() => router.push('/dashboard/compose')}>
              <Mail className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="cursor-pointer" onClick={() => toggleCampaign(campaign)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{campaign.subject}</CardTitle>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {campaign.sendMethod}
                      </span>
                    </div>
                    <CardDescription className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(campaign.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.recipients} recipients
                      </span>
                      <span className="text-xs text-gray-400">ID: {campaign.campaignId}</span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    {expandedCampaign === campaign.campaignId ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{campaign.sent}</div>
                    <div className="text-xs text-gray-600">Sent</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{campaign.delivered}</div>
                    <div className="text-xs text-gray-600">Delivered</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{campaign.opened}</div>
                    <div className="text-xs text-gray-600">Opened</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{campaign.bounced}</div>
                    <div className="text-xs text-gray-600">Bounced</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{calculateOpenRate(campaign)}%</div>
                    <div className="text-xs text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{calculateDeliveryRate(campaign)}%</div>
                    <div className="text-xs text-gray-600">Delivery</div>
                  </div>
                </div>

                {/* Expanded Recipients Table */}
                {expandedCampaign === campaign.campaignId && (
                  <div className="mt-6 border-t pt-6">
                    {loadingRecipients ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : recipientData ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Recipients ({recipientData.totalRecipients})</h3>
                          <Button onClick={() => exportToCSV(campaign)} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3 flex-wrap">
                          <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search by email or name..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={statusFilter === 'all' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setStatusFilter('all')}
                            >
                              All ({recipientData.counts.all})
                            </Button>
                            <Button
                              variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setStatusFilter('delivered')}
                            >
                              Delivered ({recipientData.counts.delivered})
                            </Button>
                            <Button
                              variant={statusFilter === 'opened' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setStatusFilter('opened')}
                            >
                              Opened ({recipientData.counts.opened})
                            </Button>
                            <Button
                              variant={statusFilter === 'failed' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setStatusFilter('failed')}
                            >
                              Failed ({recipientData.counts.failed})
                            </Button>
                          </div>
                        </div>

                        {/* Recipients Table */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sent At</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Opened At</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {getFilteredRecipients().length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                      No recipients found
                                    </td>
                                  </tr>
                                ) : (
                                  getFilteredRecipients().map((recipient) => (
                                    <tr key={recipient._id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 font-medium">{recipient.recipientEmail}</td>
                                      <td className="px-4 py-3">{recipient.recipientName || '-'}</td>
                                      <td className="px-4 py-3">{getStatusBadge(recipient.status)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(recipient.sentAt)}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {recipient.openedAt ? formatDate(recipient.openedAt) : '-'}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>Failed to load recipient details</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
