'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Shield, Zap, CreditCard, BarChart, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">AI Marketer</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="#security" className="text-gray-600 hover:text-gray-900">Security</Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          AI-Powered Marketing <span className="text-primary">Automation</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Complete AI marketing system with email, SMS, WhatsApp campaigns, lead generation, 
          AI content creation, and automation workflows—all in one platform.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#pricing">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          No credit card required • 100 free emails • Cancel anytime
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Content Generation</CardTitle>
              <CardDescription>
                Generate email copy, social posts, ad creatives, and blogs using AI
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Multi-Channel Campaigns</CardTitle>
              <CardDescription>
                Email, SMS, and WhatsApp campaigns from one unified platform
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Lead Generation</CardTitle>
              <CardDescription>
                Extract leads from Google Maps and automate follow-up sequences
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                JWT auth, HTTP-only cookies, rate limiting, and CAPTCHA protection
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Mail className="h-12 w-12 text-primary mb-4" />
              <CardTitle>HTML Email Editor</CardTitle>
              <CardDescription>
                Rich text editor with sanitization to create beautiful emails
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CreditCard className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Simple Pricing</CardTitle>
              <CardDescription>
                One-time payment for lifetime access. No subscriptions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full px-4 py-20 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <CardDescription className="text-lg">Perfect to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">₹0</div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  100 free email credits
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  All sending methods
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Analytics dashboard
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Email personalization
                </li>
              </ul>
              <Link href="/auth/register">
                <Button className="w-full" variant="outline">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm">
              BEST VALUE
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Lifetime Plan</CardTitle>
              <CardDescription className="text-lg">One-time payment, unlimited emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">₹4,000 <span className="text-lg font-normal text-gray-500">lifetime</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited emails forever
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  All sending methods
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  No monthly fees
                </li>
              </ul>
              <Link href="/auth/register">
                <Button className="w-full">Get Lifetime Access</Button>
              </Link>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Enterprise-Grade Security</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4">
            <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Encrypted Authentication</h3>
              <p className="text-gray-600">
                JWT tokens with HTTP-only cookies and CSRF protection
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Rate Limiting</h3>
              <p className="text-gray-600">
                Automatic protection against brute force attacks
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Password Security</h3>
              <p className="text-gray-600">
                Bcrypt hashing with 12 salt rounds
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">HTML Sanitization</h3>
              <p className="text-gray-600">
                DOMPurify prevents XSS attacks in email templates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of users sending personalized emails at scale
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="text-lg px-8 py-6">
            Start Your Free Trial
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MailPulse</h3>
              <p className="text-gray-600 text-sm">
                Professional email marketing platform for businesses of all sizes.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/auth/register" className="hover:text-primary">Get Started</Link></li>
                <li><Link href="/auth/login" className="hover:text-primary">Login</Link></li>
                <li><Link href="/#pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-primary">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: support@mailpulse.com</li>
                <li>Billing: billing@mailpulse.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-600">
            <p>&copy; 2024 MailPulse. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Secure email marketing platform built with Next.js, MongoDB, and SendGrid
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
