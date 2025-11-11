'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Plus } from 'lucide-react';

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Media Manager</h1>
          <p className="text-gray-600">Schedule and post to all platforms</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'].map((platform) => (
          <Card key={platform} className="text-center">
            <CardContent className="pt-6">
              <p className="font-medium">{platform}</p>
              <p className="text-sm text-gray-600 mt-2">0 posts</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Posts
          </CardTitle>
          <CardDescription>Scheduled and posted content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Share2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Social Media Manager Coming Soon</p>
            <p className="text-sm">Post to all platforms from one dashboard</p>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/social/posts for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
