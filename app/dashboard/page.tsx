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
  Clock,
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
      title: 'Background Jobs',
      description: 'Monitor campaign progress',
      icon: Clock,
      color: 'bg-slate-500',
      href: '/dashboard/jobs',
      features: ['Email Campaigns', 'Lead Generation', 'Status Tracking', 'Progress']
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
    <div className="space-y-8 p-6 sm:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-8 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <Sparkles className="h-10 w-10 animate-pulse" />
            AI Marketer Dashboard
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Your complete AI-powered marketing automation platform
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Campaigns</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500 text-white group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              All channels
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Reach</CardTitle>
            <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRecipients?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Messages delivered
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Avg. Open Rate</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform duration-300">
              <Eye className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageOpenRate?.toFixed(1) ?? 0}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Avg. Click Rate</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform duration-300">
              <MousePointer className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageClickRate?.toFixed(1) ?? 0}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
          Marketing Services
        </h2>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {services.map((service) => (
            <Card 
              key={service.title} 
              className="relative overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" 
              onClick={() => router.push(service.href)}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Colored accent line - left side for horizontal */}
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${service.color} transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top`}></div>
              
              <div className="flex flex-row items-start gap-6 p-6">
                {/* Icon Section */}
                <div className="flex-shrink-0 relative z-10">
                  <div className={`${service.color} p-5 rounded-2xl text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 relative z-10 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed mt-2 text-gray-600 dark:text-gray-300">
                        {service.description}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                  
                  {/* Features List */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {service.features.slice(0, 4).map((feature, idx) => (
                      <div 
                        key={feature} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 transform group-hover:scale-105 transition-transform duration-300 border border-gray-200 dark:border-gray-700"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${service.color} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 4 && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        <Sparkles className="h-3 w-3" />
                        <span className="font-medium">+{service.features.length - 4} more</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Jump to common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Button 
            onClick={() => router.push('/dashboard/compose-new')} 
            className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-full bg-white/20 group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-6 w-6" />
            </div>
            <span className="font-semibold">New Campaign</span>
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/ai-content')} 
            className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-full bg-white/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-semibold">Generate Content</span>
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/leads')} 
            className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-full bg-white/20 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6" />
            </div>
            <span className="font-semibold">Find Leads</span>
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/jobs')} 
            className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-full bg-white/20 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-6 w-6" />
            </div>
            <span className="font-semibold">View Jobs</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
