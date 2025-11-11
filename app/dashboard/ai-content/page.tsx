'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, RefreshCw, Copy, CheckCircle } from 'lucide-react';

export default function AIContentPage() {
  const [type, setType] = useState('email');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [goal, setGoal] = useState('engagement');
  const [targetAudience, setTargetAudience] = useState('');
  const [variations, setVariations] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedContent([]);

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt,
          tone,
          goal,
          targetAudience,
          variations,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate content');

      const data = await res.json();
      setGeneratedContent(data.variations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Content Generator</h1>
        <p className="text-gray-600">Generate high-quality marketing content with AI</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>Configure your AI-generated content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="email">Email Copy</option>
                  <option value="social">Social Media Post</option>
                  <option value="ad">Ad Copy</option>
                  <option value="blog">Blog Post</option>
                  <option value="caption">Caption</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Goal</Label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="engagement">Engagement</option>
                  <option value="conversion">Conversion</option>
                  <option value="awareness">Awareness</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Small business owners"
                />
              </div>

              <div className="space-y-2">
                <Label>Variations ({variations})</Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={variations}
                  onChange={(e) => setVariations(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  rows={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Content
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>AI-generated marketing content variations</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Generated content will appear here</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600">Generating content...</p>
                </div>
              )}

              <div className="space-y-4">
                {generatedContent.map((variation, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Variation {index + 1}</CardTitle>
                        <CardDescription>Temperature: {variation.temperature}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(variation.content, index)}
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {variation.content}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
