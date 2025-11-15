import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RefundPage() {
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
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-sm text-gray-500">Last updated: November 11, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-semibold text-lg">
                ALL SALES ARE FINAL - NO REFUNDS POLICY
              </AlertDescription>
            </Alert>

            <section>
              <h2 className="text-2xl font-bold mb-3">1. No Refund Policy</h2>
              <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
                <p className="text-gray-800 font-bold text-lg mb-3">
                  MailPulse operates a strict NO REFUNDS policy for all purchases.
                </p>
                <p className="text-gray-700">
                  Due to the digital and immediate nature of our service, all purchases are final and non-refundable. This applies to all payment plans, including the Unlimited Lifetime plan ($99).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Why No Refunds?</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>2.1 Digital Product:</strong> MailPulse is a digital service with instant access upon purchase. Once payment is processed, you immediately gain access to all features.</p>
                
                <p><strong>2.2 Immediate Value:</strong> You receive immediate value and can start sending emails and using all features right away.</p>
                
                <p><strong>2.3 Resource Allocation:</strong> Our infrastructure, email sending capacity, and server resources are allocated to your account immediately.</p>
                
                <p><strong>2.4 Free Trial Available:</strong> We provide 100 free credits specifically for you to test and evaluate the platform before making any purchase decision.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. Before You Purchase</h2>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">We Encourage You To:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Use the Free Plan:</strong> Take advantage of our 100 free email credits to fully test the platform</li>
                  <li><strong>Test All Features:</strong> Compose emails, upload CSV files, send test campaigns, and review analytics</li>
                  <li><strong>Check Compatibility:</strong> Ensure our platform meets your email marketing needs</li>
                  <li><strong>Verify Email Delivery:</strong> Test email delivery to your target audience</li>
                  <li><strong>Review Documentation:</strong> Read our Terms of Service and understand the features</li>
                  <li><strong>Contact Support:</strong> Ask any questions before purchasing (support@mailpulse.com)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. What This Means For You</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p><strong>No Chargebacks:</strong> Initiating a chargeback will result in immediate account termination and may affect your ability to use payment services in the future.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p><strong>No Exchanges:</strong> We do not offer exchanges or downgrades once a purchase is made.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p><strong>No Cancellations:</strong> Once payment is processed, it cannot be cancelled or reversed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p><strong>No Partial Refunds:</strong> We do not offer partial refunds for any reason.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Exceptional Circumstances</h2>
              <p className="text-gray-700 mb-3">
                While our no-refund policy is strict, we understand that exceptional circumstances may occur:
              </p>
              
              <div className="space-y-3 text-gray-700">
                <p><strong>5.1 Duplicate Charges:</strong> If you are charged multiple times for the same purchase due to a technical error, we will refund the duplicate charge(s).</p>
                
                <p><strong>5.2 Service Not Provided:</strong> If we fail to provide access to your account after payment, we will investigate and may issue a refund at our sole discretion.</p>
                
                <p><strong>5.3 Billing Errors:</strong> Verified billing errors will be corrected and refunded.</p>
                
                <p className="font-semibold mt-4">
                  Note: Dissatisfaction with the service, change of mind, or lack of use does NOT qualify as an exceptional circumstance.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Account Termination</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-800">
                  <strong>Important:</strong> If your account is terminated due to violations of our Terms of Service (spam, illegal activity, abuse), you will NOT receive a refund. All payments are forfeited upon account termination for violations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Service Interruptions</h2>
              <p className="text-gray-700">
                We strive for 99.9% uptime, but temporary service interruptions do not qualify for refunds. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Scheduled maintenance windows</li>
                <li>Brief service outages</li>
                <li>Third-party service disruptions (email providers, hosting, etc.)</li>
                <li>Internet connectivity issues</li>
                <li>Force majeure events</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Email Delivery Issues</h2>
              <p className="text-gray-700">
                Refunds are NOT provided for:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Emails marked as spam by recipient servers</li>
                <li>Bounced emails due to invalid addresses</li>
                <li>Low open rates or engagement</li>
                <li>Recipient email server rejections</li>
                <li>Content-based filtering by email providers</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Email deliverability depends on many factors outside our control, including sender reputation, content quality, and recipient server configurations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. Payment Processing</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>9.1 Secure Payments:</strong> All payments are processed securely through Stripe, a PCI-DSS compliant payment processor.</p>
                
                <p><strong>9.2 Payment Confirmation:</strong> You will receive a payment confirmation email upon successful purchase.</p>
                
                <p><strong>9.3 Billing Disputes:</strong> For billing questions, contact support@mailpulse.com with your transaction details.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. Customer Support</h2>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">We're Here to Help!</h3>
                <p className="text-gray-700">
                  While we cannot provide refunds, we are committed to helping you succeed with MailPulse. If you're experiencing issues:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                  <li>Contact our support team for technical assistance</li>
                  <li>Review our documentation and tutorials</li>
                  <li>Ask questions about features and best practices</li>
                  <li>Report bugs or technical problems</li>
                </ul>
                <p className="text-gray-700 mt-3 font-semibold">
                  Email: support@mailpulse.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">11. Chargebacks</h2>
              <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Chargeback Policy:</h3>
                <p className="text-gray-700">
                  Initiating a chargeback instead of contacting us first is considered fraud. If you file a chargeback:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                  <li>Your account will be immediately terminated</li>
                  <li>All access to the platform will be revoked</li>
                  <li>You may be banned from future use of MailPulse</li>
                  <li>We will contest the chargeback with evidence of service delivery</li>
                </ul>
                <p className="text-gray-700 mt-3 font-semibold">
                  Please contact support first to resolve any billing concerns.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">12. Legal Agreement</h2>
              <p className="text-gray-700">
                By making a purchase on MailPulse, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>You have read and understood this No Refund Policy</li>
                <li>You agree to the no-refund terms</li>
                <li>You have tested the free plan before purchasing</li>
                <li>All sales are final and non-refundable</li>
                <li>You waive any right to a refund or chargeback (except for exceptional circumstances)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">13. Contact Information</h2>
              <p className="text-gray-700 mb-2">
                For questions about this Refund Policy or billing concerns:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Email:</strong> support@mailpulse.com</p>
                <p className="text-gray-800"><strong>Billing:</strong> billing@mailpulse.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">14. Policy Updates</h2>
              <p className="text-gray-700">
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting. However, the no-refund policy will remain in effect for all purchases.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-gray-800 font-bold text-center text-lg mb-2">
                  FINAL REMINDER
                </p>
                <p className="text-gray-700 text-center">
                  All purchases on MailPulse are final and non-refundable. Please use the free plan to test before purchasing. By completing your purchase, you acknowledge and accept this no-refund policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
