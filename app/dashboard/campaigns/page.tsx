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
  RefreshCw
} from 'lucide-react';

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

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

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
          <h1 className="text-3xl font-bold">Campaign History</h1>
          <p className="text-gray-500 mt-1">View all your email campaigns and their performance</p>
        </div>
        <Button onClick={fetchCampaigns} variant="outline">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first email campaign</p>
            <Button onClick={() => router.push('/dashboard/compose')}>
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{campaign.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(campaign.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.recipients} recipients
                        </span>
                        <span className="capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {campaign.sendMethod}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <Button 
                    variant={selectedCampaign?._id === campaign._id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCampaign(
                      selectedCampaign?._id === campaign._id ? null : campaign
                    )}
                  >
                    {selectedCampaign?._id === campaign._id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{campaign.sent}</div>
                    <div className="text-xs text-gray-600">Sent</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{campaign.delivered}</div>
                    <div className="text-xs text-gray-600">Delivered</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{campaign.opened}</div>
                    <div className="text-xs text-gray-600">Opened</div>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-red-600">{campaign.bounced}</div>
                    <div className="text-xs text-gray-600">Bounced</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{calculateOpenRate(campaign)}%</div>
                    <div className="text-xs text-gray-600">Open Rate</div>
                  </div>
                </div>

                {/* Detailed View */}
                {selectedCampaign?._id === campaign._id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Campaign Details</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Campaign ID:</span>
                            <span className="font-mono text-xs">{campaign.campaignId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Send Method:</span>
                            <span className="capitalize">{campaign.sendMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Recipients:</span>
                            <span>{campaign.recipients}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Rate:</span>
                            <span className="font-semibold text-green-600">
                              {calculateDeliveryRate(campaign)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Open Rate:</span>
                            <span className="font-semibold text-purple-600">
                              {calculateOpenRate(campaign)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Failed:</span>
                            <span className="text-red-600">{campaign.failed}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Performance Summary</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Successfully Delivered</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${calculateDeliveryRate(campaign)}%` }}
                              />
                            </div>
                            <span className="font-semibold">{campaign.delivered}/{campaign.sent}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Email Opens</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${calculateOpenRate(campaign)}%` }}
                              />
                            </div>
                            <span className="font-semibold">{campaign.opened}/{campaign.delivered}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
