'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import { Upload, Send, Mail, MessageSquare, Phone, Sparkles, RefreshCw } from 'lucide-react';

type Channel = 'email' | 'sms' | 'whatsapp';

export default function ComposeNewPage() {
  const [channel, setChannel] = useState<Channel>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Credentials
  const [emailCreds, setEmailCreds] = useState<any[]>([]);
  const [smsCreds, setSmsCreds] = useState<any[]>([]);
  const [whatsappCreds, setWhatsappCreds] = useState<any[]>([]);
  const [aiModels, setAiModels] = useState<any[]>([]);

  // Selected credentials
  const [selectedEmailCred, setSelectedEmailCred] = useState('');
  const [selectedSmsCred, setSelectedSmsCred] = useState('');
  const [selectedWhatsappCred, setSelectedWhatsappCred] = useState('');

  // Email fields
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [sendDelay, setSendDelay] = useState(0); // Delay in seconds between emails

  // SMS/WhatsApp fields
  const [messageBody, setMessageBody] = useState('');
  const [recipientList, setRecipientList] = useState('');

  // AI content generation
  const [selectedAiModel, setSelectedAiModel] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const [emailRes, smsRes, whatsappRes, aiRes] = await Promise.all([
        fetch('/api/settings/email-credentials'),
        fetch('/api/settings/sms-credentials'),
        fetch('/api/settings/whatsapp-credentials'),
        fetch('/api/settings/ai-models'),
      ]);

      if (emailRes.ok) {
        const data = await emailRes.json();
        setEmailCreds(data.credentials || []);
        if (data.credentials?.length > 0) {
          setSelectedEmailCred(data.credentials[0].id);
        }
      }
      if (smsRes.ok) {
        const data = await smsRes.json();
        setSmsCreds(data.credentials || []);
        if (data.credentials?.length > 0) {
          setSelectedSmsCred(data.credentials[0].id);
        }
      }
      if (whatsappRes.ok) {
        const data = await whatsappRes.json();
        setWhatsappCreds(data.credentials || []);
        if (data.credentials?.length > 0) {
          setSelectedWhatsappCred(data.credentials[0].id);
        }
      }
      if (aiRes.ok) {
        const data = await aiRes.json();
        setAiModels(data.models || []);
        if (data.models?.length > 0) {
          setSelectedAiModel(data.models[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validData = (results.data as any[]).filter((row) => row && row.email);
        setCsvData(validData);
      },
      error: () => {
        setError('Failed to parse CSV file');
      },
    });
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt) {
      setError('Please enter a prompt for AI content generation');
      return;
    }

    setGeneratingAi(true);
    setError('');

    try {
      const contentType = channel === 'email' ? 'email' : 'social';
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          prompt: aiPrompt,
          aiModelId: selectedAiModel || undefined,
          variations: 1,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate content');

      const data = await res.json();
      if (data.variations && data.variations.length > 0) {
        const content = data.variations[0].content;
        if (channel === 'email') {
          // Try to extract subject and body
          const lines = content.split('\n');
          const subjectLine = lines.find((l: string) => l.toLowerCase().startsWith('subject:'));
          if (subjectLine) {
            setSubject(subjectLine.replace(/^subject:\s*/i, '').trim());
            const bodyStart = lines.indexOf(subjectLine) + 1;
            setEmailBody(lines.slice(bodyStart).join('\n').trim());
          } else {
            setEmailBody(content);
          }
        } else {
          setMessageBody(content);
        }
        setSuccess('AI content generated!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI content');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSendEmail = async () => {
    if (!subject || !emailBody || csvData.length === 0) {
      setError('Please fill subject, body, and upload CSV with recipients');
      return;
    }

    if (!selectedEmailCred) {
      setError('Please select an email account or configure one in Settings');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create background job for email campaign
      const res = await fetch('/api/campaigns/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          html: emailBody,
          recipients: csvData,
          credentialId: selectedEmailCred,
          sendDelay, // Custom timing gap
        }),
      });

      if (!res.ok) throw new Error('Failed to start email campaign');

      const data = await res.json();
      setSuccess(`Email campaign started! Job ID: ${data.jobId}. Check Jobs page for progress.`);
      setSubject('');
      setEmailBody('');
      setCsvData([]);
      setCsvFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to start email campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!messageBody || !recipientList.trim()) {
      setError('Please enter message and recipient phone numbers');
      return;
    }

    if (!selectedSmsCred) {
      setError('Please configure SMS credentials in Settings');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const recipients = recipientList.split('\n').map((p) => p.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/campaigns/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageBody,
          recipients,
          credentialId: selectedSmsCred,
          sendDelay: 1, // 1 second delay between SMS
        }),
      });

      if (!res.ok) throw new Error('Failed to start SMS campaign');

      const data = await res.json();
      setSuccess(`SMS campaign started! Job ID: ${data.jobId}. Check Jobs page for progress.`);
      setMessageBody('');
      setRecipientList('');
    } catch (err: any) {
      setError(err.message || 'Failed to start SMS campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!messageBody || !recipientList.trim()) {
      setError('Please enter message and recipient WhatsApp numbers');
      return;
    }

    if (!selectedWhatsappCred) {
      setError('Please configure WhatsApp credentials in Settings');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const recipients = recipientList.split('\n').map((p) => p.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/campaigns/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageBody,
          recipients,
          credentialId: selectedWhatsappCred,
          sendDelay: 1, // 1 second delay between WhatsApp messages
        }),
      });

      if (!res.ok) throw new Error('Failed to start WhatsApp campaign');

      const data = await res.json();
      setSuccess(`WhatsApp campaign started! Job ID: ${data.jobId}. Check Jobs page for progress.`);
      setMessageBody('');
      setRecipientList('');
    } catch (err: any) {
      setError(err.message || 'Failed to start WhatsApp campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (channel === 'email') {
      handleSendEmail();
    } else if (channel === 'sms') {
      handleSendSms();
    } else if (channel === 'whatsapp') {
      handleSendWhatsApp();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="text-gray-600">Compose and send multi-channel marketing campaigns</p>
      </div>

      {/* Channel Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Channel</CardTitle>
          <CardDescription>Choose the communication channel for your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={channel === 'email' ? 'default' : 'outline'}
              onClick={() => setChannel('email')}
              className="h-24 flex flex-col gap-2"
            >
              <Mail className="h-6 w-6" />
              Email Marketing
            </Button>
            <Button
              variant={channel === 'sms' ? 'default' : 'outline'}
              onClick={() => setChannel('sms')}
              className="h-24 flex flex-col gap-2"
            >
              <MessageSquare className="h-6 w-6" />
              SMS Marketing
            </Button>
            <Button
              variant={channel === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setChannel('whatsapp')}
              className="h-24 flex flex-col gap-2"
            >
              <Phone className="h-6 w-6" />
              WhatsApp Marketing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Content Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>Generate content using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>AI Model</Label>
            <select
              value={selectedAiModel}
              onChange={(e) => setSelectedAiModel(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={aiModels.length === 0}
            >
              {aiModels.length === 0 ? (
                <option>No AI models configured - Add in Settings</option>
              ) : (
                aiModels.map((model) => (
                  <option key={model._id} value={model._id}>
                    {model.label || `${model.provider} - ${model.modelName}`}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Write a promotional email for our new product launch..."
              rows={3}
            />
          </div>
          <Button onClick={handleGenerateAi} disabled={generatingAi || aiModels.length === 0}>
            {generatingAi ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate Content
          </Button>
        </CardContent>
      </Card>

      {/* Email Campaign */}
      {channel === 'email' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Email Campaign</CardTitle>
              <CardDescription>Send bulk emails to your recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Account</Label>
                <select
                  value={selectedEmailCred}
                  onChange={(e) => setSelectedEmailCred(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={emailCreds.length === 0}
                >
                  {emailCreds.length === 0 ? (
                    <option>No email accounts - Add in Settings</option>
                  ) : (
                    emailCreds.map((cred) => (
                      <option key={cred.id} value={cred.id}>
                        {cred.email} ({cred.provider})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Body (HTML supported)</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email content... Use {{name}}, {{email}} for personalization"
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Recipients CSV (must have 'email' column)</Label>
                <Input type="file" accept=".csv" onChange={handleCsvUpload} />
                {csvData.length > 0 && (
                  <p className="text-sm text-green-600">✓ Loaded {csvData.length} recipients</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Send Delay (seconds between each email)</Label>
                <Input
                  type="number"
                  value={sendDelay}
                  onChange={(e) => setSendDelay(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max="60"
                />
                <p className="text-sm text-gray-500">
                  Add delay to avoid spam filters. Recommended: 2-5 seconds. Campaign will run in background.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* SMS Campaign */}
      {channel === 'sms' && (
        <Card>
          <CardHeader>
            <CardTitle>SMS Campaign</CardTitle>
            <CardDescription>Send bulk SMS messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SMS Provider</Label>
              <select
                value={selectedSmsCred}
                onChange={(e) => setSelectedSmsCred(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={smsCreds.length === 0}
              >
                {smsCreds.length === 0 ? (
                  <option>No SMS providers - Add in Settings</option>
                ) : (
                  smsCreds.map((cred) => (
                    <option key={cred.id} value={cred.id}>
                      {cred.label || cred.fromNumber} ({cred.provider})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Your SMS message (max 160 characters for best delivery)"
                rows={5}
                maxLength={320}
              />
              <p className="text-sm text-gray-500">{messageBody.length} characters</p>
            </div>
            <div className="space-y-2">
              <Label>Recipients (one phone number per line, with country code)</Label>
              <Textarea
                value={recipientList}
                onChange={(e) => setRecipientList(e.target.value)}
                placeholder="+1234567890&#10;+1987654321"
                rows={6}
              />
              <p className="text-sm text-gray-500">
                {recipientList.split('\n').filter(Boolean).length} recipients
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Campaign */}
      {channel === 'whatsapp' && (
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Campaign</CardTitle>
            <CardDescription>Send bulk WhatsApp messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>WhatsApp Provider</Label>
              <select
                value={selectedWhatsappCred}
                onChange={(e) => setSelectedWhatsappCred(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={whatsappCreds.length === 0}
              >
                {whatsappCreds.length === 0 ? (
                  <option>No WhatsApp providers - Add in Settings</option>
                ) : (
                  whatsappCreds.map((cred) => (
                    <option key={cred.id} value={cred.id}>
                      {cred.label || cred.phoneNumberId} ({cred.provider})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Your WhatsApp message"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Recipients (one WhatsApp number per line, format: whatsapp:+1234567890)</Label>
              <Textarea
                value={recipientList}
                onChange={(e) => setRecipientList(e.target.value)}
                placeholder="whatsapp:+1234567890&#10;whatsapp:+1987654321"
                rows={6}
              />
              <p className="text-sm text-gray-500">
                {recipientList.split('\n').filter(Boolean).length} recipients
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Button */}
      <Card>
        <CardContent className="pt-6 space-y-4">
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
          <Button onClick={handleSend} disabled={loading} className="w-full" size="lg">
            {loading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
            Send Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
