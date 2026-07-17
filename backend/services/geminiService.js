import OpenAI from 'openai';
import config from '../config/env.js';

let openaiClient = null;

const initOpenAI = () => {
  // Support GROQ (Free)
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
    if (!openaiClient) {
      openaiClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
      });
      openaiClient.modelName = 'llama-3.1-8b-instant'; // Fast and free Groq model
    }
    return openaiClient;
  }
  
  // Support OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    if (!openaiClient) {
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      openaiClient.modelName = 'gpt-4o-mini';
    }
    return openaiClient;
  }
  return null;
};

export const parseFoodDescription = async (description) => {
  try {
    const openai = initOpenAI();
    if (!openai) throw new Error('No API key provided. Please set GROQ_API_KEY or OPENAI_API_KEY in .env');
    
    const prompt = `You are a food logistics AI. Parse this surplus food description into structured JSON.
    
Input: "${description}"

Return ONLY a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "items": [
    {
      "name": "item name (e.g. Burger, Pasta, etc)",
      "category": "one of: grains, vegetables, dairy, protein, prepared, bakery, beverages, fruits, other",
      "quantity": number_of_servings_estimated,
      "unit": "servings or kg or liters",
      "shelfLife": estimated_hours_remaining_as_number,
      "perishability": "one of: low, medium, high, critical"
    }
  ],
  "totalServings": total_estimated_servings_as_number,
  "estimatedValue": estimated_monetary_value_in_USD_as_number,
  "carbonSaved": estimated_kg_CO2_saved_as_number
}

Rules:
- STRICT QUANTITY RULE: If a specific number is provided for an item (e.g., "2 burgers", "5 apples"), the quantity MUST be exactly that number (2, 5). Do not override explicit numbers.
- VOLUME RULE: If a large volume container is specified (e.g., "2 vats of soup", "1 tray of lasagna"), estimate the total individual servings (e.g., 1 vat ≈ 200 servings, 1 tray ≈ 25 servings).
- MISSING QUANTITY RULE: ONLY if absolutely no number or volume is provided (e.g., just "pasta"), then default to 10 servings.
- Carbon saved: ~0.3kg CO2 per serving of food rescued.
- Always return valid JSON, absolutely no extra text.`;

    const response = await openai.chat.completions.create({
      model: openai.modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0].message.content.trim();
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('AI Processing Error:', error.message);
    throw new Error(`AI Processing Failed: ${error.message}`);
  }
};

export default { parseFoodDescription };
