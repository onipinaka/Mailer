'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Trash2, Pause, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Job {
  _id: string;
  type: string;
  status: string;
  progress: number;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failedCount: number;
  result?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchJobs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchJobs, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this job?')) return;

    try {
      const res = await fetch(`/api/jobs?jobId=${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'paused':
        return <Pause className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline',
      paused: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return '-';
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Background Jobs</h1>
          <p className="text-gray-600">Monitor your campaign and task progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? 'Pause' : 'Resume'} Auto-Refresh
          </Button>
          <Button onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No jobs yet. Start a campaign to see jobs here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <CardTitle className="text-lg">{formatType(job.type)}</CardTitle>
                      <CardDescription>Started {formatDate(job.createdAt)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(job._id)}
                      disabled={job.status === 'processing'}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        job.status === 'completed'
                          ? 'bg-green-600'
                          : job.status === 'failed'
                          ? 'bg-red-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="text-lg font-semibold">{job.totalItems}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Processed</p>
                    <p className="text-lg font-semibold">{job.processedItems}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Success</p>
                    <p className="text-lg font-semibold text-green-600">{job.successCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Failed</p>
                    <p className="text-lg font-semibold text-red-600">{job.failedCount}</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {getDuration(job.startedAt, job.completedAt)}
                </div>

                {/* Result */}
                {job.status === 'completed' && job.result && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="font-medium text-green-800">✓ Job Completed</p>
                    <pre className="text-xs mt-1 text-green-700">{JSON.stringify(job.result, null, 2)}</pre>
                  </div>
                )}

                {/* Error */}
                {job.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-medium text-red-800">✗ Error</p>
                    <p className="text-red-700 mt-1">{job.error}</p>
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
