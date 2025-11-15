'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus } from 'lucide-react';

export default function ChatbotsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Chatbot Builder</h1>
          <p className="text-gray-600">Build intelligent chatbots</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Chatbot
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {['Website', 'WhatsApp', 'Facebook', 'Instagram', 'Telegram'].map((platform) => (
          <Card key={platform} className="text-center">
            <CardContent className="pt-6">
              <p className="font-medium">{platform}</p>
              <p className="text-sm text-gray-600 mt-2">0 bots</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Your Chatbots
          </CardTitle>
          <CardDescription>AI-powered chatbots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Bot className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Chatbot Builder Coming Soon</p>
            <p className="text-sm">Create AI chatbots for any platform</p>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/chatbots for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
