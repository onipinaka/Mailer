'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';

export default function IntegrationsPage() {
  const platforms = [
    { name: 'Meta Ads', status: 'Not Connected', color: 'bg-blue-500' },
    { name: 'Google Ads', status: 'Not Connected', color: 'bg-red-500' },
    { name: 'Google Analytics', status: 'Not Connected', color: 'bg-yellow-500' },
    { name: 'Mailchimp', status: 'Not Connected', color: 'bg-yellow-400' },
    { name: 'HubSpot', status: 'Not Connected', color: 'bg-orange-500' },
    { name: 'Salesforce', status: 'Not Connected', color: 'bg-blue-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-600">Connect external platforms</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`${platform.color} h-10 w-10 rounded-lg`}></div>
                  {platform.name}
                </div>
              </CardTitle>
              <CardDescription>{platform.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Hub
          </CardTitle>
          <CardDescription>Connect your favorite marketing tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Zap className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">OAuth Integration Flow Coming Soon</p>
            <p className="text-sm">Connect platforms with one click</p>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/integrations for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
