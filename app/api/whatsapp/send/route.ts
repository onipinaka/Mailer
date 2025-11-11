import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { decrypt } from '@/lib/security';
import WhatsAppCredential from '@/models/WhatsAppCredential';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { to, body: messageBody, credentialId } = body;

    if (!to || !messageBody) {
      return NextResponse.json({ error: 'to and body are required' }, { status: 400 });
    }

    let client;

    if (credentialId) {
      // Use saved credential
      const credential = await WhatsAppCredential.findOne({
        _id: credentialId,
        userId: payload.userId,
      });

      if (!credential) {
        return NextResponse.json({ error: 'WhatsApp credential not found' }, { status: 404 });
      }

      const key = process.env.JWT_SECRET;
      if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

      const config = JSON.parse(decrypt(credential.encryptedConfig, key));
      client = twilio(config.accountSid, config.authToken);

      // Send WhatsApp message
      const message = await client.messages.create({
        from: credential.phoneNumberId,
        to,
        body: messageBody,
      });

      return NextResponse.json({
        success: true,
        messageSid: message.sid,
        status: message.status,
      });
    } else {
      // Use environment variables (fallback)
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!accountSid || !authToken || !whatsappNumber) {
        return NextResponse.json(
          { error: 'No WhatsApp credentials configured. Add in Settings or set env vars.' },
          { status: 400 }
        );
      }

      client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        from: whatsappNumber,
        to,
        body: messageBody,
      });

      return NextResponse.json({
        success: true,
        messageSid: message.sid,
        status: message.status,
      });
    }
  } catch (err: any) {
    console.error('Error sending WhatsApp message:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
