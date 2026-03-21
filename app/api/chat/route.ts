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
      const simpleReply = `AI fallback service: I received your message: "${prompt}". Please add OPENAI_API_KEY to get full ChatGPT responses.`;
      return NextResponse.json({ text: simpleReply });
    }

    const client = new OpenAI({ apiKey });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const isStream = req.nextUrl.searchParams.get('stream') === '1';

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are InternFlow assistant. Give concise, friendly internship guidance.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.8,
      stream: isStream
    });

    if (isStream) {
      const encoder = new TextEncoder();

      type OpenAIStreamDelta = { choices?: Array<{ delta?: { content?: string } }> };
      const streamData = new ReadableStream({
        async start(controller) {
          try {
            const asIterable = response as unknown as { [Symbol.asyncIterator]?: () => AsyncIterator<OpenAIStreamDelta> };
            const asyncIter = asIterable[Symbol.asyncIterator];
            if (!asyncIter) {
              const fallbackResponse = response as unknown as { choices?: Array<{ message?: { content?: string } }> };
              const finalText = fallbackResponse.choices?.[0]?.message?.content ?? 'Sorry, no answer was generated.';
              controller.enqueue(encoder.encode(finalText));
              controller.close();
              return;
            }

            for await (const event of iterativeResponse) {
              const delta = event.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            }
            controller.close();
          } catch (streamError) {
            controller.error(streamError);
          }
        }
      });

      return new Response(streamData, {
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    }

    const completion = response as unknown as { choices?: Array<{ message?: { content?: string } }> };
    const text = completion.choices?.[0]?.message?.content ?? 'Sorry, no answer was generated.';
    return NextResponse.json({ text });
  } catch (error) {
    console.error('API/chat error', error);
    return NextResponse.json({ error: 'OpenAI request failed' }, { status: 500 });
  }
}
