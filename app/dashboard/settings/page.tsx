'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  MessageSquare,
  Phone,
  Brain,
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type Tab = 'email' | 'sms' | 'whatsapp' | 'ai';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('email');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Email state
  const [emailCreds, setEmailCreds] = useState<any[]>([]);
  const [emailForm, setEmailForm] = useState({ provider: 'gmail', email: '', password: '' });
  
  // SMS state
  const [smsCreds, setSmsCreds] = useState<any[]>([]);
  const [smsForm, setSmsForm] = useState({ provider: 'twilio', fromNumber: '', accountSid: '', authToken: '', label: '' });
  
  // WhatsApp state
  const [whatsappCreds, setWhatsappCreds] = useState<any[]>([]);
  const [whatsappForm, setWhatsappForm] = useState({ provider: 'twilio', phoneNumberId: '', accountSid: '', authToken: '', label: '' });
  
  // AI state
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [aiForm, setAiForm] = useState({ provider: 'openai', apiKey: '', modelName: 'gpt-4o-mini', label: '' });
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
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
      }
      if (smsRes.ok) {
        const data = await smsRes.json();
        setSmsCreds(data.credentials || []);
      }
      if (whatsappRes.ok) {
        const data = await whatsappRes.json();
        setWhatsappCreds(data.credentials || []);
      }
      if (aiRes.ok) {
        const data = await aiRes.json();
        setAiModels(data.models || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings/email-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSuccess('Email credential saved!');
      setEmailForm({ provider: 'gmail', email: '', password: '' });
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const config = {
        accountSid: smsForm.accountSid,
        authToken: smsForm.authToken,
      };

      const res = await fetch('/api/settings/sms-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: smsForm.provider,
          fromNumber: smsForm.fromNumber,
          config,
          label: smsForm.label,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSuccess('SMS credential saved!');
      setSmsForm({ provider: 'twilio', fromNumber: '', accountSid: '', authToken: '', label: '' });
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const config = {
        accountSid: whatsappForm.accountSid,
        authToken: whatsappForm.authToken,
      };

      const res = await fetch('/api/settings/whatsapp-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: whatsappForm.provider,
          phoneNumberId: whatsappForm.phoneNumberId,
          config,
          label: whatsappForm.label,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSuccess('WhatsApp credential saved!');
      setWhatsappForm({ provider: 'twilio', phoneNumberId: '', accountSid: '', authToken: '', label: '' });
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSuccess('AI model saved!');
      setAiForm({ provider: 'openai', apiKey: '', modelName: 'gpt-4o-mini', label: '' });
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Delete this credential?')) return;

    try {
      const endpoints: Record<string, string> = {
        email: '/api/settings/email-credentials',
        sms: '/api/settings/sms-credentials',
        whatsapp: '/api/settings/whatsapp-credentials',
        ai: '/api/settings/ai-models',
      };

      const res = await fetch(`${endpoints[type]}?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setSuccess('Deleted successfully');
      await fetchAll();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const tabs = [
    { id: 'email' as Tab, name: 'Email', icon: Mail },
    { id: 'sms' as Tab, name: 'SMS', icon: MessageSquare },
    { id: 'whatsapp' as Tab, name: 'WhatsApp', icon: Phone },
    { id: 'ai' as Tab, name: 'AI Models', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          AI Marketer Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure your marketing channels and AI models</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Tab */}
      {activeTab === 'email' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Email Account
              </CardTitle>
              <CardDescription>Save Gmail or SMTP credentials for campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select
                      value={emailForm.provider}
                      onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="gmail">Gmail</option>
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}
                <Button type="submit" disabled={saving}>
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Email Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {emailCreds.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No saved accounts</p>
              ) : (
                <div className="space-y-2">
                  {emailCreds.map((cred) => (
                    <div key={cred.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{cred.email}</div>
                        <div className="text-sm text-gray-500">{cred.provider}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete('email', cred.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* SMS Tab */}
      {activeTab === 'sms' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add SMS Provider
              </CardTitle>
              <CardDescription>Configure Twilio or other SMS provider</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSmsSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={smsForm.label}
                      onChange={(e) => setSmsForm({ ...smsForm, label: e.target.value })}
                      placeholder="My Twilio Account"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Number</Label>
                    <Input
                      value={smsForm.fromNumber}
                      onChange={(e) => setSmsForm({ ...smsForm, fromNumber: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account SID</Label>
                    <Input
                      value={smsForm.accountSid}
                      onChange={(e) => setSmsForm({ ...smsForm, accountSid: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auth Token</Label>
                    <Input
                      type="password"
                      value={smsForm.authToken}
                      onChange={(e) => setSmsForm({ ...smsForm, authToken: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}
                <Button type="submit" disabled={saving}>
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved SMS Providers</CardTitle>
            </CardHeader>
            <CardContent>
              {smsCreds.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No SMS providers configured</p>
              ) : (
                <div className="space-y-2">
                  {smsCreds.map((cred) => (
                    <div key={cred.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{cred.label || cred.provider}</div>
                        <div className="text-sm text-gray-500">{cred.fromNumber}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete('sms', cred.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* WhatsApp Tab */}
      {activeTab === 'whatsapp' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add WhatsApp Provider
              </CardTitle>
              <CardDescription>Configure Twilio WhatsApp or Business API</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={whatsappForm.label}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, label: e.target.value })}
                      placeholder="My WhatsApp Business"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number ID</Label>
                    <Input
                      value={whatsappForm.phoneNumberId}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })}
                      placeholder="whatsapp:+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account SID</Label>
                    <Input
                      value={whatsappForm.accountSid}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, accountSid: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auth Token</Label>
                    <Input
                      type="password"
                      value={whatsappForm.authToken}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, authToken: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}
                <Button type="submit" disabled={saving}>
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved WhatsApp Providers</CardTitle>
            </CardHeader>
            <CardContent>
              {whatsappCreds.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No WhatsApp providers configured</p>
              ) : (
                <div className="space-y-2">
                  {whatsappCreds.map((cred) => (
                    <div key={cred.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{cred.label || cred.provider}</div>
                        <div className="text-sm text-gray-500">{cred.phoneNumberId}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete('whatsapp', cred.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* AI Models Tab */}
      {activeTab === 'ai' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Add AI Model
              </CardTitle>
              <CardDescription>Configure OpenAI, Claude, or other LLM providers</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAiSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select
                      value={aiForm.provider}
                      onChange={(e) => setAiForm({ ...aiForm, provider: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="google">Google (Gemini)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input
                      value={aiForm.modelName}
                      onChange={(e) => setAiForm({ ...aiForm, modelName: e.target.value })}
                      placeholder="gpt-4o-mini"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={aiForm.label}
                      onChange={(e) => setAiForm({ ...aiForm, label: e.target.value })}
                      placeholder="My OpenAI Account"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={aiForm.apiKey}
                      onChange={(e) => setAiForm({ ...aiForm, apiKey: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}
                <Button type="submit" disabled={saving}>
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              {aiModels.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No AI models configured</p>
              ) : (
                <div className="space-y-2">
                  {aiModels.map((model) => (
                    <div key={model.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{model.label || `${model.provider} - ${model.modelName}`}</div>
                        <div className="text-sm text-gray-500">{model.provider} • {model.modelName}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete('ai', model.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
