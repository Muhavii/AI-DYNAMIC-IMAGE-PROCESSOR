import { NextResponse } from 'next/server';
import { processImageWithAI } from '@/lib/aiService';

// Route Segment Config
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // seconds

// Runtime configuration
export const runtime = 'edge';

// Disable body parsing for file uploads
export const dynamicParams = true;
export const fetchCache = 'force-no-store';

function parseFormData(formData: FormData): { file: File | null } {
  const file = formData.get('file') as File | null;
  return { file };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const { file } = parseFormData(formData);
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Process the image with AI by passing the file directly
    const result = await processImageWithAI(new File(
      [file], 
      file.name, 
      { type: file.type }
    ));
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process image' },
        { status: 500 }
      );
    }
    
    // Generate a unique ID for this analysis
    const analysisId = Math.random().toString(36).substring(2, 9);
    
    // Convert the file to base64 for display
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${file.type};base64,${base64Data}`;
    
    return NextResponse.json({
      success: true,
      data: {
        id: analysisId,
        imageUrl,
        description: result.data?.analysis || 'No description available',
        tags: result.data?.tags || [],
        confidence: result.data?.confidence || 0,
        processedAt: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
