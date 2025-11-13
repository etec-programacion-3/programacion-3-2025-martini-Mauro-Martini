export const buildCommentAnalysisPrompt = (comment, avgCalidad, avgDificultad, gameTitle) => {
  const userCalidad = parseFloat(comment.calidad);
  const userDificultad = parseFloat(comment.dificultad);
  
  const calidadDiff = Math.abs(userCalidad - avgCalidad);
  const dificultadDiff = Math.abs(userDificultad - avgDificultad);
  
  return `Eres un asistente amigable de una plataforma de juegos indie como itch.io.

Un usuario acaba de comentar sobre el juego "${gameTitle}":
- Su calificación de calidad: ${userCalidad}/5
- Promedio de calidad: ${avgCalidad.toFixed(2)}/5
- Su calificación de dificultad: ${userDificultad}/5
- Promedio de dificultad: ${avgDificultad.toFixed(2)}/5
- Comentario: "${comment.texto}"

Diferencia en calidad: ${calidadDiff.toFixed(2)} puntos
Diferencia en dificultad: ${dificultadDiff.toFixed(2)} puntos

Genera una respuesta CORTA (máximo 2 líneas) reconociendo su perspectiva única. 
Sé amigable, evita ser repetitivo. Ejemplos:
- "¡Parece que tienes un ojo crítico! Gracias por tu feedback detallado."
- "Interesante perspectiva, tu opinión ayuda a otros jugadores a decidir."
- "¡Vaya! Tienes una opinión bastante diferente. ¿Qué te llamó más la atención?"

NO uses emojis. NO uses formato markdown. Solo texto plano.`;
};

export const buildRecommendationsPrompt = (userGames, allGames) => {
  const gamesPlayed = userGames.map(g => 
    `- ${g.Game.titulo} (Calidad: ${g.calidad}/5, Dificultad: ${g.dificultad}/5, Género: ${g.Game.descripcion})`
  ).join('\n');
  
  const availableGames = allGames.map(g => 
    `- ID:${g.id} | ${g.titulo} | ${g.descripcion || 'Sin descripción'}`
  ).join('\n');
  
  return `Eres un sistema de recomendación de juegos indie.

JUEGOS QUE EL USUARIO HA JUGADO Y VALORADO POSITIVAMENTE (calidad >= 4):
${gamesPlayed}

JUEGOS DISPONIBLES EN LA PLATAFORMA:
${availableGames}

Basándote en los gustos del usuario, recomienda 3-5 juegos de la lista disponible.
Responde SOLO con un JSON array de IDs de juegos, ejemplo: [1, 5, 8]

NO incluyas explicaciones. SOLO el array JSON.`;
};