'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText } from 'lucide-react';

export default function SEOPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Optimizer</h1>
        <p className="text-gray-600">AI-powered SEO tools</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { title: 'Meta Tags', desc: 'Title, description, keywords' },
          { title: 'Keywords', desc: 'Search volume & difficulty' },
          { title: 'Content Analysis', desc: 'SEO score & tips' },
          { title: 'Schema Markup', desc: 'Structured data' },
        ].map((tool) => (
          <Card key={tool.title} className="text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">{tool.title}</p>
              <p className="text-xs text-gray-600 mt-1">{tool.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Tools
          </CardTitle>
          <CardDescription>Optimize your content for search engines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">SEO Optimizer Coming Soon</p>
            <p className="text-sm">AI-powered SEO analysis and optimization</p>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/seo/optimize for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
