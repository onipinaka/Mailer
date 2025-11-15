import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import SMSCredential from '@/models/SMSCredential';
import { decrypt } from '@/lib/security';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { to, message, credentialId } = body || {};

    if (!to || !message) return NextResponse.json({ error: 'to and message are required' }, { status: 400 });

    let fromNumber = process.env.SMS_DEFAULT_FROM || null;

    // If credentialId provided, use stored credential
    if (credentialId) {
      const cred = await SMSCredential.findById(credentialId).lean();
      if (!cred) return NextResponse.json({ error: 'Credential not found' }, { status: 404 });

      const key = process.env.JWT_SECRET;
      if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

      const decrypted = decrypt(cred.encryptedConfig, key);
      const config = JSON.parse(decrypted);

      // Currently support Twilio
      if (cred.provider === 'twilio') {
        const accountSid = config.accountSid;
        const authToken = config.authToken;
        if (!accountSid || !authToken) return NextResponse.json({ error: 'Invalid Twilio config' }, { status: 400 });

        const client = twilio(accountSid, authToken);
        fromNumber = cred.fromNumber;

        // Send message
        const sent = await client.messages.create({ body: message, from: fromNumber, to });
        return NextResponse.json({ success: true, sid: sent.sid });
      }

      // Other providers can be added here
      return NextResponse.json({ error: 'Provider not supported yet' }, { status: 400 });
    }

    // No credentialId: try environment-configured provider (stub)
    if (!fromNumber) {
      return NextResponse.json({ error: 'No sender configured. Provide credentialId or set SMS_DEFAULT_FROM' }, { status: 400 });
    }

    // If Twilio env present, attempt to send using TWILIO_ACCOUNT_SID/TOKEN
    const envSid = process.env.TWILIO_ACCOUNT_SID;
    const envToken = process.env.TWILIO_AUTH_TOKEN;
    if (envSid && envToken) {
      const client = twilio(envSid, envToken);
      const sent = await client.messages.create({ body: message, from: fromNumber, to });
      return NextResponse.json({ success: true, sid: sent.sid });
    }

    // Otherwise, stub response (for development)
    console.log('SMS stub send:', { to, from: fromNumber, message });
    return NextResponse.json({ success: true, stub: true });
  } catch (err) {
    console.error('Error sending SMS', err);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
