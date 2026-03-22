import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const body = await req.json();
    const prompt = (body.prompt as string)?.trim();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      // Fallback AI when OpenAI key isn't configured (local development)
      const responses = [
        `I understand you're asking about "${prompt}". As your internship assistant, I'd recommend focusing on practical projects and networking.`,
        `Regarding "${prompt}" - that's a great question! Consider building a portfolio and connecting with professionals in your field.`,
        `About "${prompt}": Focus on gaining hands-on experience through internships, personal projects, and contributing to open source.`,
        `For "${prompt}", I'd suggest: 1) Build relevant projects, 2) Network on LinkedIn, 3) Apply to internships regularly, 4) Keep learning new technologies.`
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return NextResponse.json({ text: randomResponse });
    }

    const client = new OpenAI({ apiKey });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Always use non-streaming for simplicity and reliability
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are InternFlow assistant. Give concise, friendly internship guidance.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.8,
      stream: false
    });

    const text = completion.choices?.[0]?.message?.content ?? 'Sorry, no answer was generated.';
    return NextResponse.json({ text });
  } catch (error) {
    console.error('API/chat error', error);
    return NextResponse.json({ error: 'OpenAI request failed' }, { status: 500 });
  }
}
