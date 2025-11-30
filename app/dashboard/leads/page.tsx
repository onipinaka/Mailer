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
  const [maxResults, setMaxResults] = useState(20);
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
          maxResults: maxResults,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lead Generation
            </h1>
            <p className="text-gray-600 mt-2">Find and manage leads with AI-powered Google Maps scraping</p>
          </div>
          <Button onClick={fetchLeads} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Generate Leads */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-6 w-6" />
              Generate New Leads
            </CardTitle>
            <CardDescription className="text-blue-50">
              Search for businesses on Google Maps and generate qualified leads
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Search Query</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., restaurants, hotels, lawyers"
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Pune, Mumbai, Delhi"
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Number of Leads</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 20)}
                  placeholder="20"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
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

          <Button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating Leads...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Generate Leads
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Leads */}
      {leads.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle className="text-xl">Generated Leads ({leads.length})</CardTitle>
            <CardDescription className="text-green-50">Newly generated leads from Google Maps</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead._id} className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{lead.businessName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{lead.category}</p>
                      </div>
                      <Badge className={getStatusColor(lead.status) + " px-3 py-1"}>{lead.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {lead.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{lead.address}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{lead.phone}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <span className="text-gray-700">{lead.email}</span>
                        </div>
                      )}
                      {lead.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                            Visit Website
                          </a>
                        </div>
                      )}
                      {lead.rating && (
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                          <span className="text-gray-700 font-semibold">{lead.rating} ({lead.reviewsCount} reviews)</span>
                        </div>
                      )}
                    </div>

                    {lead.tags && lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                        {lead.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{tag}</Badge>
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
      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-slate-700 to-slate-800 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6" />
                All Leads ({allLeads.length})
              </CardTitle>
              <CardDescription className="text-slate-200">Your complete lead database</CardDescription>
            </div>
            {allLeads.length > 0 && (
              <Button onClick={exportToCSV} variant="outline" className="bg-white text-slate-800 hover:bg-slate-100 border-0 shadow">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {allLeads.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm mt-1">Generate some leads to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allLeads.map((lead) => (
                <div key={lead._id} className="flex justify-between items-center p-5 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{lead.businessName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{lead.category}</span> • {lead.address}
                      {lead.phone && ` • ${lead.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <Badge className={getStatusColor(lead.status) + " px-3 py-1.5 font-semibold"}>{lead.status}</Badge>
                    {lead.rating && (
                      <div className="flex items-center gap-1.5 text-sm bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-yellow-700">{lead.rating}</span>
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
    </div>
  );
}
