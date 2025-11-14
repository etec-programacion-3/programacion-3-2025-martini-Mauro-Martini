import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { createJuego } from './api';
import './App.css'; 

export default function SubirJuego() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    archivoJuego: null,
    imagenPortada: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si no está autenticado
  if (!isAuthenticated()) {
    // Usar un efecto o devolver un mensaje de error si quieres que se muestre antes de redirigir
    navigate('/auth');
    return null; 
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.archivoJuego || !formData.imagenPortada) {
      setError('Debes subir tanto el archivo ZIP del juego como la imagen de portada.');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear el objeto FormData
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);
      data.append('userId', user.id); // Incluye el ID del usuario autenticado
      
      // 2. Adjuntar los archivos
      data.append('archivo', formData.archivoJuego);
      data.append('imagen', formData.imagenPortada);

      // 3. Llamar a la API
      const response = await createJuego(data);
      
      // 4. Navegar al juego recién creado
      navigate(`/juegos/${response.id}`); 

    } catch (err) {
      setError(err.message || 'Error desconocido al subir el juego');
      // Limpiar archivos si la subida falla, por si acaso
      setFormData((prev) => ({
        ...prev,
        archivoJuego: null,
        imagenPortada: null,
      }));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    // Estilos de tema oscuro aplicados por App.css o Auth.js si copias
    // En este caso, App.css ya cubre `input[type="text"]` y similares,
    // pero los inputs de tipo file pueden necesitar estilos extra.
    backgroundColor: '#3f3f46',
    color: '#f4f4f5',
    border: '1px solid #52525b'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#18181b',
      padding: '40px 20px'
    }}>
      <div style={{
        backgroundColor: '#27272a',
        padding: 40,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: 600
      }}>
        <h1 style={{ 
            textAlign: 'center', 
            marginBottom: 32,
            color: '#f4f4f5'
        }}>
          Sube tu Juego
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#f4f4f5' }}>
              Título del Juego:
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#f4f4f5' }}>
              Descripción:
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="4"
              style={{...inputStyle, resize: 'vertical'}}
            />
          </div>

          {/* Archivo ZIP del Juego */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#f4f4f5' }}>
              Archivo del Juego (.zip, debe incluir index.html):
            </label>
            <input
              type="file"
              name="archivoJuego"
              onChange={handleChange}
              accept=".zip"
              required
              style={inputStyle}
            />
          </div>

          {/* Imagen de Portada */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#f4f4f5' }}>
              Imagen de Portada (PNG/JPG/WEBP):
            </label>
            <input
              type="file"
              name="imagenPortada"
              onChange={handleChange}
              accept="image/png, image/jpeg, image/webp"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              fontSize: 18,
              backgroundColor: loading ? '#52525b' : '#ef4444', 
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {loading ? 'Subiendo Juego...' : 'Publicar Juego'}
          </button>
        </form>
      </div>
    </div>
  );
}