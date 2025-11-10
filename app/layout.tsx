import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MailPulse - Email Marketing Platform',
  description: 'Send personalized bulk emails with Gmail, SMTP, or SendGrid',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
