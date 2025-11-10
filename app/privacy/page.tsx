import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-gray-500">Last updated: November 11, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                MailPulse ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our email marketing platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
                  <p className="text-gray-700">We collect information that you provide directly to us:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Email address (required for account creation)</li>
                    <li>Password (encrypted and securely stored)</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Name and contact details (if provided)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">2.2 Email Campaign Data</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Recipient email addresses from your uploaded CSV files</li>
                    <li>Email content and templates you create</li>
                    <li>Campaign analytics (open rates, delivery status, etc.)</li>
                    <li>Email sending history and logs</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">2.3 Automatically Collected Information</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>IP address and browser information</li>
                    <li>Device type and operating system</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Email open tracking (for campaign analytics)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>To provide and maintain our email marketing service</li>
                <li>To process your email campaigns and deliver emails</li>
                <li>To track campaign analytics and performance</li>
                <li>To process payments and manage subscriptions</li>
                <li>To send service-related notifications</li>
                <li>To improve our platform and user experience</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To comply with legal obligations</li>
                <li>To provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Data Sharing and Disclosure</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">4.1 Third-Party Service Providers</h3>
                  <p className="text-gray-700">We share data with trusted third-party services:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                    <li><strong>MongoDB Atlas:</strong> Secure database hosting</li>
                    <li><strong>Email Providers:</strong> SendGrid, Gmail SMTP for email delivery</li>
                    <li><strong>Vercel:</strong> Hosting and infrastructure</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">4.2 We Do NOT Sell Your Data</h3>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-gray-800 font-semibold">
                      We do not sell, rent, or trade your personal information or email lists to third parties for marketing purposes.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">4.3 Legal Requirements</h3>
                  <p className="text-gray-700">We may disclose information if required by law or to:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Comply with legal obligations or court orders</li>
                    <li>Protect our rights, property, or safety</li>
                    <li>Prevent fraud or abuse</li>
                    <li>Cooperate with law enforcement</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Data Security</h2>
              <div className="space-y-2 text-gray-700">
                <p>We implement industry-standard security measures to protect your data:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Encrypted password storage using bcrypt</li>
                  <li>Secure MongoDB database with authentication</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication tokens (JWT)</li>
                  <li>Rate limiting to prevent abuse</li>
                </ul>
                <p className="mt-3">
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Data Retention</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>6.1 Account Data:</strong> We retain your account information as long as your account is active.</p>
                <p><strong>6.2 Campaign Data:</strong> Email campaigns and analytics are retained for historical tracking.</p>
                <p><strong>6.3 Deletion:</strong> You may request account deletion at any time. Data will be deleted within 30 days.</p>
                <p><strong>6.4 Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Your Privacy Rights</h2>
              <div className="space-y-2 text-gray-700">
                <p>You have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Export:</strong> Download your campaign data and contacts</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                  <li><strong>Object:</strong> Object to certain data processing activities</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, contact us at privacy@mailpulse.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Cookies and Tracking</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>8.1 Essential Cookies:</strong> Required for authentication and platform functionality.</p>
                <p><strong>8.2 Analytics:</strong> We use cookies to understand how users interact with our platform.</p>
                <p><strong>8.3 Email Tracking:</strong> We use tracking pixels to monitor email opens for campaign analytics.</p>
                <p><strong>8.4 Your Control:</strong> You can disable cookies in your browser settings, but this may limit functionality.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. GDPR Compliance (EU Users)</h2>
              <div className="space-y-2 text-gray-700">
                <p>If you are in the European Union, you have additional rights under GDPR:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Right to be informed about data collection</li>
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                </ul>
                <p className="mt-3">
                  Our legal basis for processing: Consent, Contract performance, Legitimate interests, Legal obligations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. Children's Privacy</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-800">
                  MailPulse is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">11. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">12. Email Recipient Privacy</h2>
              <div className="space-y-2 text-gray-700">
                <p>If you are a recipient of emails sent through MailPulse:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We collect open tracking data on behalf of the sender</li>
                  <li>You can unsubscribe using the link in any email</li>
                  <li>Contact the email sender directly for privacy questions about their campaigns</li>
                  <li>We are a service provider acting on behalf of the sender</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">13. California Privacy Rights (CCPA)</h2>
              <div className="space-y-2 text-gray-700">
                <p>California residents have specific rights under the CCPA:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information (we don't sell data)</li>
                  <li>Right to non-discrimination for exercising CCPA rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">14. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">15. Contact Us</h2>
              <p className="text-gray-700 mb-2">
                For questions or concerns about this Privacy Policy or our data practices:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Email:</strong> privacy@mailpulse.com</p>
                <p className="text-gray-800"><strong>Support:</strong> support@mailpulse.com</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using MailPulse, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
