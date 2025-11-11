import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import OpenAI from 'openai';
import AIModel from '@/models/AIModel';
import { decrypt } from '@/lib/security';

export const dynamic = 'force-dynamic';

// POST - Generate creative assets (logos, banners, images)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, prompt, style, size, aiModelId } = body;

    if (!type || !prompt) {
      return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 });
    }

    // Get AI model credentials
    let openai;
    if (aiModelId) {
      const aiModel = await AIModel.findOne({ _id: aiModelId, userId: payload.userId });
      if (!aiModel) {
        return NextResponse.json({ error: 'AI model not found' }, { status: 404 });
      }
      const key = process.env.JWT_SECRET;
      if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

      const apiKey = decrypt(aiModel.encryptedApiKey, key);
      openai = new OpenAI({ apiKey });
    } else {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'No AI model configured. Add one in Settings or set OPENAI_API_KEY.' },
          { status: 400 }
        );
      }
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    let enhancedPrompt = prompt;
    const styleModifier = style || 'modern and professional';

    switch (type) {
      case 'logo':
        enhancedPrompt = `A ${styleModifier} logo design for: ${prompt}. Clean, memorable, scalable vector style. Simple and iconic.`;
        break;
      case 'banner':
        enhancedPrompt = `A ${styleModifier} marketing banner for: ${prompt}. Eye-catching, professional, suitable for web and social media.`;
        break;
      case 'social_media':
        enhancedPrompt = `A ${styleModifier} social media post image for: ${prompt}. Engaging, visually appealing, optimized for social platforms.`;
        break;
      case 'ad_creative':
        enhancedPrompt = `A ${styleModifier} advertising creative for: ${prompt}. Attention-grabbing, persuasive, suitable for digital ads.`;
        break;
      case 'thumbnail':
        enhancedPrompt = `A ${styleModifier} thumbnail image for: ${prompt}. Compelling, clear, optimized for click-through.`;
        break;
      default:
        enhancedPrompt = `A ${styleModifier} image for: ${prompt}`;
    }

    // Determine image size
    let imageSize: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
    if (size === 'square') imageSize = '1024x1024';
    else if (size === 'portrait') imageSize = '1024x1792';
    else if (size === 'landscape') imageSize = '1792x1024';

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: imageSize,
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({
      type,
      prompt: enhancedPrompt,
      imageUrl,
      size: imageSize,
      revisedPrompt: response.data?.[0]?.revised_prompt,
    });
  } catch (err: any) {
    console.error('Error generating creative:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate creative' },
      { status: 500 }
    );
  }
}
