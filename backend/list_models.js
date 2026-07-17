import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Models for your API Key:');
      data.models.forEach(model => {
        if (model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${model.name.replace('models/', '')}`);
        }
      });
    } else {
      console.error('Error fetching models:', data);
    }
  } catch (error) {
    console.error('Failed to list models:', error.message);
  }
}

listAvailableModels();
