import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function listAvailableModels() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    console.log('🔍 Listing available Gemini models...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list models
    console.log('Fetching models...');
    const models = await genAI.listModels();
    
    console.log('\n✅ Available models:');
    console.table(
      models.data.models
        .filter((model: any) => model.name.includes('models/'))
        .map((model: any) => ({
          'Model Name': model.name.replace('models/', ''),
          'Supports Content': model.supportedGenerationMethods?.includes('generateContent') || false,
          'Description': model.description || 'No description available',
        }))
    );
    
  } catch (error) {
    console.error('❌ Error listing models:');
    console.error(error instanceof Error ? error.message : error);
    
    if (error instanceof Error && 'response' in error) {
      console.error('\nError details:', JSON.stringify(error.response, null, 2));
    }
  }
}

listAvailableModels();
