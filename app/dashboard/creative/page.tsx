'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Image } from 'lucide-react';

export default function CreativePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creative Studio</h1>
        <p className="text-gray-600">Generate logos, banners, and images with AI</p>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {['Logo Design', 'Banners', 'Social Images', 'Ad Creatives', 'Thumbnails'].map((type) => (
          <Card key={type} className="text-center">
            <CardContent className="pt-6">
              <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">{type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            AI Image Generator
          </CardTitle>
          <CardDescription>Create stunning visuals with DALL-E 3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Palette className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Creative Studio Coming Soon</p>
            <p className="text-sm">Generate professional designs with AI</p>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/creative/generate for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
