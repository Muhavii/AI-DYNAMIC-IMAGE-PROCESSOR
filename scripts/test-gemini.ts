import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testConnection() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables');
      process.exit(1);
    }

    console.log('🔑 Testing Gemini API key...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = 'Hello, Gemini! Please respond with "API Connection Successful" if you can read this.';
    
    console.log('🔄 Sending test request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Response:');
    console.log(text);
    console.log('\n🎉 Gemini integration is working correctly!');
    
    return text;
  } catch (error) {
    console.error('❌ Error testing Gemini API:');
    console.error(error instanceof Error ? error.message : error);
    
    // If the first attempt fails, try listing available models
    console.log('\n🔄 Trying to list available models...');
    await listModels();
    
    process.exit(1);
  }
}

// Run the test
testConnection();
