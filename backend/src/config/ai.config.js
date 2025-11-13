import dotenv from 'dotenv';
dotenv.config();

export const AI_CONFIG = {
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.5-flash',
  maxTokens: 1024, // ← Era 500, ahora 1024
  
  thresholds: {
    ratingDifference: 0.5,
    minComments: 3
  }
};

console.log('🔧 AI_CONFIG cargado:', {
  hasApiKey: !!AI_CONFIG.apiKey,
  apiKeyStart: AI_CONFIG.apiKey?.substring(0, 10) + '...',
  model: AI_CONFIG.model
});