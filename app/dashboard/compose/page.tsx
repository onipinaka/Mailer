'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectItem } from '@/components/ui/select';
import Papa from 'papaparse';
import { Upload, Send, CheckCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SavedCredential {
  id: string;
  provider: string;
  email: string;
}

export default function ComposePage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [sendMethod, setSendMethod] = useState<'sendgrid' | 'gmail' | 'smtp'>('sendgrid');
  
  // Saved credentials
  const [savedCredentials, setSavedCredentials] = useState<SavedCredential[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>('');
  const [useManualCredentials, setUseManualCredentials] = useState(false);
  
  // Gmail/SMTP config (for manual entry)
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchSavedCredentials();
  }, []);

  const fetchSavedCredentials = async () => {
    try {
      const response = await fetch('/api/settings/email-credentials');
      if (response.ok) {
        const data = await response.json();
        setSavedCredentials(data.credentials || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved credentials:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Skip empty lines
      complete: (results) => {
        // Filter out empty rows and rows without email
        const validData = (results.data as any[]).filter(row => 
          row && row.email && row.email.trim() !== ''
        );
        setCsvData(validData);
        if (validData.length > 0 && validData[0]) {
          setCsvHeaders(Object.keys(validData[0] as Record<string, any>));
        }
      },
      error: (error) => {
        setError('Failed to parse CSV file');
      },
    });
  };

  const handleSend = async () => {
    setError('');
    setSuccess(false);

    if (!subject || !htmlTemplate || csvData.length === 0) {
      setError('Please fill in all fields and upload a CSV file');
      return;
    }

    // Check credentials
    if (sendMethod === 'gmail') {
      if (!useManualCredentials && !selectedCredentialId) {
        setError('Please select a saved account or enter credentials manually');
        return;
      }
      if (useManualCredentials && (!gmailUser || !gmailPassword)) {
        setError('Please provide Gmail credentials');
        return;
      }
    }

    if (sendMethod === 'smtp') {
      if (!useManualCredentials && !selectedCredentialId) {
        setError('Please select a saved account or enter credentials manually');
        return;
      }
      if (useManualCredentials && (!smtpHost || !smtpUser || !smtpPassword)) {
        setError('Please provide SMTP configuration');
        return;
      }
    }

    setLoading(true);

    try {
      const config: any = {};
      
      if (sendMethod === 'gmail') {
        if (useManualCredentials) {
          config.gmail = { user: gmailUser, password: gmailPassword };
        } else {
          config.credentialId = selectedCredentialId;
        }
      } else if (sendMethod === 'smtp') {
        if (useManualCredentials) {
          config.smtp = {
            host: smtpHost,
            port: parseInt(smtpPort),
            user: smtpUser,
            password: smtpPassword,
            secure: smtpSecure,
          };
        } else {
          config.credentialId = selectedCredentialId;
        }
      }

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          htmlTemplate,
          recipients: csvData,
          sendMethod,
          config,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setResult(data);
      } else {
        setError(data.error || 'Failed to send campaign');
      }
    } catch (err) {
      setError('An error occurred while sending');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compose Campaign</h1>
        <p className="text-gray-600">Create and send personalized email campaigns</p>
      </div>

      {success && result && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Campaign sent successfully! Sent: {result.sent}, Failed: {result.failed}, Skipped: {result.skipped}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Recipients</CardTitle>
          <CardDescription>
            Upload a CSV file with email addresses and personalization fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CSV File</label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV should have headers like: email, name, company
              </p>
            </div>

            {csvHeaders.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Detected Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {csvHeaders.map((header) => (
                    <span
                      key={header}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {`{{${header}}}`}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {csvData.length} recipient(s) loaded
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
          <CardDescription>Write your email subject and body</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Hello {{name}}, special offer for {{company}}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Body (HTML)</label>
            <Textarea
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              placeholder="<h1>Hello {{name}}</h1><p>We have a special offer for {{company}}...</p>"
              rows={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {`{{fieldName}}`} for personalization
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Method</CardTitle>
          <CardDescription>Choose how to send your emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button
              variant={sendMethod === 'sendgrid' ? 'default' : 'outline'}
              onClick={() => setSendMethod('sendgrid')}
            >
              SendGrid (Platform)
            </Button>
            <Button
              variant={sendMethod === 'gmail' ? 'default' : 'outline'}
              onClick={() => setSendMethod('gmail')}
            >
              Gmail
            </Button>
            <Button
              variant={sendMethod === 'smtp' ? 'default' : 'outline'}
              onClick={() => setSendMethod('smtp')}
            >
              Custom SMTP
            </Button>
          </div>

          {sendMethod === 'gmail' && (
            <div className="space-y-4 border-t pt-4">
              {savedCredentials.filter(c => c.provider === 'gmail').length > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Saved Gmail Account
                    </label>
                    <Select
                      value={selectedCredentialId}
                      onChange={(e) => {
                        setSelectedCredentialId(e.target.value);
                        setUseManualCredentials(e.target.value === 'manual');
                      }}
                    >
                      <SelectItem value="">-- Choose an account --</SelectItem>
                      {savedCredentials
                        .filter(c => c.provider === 'gmail')
                        .map(cred => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.email}
                          </SelectItem>
                        ))}
                      <SelectItem value="manual">Enter credentials manually</SelectItem>
                    </Select>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    <span>or </span>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/settings')}
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add new account in Settings
                    </button>
                  </div>
                </>
              )}

              {(useManualCredentials || savedCredentials.filter(c => c.provider === 'gmail').length === 0) && (
                <>
                  {savedCredentials.filter(c => c.provider === 'gmail').length === 0 && (
                    <Alert>
                      <AlertDescription>
                        No saved Gmail accounts. You can{' '}
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard/settings')}
                          className="text-primary hover:underline font-medium"
                        >
                          add one in Settings
                        </button>
                        {' '}or enter credentials below.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Gmail Address</label>
                    <Input
                      type="email"
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">App Password</label>
                    <Input
                      type="password"
                      value={gmailPassword}
                      onChange={(e) => setGmailPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <a href="https://support.google.com/accounts/answer/185833" target="_blank" className="text-primary hover:underline">
                        How to create app password
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {sendMethod === 'smtp' && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Host</label>
                  <Input
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Port</label>
                  <Input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="smtp-user"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="smtp-secure" className="text-sm">
                  Use SSL/TLS
                </label>
              </div>
            </div>
          )}

          {sendMethod === 'sendgrid' && (
            <Alert>
              <AlertDescription>
                Emails will be sent using the platform's SendGrid account
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSend}
          disabled={loading || csvData.length === 0}
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Campaign
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
