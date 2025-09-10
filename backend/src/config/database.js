import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,  // ← Mostrar consultas SQL en consola
  define: {
    timestamps: true     // ← Agregar createdAt/updatedAt automáticamente
  }
});

// Función para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

export default sequelize;

