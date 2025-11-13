import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ No se encontró GEMINI_API_KEY en .env');
  process.exit(1);
}

console.log('🔍 Listando modelos disponibles...\n');

fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log('✅ Modelos disponibles:\n');
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Métodos: ${model.supportedGenerationMethods.join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Error:', JSON.stringify(data, null, 2));
    }
  })
  .catch(err => console.error('❌ Error:', err.message));