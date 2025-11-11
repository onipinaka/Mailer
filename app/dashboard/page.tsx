'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  MessageSquare,
  Phone,
  Sparkles,
  Users,
  Workflow,
  BarChart3,
  Share2,
  Megaphone,
  Bot,
  Palette,
  Search,
  Zap,
  ArrowRight,
  TrendingUp,
  Eye,
  MousePointer,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRecipients: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const services = [
    {
      title: 'Multi-Channel Campaigns',
      description: 'Create email, SMS, and WhatsApp campaigns',
      icon: Mail,
      color: 'bg-blue-500',
      href: '/dashboard/compose-new',
      features: ['Email Marketing', 'SMS Campaigns', 'WhatsApp Messaging']
    },
    {
      title: 'AI Content Generator',
      description: 'Generate marketing content with AI',
      icon: Sparkles,
      color: 'bg-purple-500',
      href: '/dashboard/ai-content',
      features: ['Email Copy', 'Social Posts', 'Ad Copy', 'Blog Posts']
    },
    {
      title: 'Lead Generation',
      description: 'Find and manage leads with Google Places',
      icon: Users,
      color: 'bg-green-500',
      href: '/dashboard/leads',
      features: ['Google Maps Scraper', 'CRM', 'Lead Scoring', 'Tags']
    },
    {
      title: 'Automation Workflows',
      description: 'Build automated marketing sequences',
      icon: Workflow,
      color: 'bg-orange-500',
      href: '/dashboard/workflows',
      features: ['Triggers', 'Multi-step Actions', 'Delays', 'Conditions']
    },
    {
      title: 'Social Media Manager',
      description: 'Schedule and post to all platforms',
      icon: Share2,
      color: 'bg-pink-500',
      href: '/dashboard/social',
      features: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok']
    },
    {
      title: 'Ad Campaigns',
      description: 'Manage paid advertising campaigns',
      icon: Megaphone,
      color: 'bg-red-500',
      href: '/dashboard/ads',
      features: ['Meta Ads', 'Google Ads', 'LinkedIn Ads', 'TikTok Ads']
    },
    {
      title: 'AI Chatbots',
      description: 'Build intelligent chatbots',
      icon: Bot,
      color: 'bg-cyan-500',
      href: '/dashboard/chatbots',
      features: ['Website Chat', 'WhatsApp Bot', 'Facebook Bot', 'AI Responses']
    },
    {
      title: 'SEO Optimizer',
      description: 'AI-powered SEO tools',
      icon: Search,
      color: 'bg-indigo-500',
      href: '/dashboard/seo',
      features: ['Meta Tags', 'Keywords', 'Content Analysis', 'Schema Markup']
    },
    {
      title: 'Creative Studio',
      description: 'Generate logos, banners, images',
      icon: Palette,
      color: 'bg-yellow-500',
      href: '/dashboard/creative',
      features: ['Logo Design', 'Banners', 'Social Images', 'Ad Creatives']
    },
    {
      title: 'Analytics & Insights',
      description: 'Track performance across all channels',
      icon: BarChart3,
      color: 'bg-teal-500',
      href: '/dashboard/analytics',
      features: ['Cross-Channel', 'AI Insights', 'Reports', 'Real-time']
    },
    {
      title: 'Integrations',
      description: 'Connect external platforms',
      icon: Zap,
      color: 'bg-violet-500',
      href: '/dashboard/integrations',
      features: ['Meta', 'Google', 'Mailchimp', 'HubSpot', 'Salesforce']
    },
    {
      title: 'Settings',
      description: 'Manage credentials and configuration',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/dashboard/settings',
      features: ['Email Accounts', 'SMS Providers', 'WhatsApp', 'AI Models']
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Marketer Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Your complete AI-powered marketing automation platform</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">All channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground">Messages delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageOpenRate?.toFixed(1) ?? 0}%</div>
            <p className="text-xs text-muted-foreground">Engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageClickRate?.toFixed(1) ?? 0}%</div>
            <p className="text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Marketing Services</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card 
              key={service.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer group" 
              onClick={() => router.push(service.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`${service.color} p-3 rounded-lg text-white`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {service.features.map((feature) => (
                    <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Button onClick={() => router.push('/dashboard/compose-new')} className="h-auto py-4 flex-col gap-2">
            <Mail className="h-5 w-5" />
            <span>New Campaign</span>
          </Button>
          <Button onClick={() => router.push('/dashboard/ai-content')} variant="outline" className="h-auto py-4 flex-col gap-2">
            <Sparkles className="h-5 w-5" />
            <span>Generate Content</span>
          </Button>
          <Button onClick={() => router.push('/dashboard/leads')} variant="outline" className="h-auto py-4 flex-col gap-2">
            <Users className="h-5 w-5" />
            <span>Find Leads</span>
          </Button>
          <Button onClick={() => router.push('/dashboard/analytics')} variant="outline" className="h-auto py-4 flex-col gap-2">
            <BarChart3 className="h-5 w-5" />
            <span>View Analytics</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
