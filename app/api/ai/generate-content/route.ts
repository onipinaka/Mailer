import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import AIModel from '@/models/AIModel';
import { decrypt } from '@/lib/security';
import OpenAI from 'openai';

/**
 * AI Content Generation Endpoint
 * Generates marketing content using OpenAI or other LLM providers
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      type, // 'email' | 'social' | 'ad' | 'blog' | 'caption'
      prompt,
      tone, // 'professional' | 'casual' | 'friendly' | 'urgent'
      goal, // 'engagement' | 'conversion' | 'awareness'
      targetAudience,
      aiModelId, // optional: use stored AI model
      variations = 1, // number of A/B test variations
    } = body || {};

    if (!type || !prompt) {
      return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 });
    }

    let openai: OpenAI | null = null;

    // Use stored AI model if provided
    if (aiModelId) {
      const aiModel = await AIModel.findById(aiModelId).lean();
      if (!aiModel) return NextResponse.json({ error: 'AI model not found' }, { status: 404 });

      const key = process.env.JWT_SECRET;
      if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

      const apiKey = decrypt(aiModel.encryptedApiKey, key);

      if (aiModel.provider === 'openai') {
        openai = new OpenAI({ apiKey });
      }
      // Add other providers (Anthropic, Google) here
    } else {
      // Use environment OpenAI key
      const envKey = process.env.OPENAI_API_KEY;
      if (!envKey) {
        return NextResponse.json({ 
          error: 'No AI model configured. Add OPENAI_API_KEY to environment or save an AI model in settings.' 
        }, { status: 400 });
      }
      openai = new OpenAI({ apiKey: envKey });
    }

    if (!openai) {
      return NextResponse.json({ error: 'AI provider not supported yet' }, { status: 400 });
    }

    // Build system prompt based on type
    const systemPrompts: Record<string, string> = {
      email: `You are an expert email marketer. Generate compelling email content that drives ${goal || 'engagement'}. Use a ${tone || 'professional'} tone.`,
      social: `You are a social media expert. Create engaging social media posts with relevant hashtags for ${targetAudience || 'general audience'}. Tone: ${tone || 'casual'}.`,
      ad: `You are an advertising copywriter. Write high-converting ad copy focused on ${goal || 'conversion'}. Tone: ${tone || 'urgent'}.`,
      blog: `You are a content writer. Create SEO-optimized blog content that provides value. Tone: ${tone || 'professional'}.`,
      caption: `You are a social media caption writer. Write catchy captions with emojis and hashtags. Tone: ${tone || 'friendly'}.`,
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.email;

    // Generate variations
    const results = [];
    for (let i = 0; i < Math.min(variations, 5); i++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7 + (i * 0.1), // Slight variation for A/B testing
      });

      results.push({
        variation: i + 1,
        content: completion.choices[0]?.message?.content || '',
      });
    }

    return NextResponse.json({ 
      success: true, 
      type,
      results,
      metadata: { tone, goal, targetAudience },
    });
  } catch (err) {
    console.error('Error generating AI content', err);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
