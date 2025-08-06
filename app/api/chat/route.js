import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // or another model supported by OpenRouter
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!apiRes.ok) {
      let err = {};
      try {
        err = await apiRes.json();
      } catch (e) {
        err = { error: { message: 'Unknown error from OpenRouter' } };
      }
      return NextResponse.json({ error: err.error?.message || 'OpenRouter error' }, { status: 500 });
    }

    const data = await apiRes.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ response: aiMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

