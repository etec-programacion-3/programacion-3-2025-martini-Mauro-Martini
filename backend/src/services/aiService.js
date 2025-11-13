import { AI_CONFIG } from '../config/ai.config.js';
import { buildCommentAnalysisPrompt } from '../utils/promptBuilder.js';

export const generateAIResponse = async (comment, avgCalidad, avgDificultad, gameTitle) => {
  console.log('🔍 generateAIResponse llamado con:', {
    comentarioId: comment.id,
    calidad: comment.calidad,
    avgCalidad,
    dificultad: comment.dificultad,
    avgDificultad,
    gameTitle
  });

  try {
    const calidadDiff = Math.abs(parseFloat(comment.calidad) - avgCalidad);
    const dificultadDiff = Math.abs(parseFloat(comment.dificultad) - avgDificultad);
    
    console.log('🔍 Diferencias calculadas:', {
      calidadDiff,
      dificultadDiff,
      umbral: AI_CONFIG.thresholds.ratingDifference
    });
    
    if (calidadDiff < AI_CONFIG.thresholds.ratingDifference && 
        dificultadDiff < AI_CONFIG.thresholds.ratingDifference) {
      console.log('⚠️ Diferencia insuficiente, no se activa IA');
      return null;
    }
    
    const prompt = buildCommentAnalysisPrompt(comment, avgCalidad, avgDificultad, gameTitle);
    console.log('🔍 Prompt generado (primeros 200 chars):', prompt.substring(0, 200));
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`;
    console.log('🌐 URL:', url.replace(AI_CONFIG.apiKey, 'HIDDEN'));
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: AI_CONFIG.maxTokens
      }
    };
    
    console.log('📤 Enviando request a Gemini...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('🔍 Status de respuesta:', response.status);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('❌ Error de API:', responseText);
      throw new Error(`API Error: ${response.status} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    console.log('🔍 Respuesta completa de Gemini:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Respuesta de Gemini sin contenido esperado:', data);
      return null;
    }
    
    const candidate = data.candidates[0];
    
    // Verificar finishReason
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ Respuesta truncada (MAX_TOKENS alcanzado)');
    }
    
    // Validar que existan parts
    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('❌ Respuesta sin texto (parts vacío):', candidate);
      return null;
    }
    
    const aiText = candidate.content.parts[0].text;
    console.log('✅ Texto de IA extraído:', aiText);
    
    return aiText;
    
  } catch (error) {
    console.error('❌ Error al generar respuesta de IA:', error.message);
    if (error.stack) {
      console.error('Stack completo:', error.stack);
    }
    return null;
  }
};