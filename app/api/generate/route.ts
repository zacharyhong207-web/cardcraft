import { NextResponse } from 'next/server';

const SYSTEM_API_KEY = process.env.AI_API_KEY || '177efb29cba84921906be85f4d10612f.dQG86KdA2TrCL0ek';
const SYSTEM_BASE_URL = process.env.AI_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';

export async function POST(req: Request) {
  try {
    const { prompt, stylePreset, apiKey } = await req.json();

    const finalKey = apiKey || SYSTEM_API_KEY;
    if (!finalKey) {
      return NextResponse.json(
        { error: 'No API key provided. Please configure one in settings.' },
        { status: 401 }
      );
    }

    const baseUrl = SYSTEM_BASE_URL;
    const model = process.env.AI_MODEL || 'cogview-3-plus';
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/images/generations`;

    // Enhance prompt for CardCraft
    const enhancedPrompt = `${prompt}, style: ${stylePreset}, Apple Wallet card background, horizontal framing, cinematic wide angle, centered composition, 8k resolution, minimalist texture, clean composition, no text, empty center space, high-quality digital art.`;

    const payload = {
      model: model,
      prompt: enhancedPrompt,
      size: model.includes('cogview') ? '1440x960' : '1792x1024'
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('API Provider Error:', err);
      throw new Error(`API failed with status ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url || (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : '');

    if (!imageUrl) {
      console.error('API Provider parsing error:', data);
      throw new Error('Failed to parse image from response.');
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed.' },
      { status: 500 }
    );
  }
}
