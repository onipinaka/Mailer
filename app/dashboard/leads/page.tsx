'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Search, RefreshCw, MapPin, Phone, Mail, Globe, Star, Download } from 'lucide-react';

export default function LeadsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jobId, setJobId] = useState('');
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setAllLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  };

  const handleGenerate = async () => {
    if (!query.trim() || !location.trim()) {
      setError('Please enter both search query and location');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${query} in ${location}`,
          maxResults: 50,
        }),
      });

      if (!res.ok) throw new Error('Failed to start lead generation');

      const data = await res.json();
      setJobId(data.jobId);
      setSuccess('Lead generation started! Checking progress...');
      
      // Poll for job status
      pollJobStatus(data.jobId);
    } catch (err: any) {
      setError(err.message || 'Failed to generate leads');
      setLoading(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs?jobId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setJobStatus(data.job);
          
          if (data.job.status === 'completed') {
            clearInterval(interval);
            setLoading(false);
            setSuccess(`Successfully generated ${data.job.successCount} leads!`);
            await fetchLeads();
          } else if (data.job.status === 'failed') {
            clearInterval(interval);
            setLoading(false);
            setError(`Lead generation failed: ${data.job.error}`);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const exportToCSV = () => {
    if (allLeads.length === 0) {
      setError('No leads to export');
      return;
    }

    const headers = ['Business Name', 'Category', 'Address', 'Phone', 'Email', 'Website', 'Rating', 'Reviews', 'Status', 'Google Maps URL'];
    const rows = allLeads.map(lead => [
      lead.businessName || '',
      lead.category || '',
      lead.address || '',
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.rating || '',
      lead.reviewsCount || '',
      lead.status || '',
      lead.googleMapsUrl || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Generation</h1>
        <p className="text-gray-600">Find and manage leads with Google Places API</p>
      </div>

      {/* Generate Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Generate New Leads
          </CardTitle>
          <CardDescription>Search for businesses on Google Maps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search Query</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., restaurants, hotels, lawyers"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Pune, Mumbai, Delhi"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {jobStatus && jobStatus.status === 'processing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{jobStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${jobStatus.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Processed {jobStatus.processedItems} / {jobStatus.totalItems} leads
              </p>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Generate Leads
          </Button>
        </CardContent>
      </Card>

      {/* Generated Leads */}
      {leads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Leads ({leads.length})</CardTitle>
            <CardDescription>Newly generated leads from Google Places</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead._id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{lead.businessName}</h3>
                        <p className="text-sm text-gray-600">{lead.category}</p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {lead.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span>{lead.address}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      {lead.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{lead.rating} ({lead.reviewsCount} reviews)</span>
                        </div>
                      )}
                    </div>

                    {lead.tags && lead.tags.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {lead.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Leads */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Leads ({allLeads.length})
              </CardTitle>
              <CardDescription>Your complete lead database</CardDescription>
            </div>
            {allLeads.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {allLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No leads found. Generate some leads to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allLeads.map((lead) => (
                <div key={lead._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium">{lead.businessName}</h3>
                    <p className="text-sm text-gray-600">
                      {lead.category} • {lead.address}
                      {lead.phone && ` • ${lead.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    {lead.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {lead.rating}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
