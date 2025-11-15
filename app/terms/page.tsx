import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            <p className="text-sm text-gray-500">Last updated: November 11, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing or using MailPulse ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
              <p className="text-gray-700">
                MailPulse is an email marketing platform that allows users to send bulk emails, manage email campaigns, and track email analytics. We provide both free and paid subscription plans.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. User Accounts</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>3.1 Account Creation:</strong> You must provide accurate and complete information when creating an account.</p>
                <p><strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p><strong>3.3 Account Termination:</strong> We reserve the right to terminate accounts that violate these terms or engage in prohibited activities.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Acceptable Use Policy</h2>
              <div className="space-y-2 text-gray-700">
                <p>You agree NOT to use MailPulse for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sending spam, unsolicited emails, or emails to purchased lists</li>
                  <li>Sending emails containing malware, viruses, or harmful content</li>
                  <li>Phishing, fraud, or any illegal activities</li>
                  <li>Harassing, threatening, or abusive content</li>
                  <li>Adult content, hate speech, or discriminatory material</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Impersonating others or misrepresenting your identity</li>
                  <li>Sending emails without proper consent from recipients</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Pricing and Payment</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>5.1 Free Plan:</strong> Includes 100 free email credits for testing purposes.</p>
                <p><strong>5.2 Unlimited Plan:</strong> One-time payment of $99 for lifetime unlimited email sends.</p>
                <p><strong>5.3 Payment Processing:</strong> All payments are processed securely through Stripe.</p>
                <p><strong>5.4 Price Changes:</strong> We reserve the right to modify pricing with 30 days notice to existing customers.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Refund Policy</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-800 font-semibold">
                  ALL SALES ARE FINAL. NO REFUNDS WILL BE PROVIDED FOR ANY REASON.
                </p>
                <p className="text-gray-700 mt-2">
                  Due to the digital nature of our service and the immediate access granted upon purchase, we do not offer refunds, exchanges, or cancellations. We encourage you to use the free plan to test the service before upgrading.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Service Availability</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>7.1 Uptime:</strong> We strive for 99.9% uptime but do not guarantee uninterrupted service.</p>
                <p><strong>7.2 Maintenance:</strong> We may perform scheduled maintenance with prior notice.</p>
                <p><strong>7.3 Service Changes:</strong> We reserve the right to modify or discontinue features at any time.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Email Delivery</h2>
              <p className="text-gray-700">
                While we make every effort to ensure email delivery, we cannot guarantee that all emails will be delivered. Delivery rates depend on various factors including recipient email servers, spam filters, and email content. We are not responsible for emails that are blocked, filtered, or undelivered.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. Data and Privacy</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>9.1 Data Collection:</strong> We collect and process data as described in our Privacy Policy.</p>
                <p><strong>9.2 Data Security:</strong> We implement industry-standard security measures to protect your data.</p>
                <p><strong>9.3 Data Ownership:</strong> You retain ownership of your email content and contact lists.</p>
                <p><strong>9.4 Data Backup:</strong> You are responsible for maintaining backups of your data.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. Intellectual Property</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>10.1 Platform Ownership:</strong> MailPulse and all related trademarks, logos, and content are owned by us.</p>
                <p><strong>10.2 User Content:</strong> You grant us a license to use your content solely for providing the Service.</p>
                <p><strong>10.3 Restrictions:</strong> You may not copy, modify, or reverse engineer our platform.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">11. Limitation of Liability</h2>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-gray-800">
                <p className="font-semibold mb-2">DISCLAIMER:</p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAILPULSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p className="mt-2">
                  OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE PAST 12 MONTHS.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">12. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless MailPulse from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">13. Termination</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>13.1 By You:</strong> You may terminate your account at any time through your account settings.</p>
                <p><strong>13.2 By Us:</strong> We may terminate or suspend your account immediately for violations of these Terms.</p>
                <p><strong>13.3 Effect:</strong> Upon termination, your right to use the Service ceases immediately.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">14. Compliance with Laws</h2>
              <div className="space-y-2 text-gray-700">
                <p>You must comply with all applicable laws including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>CAN-SPAM Act (United States)</li>
                  <li>GDPR (European Union)</li>
                  <li>CASL (Canada)</li>
                  <li>Other applicable anti-spam and privacy laws</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">15. Dispute Resolution</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>15.1 Governing Law:</strong> These Terms are governed by the laws of your jurisdiction.</p>
                <p><strong>15.2 Arbitration:</strong> Any disputes shall be resolved through binding arbitration.</p>
                <p><strong>15.3 Class Action Waiver:</strong> You waive the right to participate in class action lawsuits.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">16. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">17. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mt-2">
                <p className="text-gray-800">Email: support@mailpulse.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">18. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">19. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms constitute the entire agreement between you and MailPulse regarding the use of the Service.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using MailPulse, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
