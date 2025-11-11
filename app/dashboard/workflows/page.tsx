'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Plus, Play, Pause } from 'lucide-react';

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Workflows</h1>
          <p className="text-gray-600">Build automated marketing sequences</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Builder
          </CardTitle>
          <CardDescription>Create automation flows with triggers and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Workflow className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Workflow Builder Coming Soon</p>
            <p className="text-sm">Build complex automation flows like:</p>
            <ul className="text-sm mt-4 space-y-2 max-w-md mx-auto text-left">
              <li>• New lead → Send welcome email → Wait 1 day → WhatsApp follow-up</li>
              <li>• Email opened → Tag as engaged → Send offer email</li>
              <li>• Link clicked → Create task → Notify sales team</li>
            </ul>
            <p className="text-xs mt-6 text-gray-400">Use the API endpoints at /api/workflows for now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
