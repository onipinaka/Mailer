import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import OpenAI from 'openai';
import AIModel from '@/models/AIModel';
import { decrypt } from '@/lib/security';

// POST - Generate SEO optimizations
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, content, targetKeywords, aiModelId } = body;

    if (!type || !content) {
      return NextResponse.json({ error: 'type and content are required' }, { status: 400 });
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

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'meta_tags':
        systemPrompt = `You are an SEO expert. Generate optimized meta tags (title, description, keywords) for the given content.
Target keywords: ${targetKeywords || 'N/A'}
Format your response as JSON with keys: title (max 60 chars), description (max 160 chars), keywords (comma-separated).`;
        userPrompt = `Content:\n${content}`;
        break;

      case 'keywords':
        systemPrompt = `You are an SEO keyword research expert. Analyze the content and suggest relevant keywords with search volume potential and difficulty estimates.
Return JSON array of objects with: keyword, volume (high/medium/low), difficulty (easy/medium/hard), intent (informational/transactional/navigational).`;
        userPrompt = `Content:\n${content}`;
        break;

      case 'headings':
        systemPrompt = `You are an SEO content optimizer. Suggest optimized H1, H2, H3 headings for the content that include target keywords naturally.
Target keywords: ${targetKeywords || 'N/A'}
Return JSON with: h1 (single), h2 (array of 3-5), h3 (array of 5-10).`;
        userPrompt = `Content:\n${content}`;
        break;

      case 'content_optimization':
        systemPrompt = `You are an SEO content optimizer. Analyze the content and provide specific recommendations to improve SEO.
Target keywords: ${targetKeywords || 'N/A'}
Return JSON with: score (0-100), issues (array of strings), recommendations (array of strings), keywordDensity (percentage).`;
        userPrompt = `Content:\n${content}`;
        break;

      case 'schema_markup':
        systemPrompt = `You are an SEO structured data expert. Generate appropriate Schema.org markup for the given content.
Return JSON-LD format schema markup as a string.`;
        userPrompt = `Content:\n${content}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const result = completion.choices[0]?.message?.content || '{}';

    try {
      const parsedResult = JSON.parse(result);
      return NextResponse.json({
        type,
        result: parsedResult,
      });
    } catch {
      // If not valid JSON, return as text
      return NextResponse.json({
        type,
        result: { text: result },
      });
    }
  } catch (err: any) {
    console.error('Error generating SEO optimization:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate SEO optimization' },
      { status: 500 }
    );
  }
}
