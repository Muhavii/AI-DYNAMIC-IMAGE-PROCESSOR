import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testGeminiImageAnalysis() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Example image URL (you can replace this with any image URL)
    const testImageUrl = 'https://storage.googleapis.com/generativeai-downloads/images/landmark1.jpg';
    
    console.log('🖼️ Testing Gemini image analysis...');
    console.log(`📷 Image URL: ${testImageUrl}`);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    
    // Fetch the image
    console.log('⬇️  Downloading image...');
    const response = await fetch(testImageUrl);
    const imageData = await response.arrayBuffer();
    const base64Image = Buffer.from(imageData).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    const prompt = `Analyze this image and provide a JSON response with these fields:
    - description: A detailed description of the image
    - tags: An array of relevant tags
    - confidence: A confidence score between 0 and 1
    
    Example response:
    {
      "description": "A beautiful sunset over the ocean with vibrant colors in the sky",
      "tags": ["sunset", "ocean", "nature", "landscape"],
      "confidence": 0.95
    }`;
    
    console.log('🤖 Sending request to Gemini...');
    const result = await model.generateContent([
      { text: prompt },
      { 
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);
    
    const responseText = await result.response.text();
    console.log('\n📄 Raw response from Gemini:');
    console.log(responseText);
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('\n✅ Parsed response:');
        console.log('📝 Description:', parsedResponse.description || 'No description');
        console.log('🏷️  Tags:', Array.isArray(parsedResponse.tags) ? parsedResponse.tags : ['No tags']);
        console.log('🎯 Confidence:', parsedResponse.confidence || 'Not specified');
        return;
      } catch (e) {
        console.warn('⚠️ Could not parse JSON response, showing raw response instead');
      }
    }
    
    console.log('\n📝 Analysis:');
    console.log(responseText);
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error instanceof Error ? error.message : error);
    
    if (error instanceof Error && 'response' in error) {
      console.error('\nError details:', JSON.stringify(error.response, null, 2));
    }
  }
}

testGeminiImageAnalysis();
