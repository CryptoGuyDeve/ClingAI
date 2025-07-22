import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const contents = body.contents;
  const searchInput = body.searchInput;
  if (!contents && !searchInput) {
    return NextResponse.json({ error: 'Missing searchInput or contents' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }

  // If no contents array, build it from searchInput
  let geminiContents = contents;
  if (!geminiContents) {
    const prompt = `You are a helpful assistant for a web search app. If the user asks for code, always reply with a code block (using correct language syntax highlighting) and a brief explanation of how the code works. If not, just summarize the topic in 2-3 sentences.\n\nUser: ${searchInput}`;
    geminiContents = [
      { role: 'user', parts: [{ text: prompt }] }
    ];
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({ contents: geminiContents })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return NextResponse.json({ error: 'Gemini API error', details: data }, { status: 500 });
    }
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch summary from Gemini', details: err.message }, { status: 500 });
  }
} 