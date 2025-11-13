import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const model = 'gemini-2.5-flash'; // ← Cambiar aquí

console.log('🔑 API Key:', API_KEY ? (API_KEY.substring(0, 10) + '...') : '❌ NO ENCONTRADA');
console.log('🧪 Probando Gemini API...\n');

if (!API_KEY) {
  console.error('❌ Error: No se encontró GEMINI_API_KEY en .env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;

const body = {
  contents: [{
    parts: [{ text: "Hola, di 'funciona' si me recibes correctamente" }]
  }]
};

console.log('🌐 Llamando a:', url.replace(API_KEY, 'HIDDEN'));
console.log('📤 Body:', JSON.stringify(body, null, 2), '\n');

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
  .then(async (response) => {
    const text = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📦 Respuesta raw:\n', text, '\n');
    
    if (response.ok) {
      const data = JSON.parse(text);
      if (data.candidates && data.candidates[0]) {
        console.log('✅ FUNCIONA! Texto de IA:', data.candidates[0].content.parts[0].text);
      } else {
        console.log('⚠️ Respuesta sin contenido esperado');
      }
    } else {
      console.log('❌ ERROR DE API');
    }
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
  });