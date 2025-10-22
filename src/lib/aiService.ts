import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

interface AIPrediction {
  success: boolean;
  data?: {
    analysis: string;
    tags: string[];
    confidence: number;
  };
  error?: string;
}

// Initialize the Gemini model
const MODEL_NAME = 'gemini-2.5-flash';

async function fileToBase64(file: File): Promise<string> {
  if (typeof window !== 'undefined') {
    // Browser environment
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  } else {
    // Node.js environment
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
  }
}

export async function processImageWithAI(imageFile: File): Promise<AIPrediction> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Convert the image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // For Gemini, we'll use the base64 image data directly
    const prompt = `
    Analyze this image:
    
    IMPORTANT: Be extremely precise and factual in your analysis. 
    Pay close attention to the actual content of the image.
    
    Provide a JSON response with these fields:
    - analysis: A detailed, objective description of the image content
    - tags: An array of relevant, specific tags (comma-separated)
    - confidence: A confidence score between 0 and 1
    
    Guidelines:
    1. Describe exactly what you see, not what you imagine or assume
    2. Be specific about people, objects, colors, and settings
    3. Don't make assumptions about things not visible in the image
    4. If you're not sure about something, say so and lower the confidence score
    
    Example response:
    {
      "analysis": "A woman with long black hair wearing a red dress, standing in a room",
      "tags": ["woman", "red dress", "portrait", "indoor", "fashion", "long black hair"],
      "confidence": 0.95
    }
    
    Now analyze the provided image and respond with ONLY the JSON object, no other text.`;
    
    // For the latest Gemini models, we can use the image data directly
    const imagePart = {
      inlineData: {
        data: base64Image.split(',')[1], // Remove the data URL prefix
        mimeType: imageFile.type
      }
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = await result.response.text();
    
    // Clean up the response text to extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    try {
      const parsedResponse = JSON.parse(jsonString);
      console.log('Parsed AI response:', parsedResponse); // Debug log
      
      // Handle both 'analysis' and 'description' fields for backward compatibility
      const analysis = parsedResponse.analysis || parsedResponse.description || 'No description available';
      
      return {
        success: true,
        data: {
          analysis: analysis,
          tags: Array.isArray(parsedResponse.tags) 
            ? parsedResponse.tags 
            : (parsedResponse.tags ? String(parsedResponse.tags).split(',').map((t: string) => t.trim()) : []),
          confidence: Math.min(Math.max(Number(parsedResponse.confidence) || 0.8, 0), 1)
        }
      };
    } catch (e) {
      // If JSON parsing fails, return the raw response
      return {
        success: true,
        data: {
          analysis: responseText,
          tags: [],
          confidence: 0.8
        }
      };
    }
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image with AI'
    };
  }
}

export async function saveAIAnalysis(imagePath: string, analysis: any, userId?: string) {
  const { data, error } = await supabase
    .from('image_analyses')
    .insert([
      { 
        image_path: imagePath, 
        analysis_data: analysis,
        user_id: userId || null
      }
    ]);

  if (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }

  return data;
}
