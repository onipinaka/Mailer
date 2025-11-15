import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import OpenAI from 'openai';
import AIModel from '@/models/AIModel';
import { decrypt } from '@/lib/security';

export const dynamic = 'force-dynamic';

// POST - AI insights from natural language query
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { query, analyticsData, aiModelId } = body;

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
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

    // Prepare system prompt with analytics context
    const systemPrompt = `You are an AI marketing analytics assistant. You help marketers understand their campaign performance and provide actionable insights.

Current Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Provide clear, actionable insights based on the user's question. Include specific metrics and recommendations when relevant.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const insight = completion.choices[0]?.message?.content || 'No insight generated';

    return NextResponse.json({
      query,
      insight,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    });
  } catch (err: any) {
    console.error('Error generating AI insights:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
