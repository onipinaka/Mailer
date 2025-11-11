'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus } from 'lucide-react';

export default function AdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ad Campaign Manager</h1>
          <p className="text-gray-600">Manage paid advertising campaigns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {['Meta Ads', 'Google Ads', 'LinkedIn Ads', 'TikTok Ads'].map((platform) => (
          <Card key={platform} className="text-center">
            <CardContent className="pt-6">
              <p className="font-medium">{platform}</p>
              <p className="text-sm text-gray-600 mt-2">$0 spent</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Ad Campaigns
          </CardTitle>
          <CardDescription>Your advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Ad Manager Coming Soon</p>
            <p className="text-sm">Create and manage ad campaigns across platforms</p>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/ads/campaigns for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
