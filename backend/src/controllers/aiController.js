import Comment from '../models/Comment.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { AI_CONFIG } from '../config/ai.config.js';
import { buildRecommendationsPrompt } from '../utils/promptBuilder.js';
import { Op } from 'sequelize'; 
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar si el usuario tiene IA habilitada
    const user = await User.findByPk(userId);
    if (!user.aiEnabled) {
      return res.status(403).json({ 
        error: 'Las recomendaciones de IA están desactivadas en tu perfil' 
      });
    }
    
    // 1. Obtener juegos que el usuario ha comentado con buena calificación (>= 4)
    const userComments = await Comment.findAll({
      where: { userId },
      include: [{ 
        model: Game,
        attributes: ['id', 'titulo', 'descripcion']
      }],
      order: [['calidad', 'DESC']]
    });
    
    const positiveComments = userComments.filter(c => c.calidad >= 4);
    
    if (positiveComments.length === 0) {
      return res.json({ 
        recommendations: [],
        message: 'Aún no tienes suficientes valoraciones para generar recomendaciones'
      });
    }
    
    // 2. Obtener todos los juegos disponibles (excepto los que ya jugó)
    const playedGameIds = userComments.map(c => c.gameId);
    const allGames = await Game.findAll({
      where: {
        id: { [Op.notIn]: playedGameIds }
      },
      attributes: ['id', 'titulo', 'descripcion']
    });
    
    if (allGames.length === 0) {
      return res.json({ 
        recommendations: [],
        message: '¡Has jugado todos los juegos disponibles!'
      });
    }
    
    // 3. Llamar a la IA
    const prompt = buildRecommendationsPrompt(positiveComments, allGames);

    // Cambiar v1beta por v1
    const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        contents: [{
            parts: [{ text: prompt }]
        }]
        })
    }
    );
    if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    const recommendedIds = JSON.parse(aiText);
    
    // 4. Obtener los juegos recomendados con sus detalles
    const recommendations = await Game.findAll({
      where: { id: recommendedIds },
      include: [{ model: User, attributes: ['id', 'nombre'] }]
    });
    
    res.json({ recommendations });
    
  } catch (error) {
    console.error('Error al generar recomendaciones:', error);
    res.status(500).json({ 
      error: 'Error al generar recomendaciones', 
      details: error.message 
    });
  }
};