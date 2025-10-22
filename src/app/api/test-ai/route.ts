import { NextResponse } from 'next/server';
import { processImageWithAI } from '@/lib/aiService';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const result = await processImageWithAI(imageUrl);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
