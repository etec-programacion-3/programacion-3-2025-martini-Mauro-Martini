import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJuego, getCommentsByGame, createComment } from './api';
import { useAuth } from './context/AuthContext';
import './App.css';

export default function Juego() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [juego, setJuego] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Estado del formulario de comentario
  const [nuevoComentario, setNuevoComentario] = useState({
    calidad: 0,
    dificultad: 0,
    texto: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar juego
  useEffect(() => {
    async function fetchJuego() {
      setError(null);
      setLoading(true);
      try {
        const juegoData = await getJuego(id);
        setJuego(juegoData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJuego();
  }, [id]);

  // Cargar comentarios
  useEffect(() => {
    async function fetchComentarios() {
      setLoadingComments(true);
      try {
        const comments = await getCommentsByGame(id);
        setComentarios(comments);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    fetchComentarios();
  }, [id]);

  // Helper para obtener URL del juego
  const getJuegoUrl = (rutaCarpetaJuego) => {
    if (!rutaCarpetaJuego) return null;
    return `http://localhost:3000/juegos-ejecutables/${rutaCarpetaJuego}index.html`;
  };

  // Convertir horas a formato legible
  const formatearTiempo = (horas) => {
    if (horas === 0) return '0 horas';
    if (horas < 1) return `${Math.round(horas * 60)} minutos`;
    const horasEnteras = Math.floor(horas);
    const minutos = Math.round((horas - horasEnteras) * 60);
    if (minutos === 0) return `${horasEnteras} ${horasEnteras === 1 ? 'hora' : 'horas'}`;
    return `${horasEnteras}h ${minutos}m`;
  };

  // Manejar envío de comentario
  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    
    if (nuevoComentario.calidad === 0) {
      alert('Por favor califica la calidad del juego');
      return;
    }
    if (nuevoComentario.dificultad === 0) {
      alert('Por favor califica la dificultad del juego');
      return;
    }
    if (!nuevoComentario.texto.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    try {
      await createComment({
        userId: nuevoComentario.userId,
        gameId: parseInt(id),
        calidad: parseInt(nuevoComentario.calidad),
        dificultad: parseInt(nuevoComentario.dificultad),
        texto: nuevoComentario.texto
      });

      // Recargar comentarios y juego (para actualizar promedios)
      const comments = await getCommentsByGame(id);
      setComentarios(comments);
      
      const juegoData = await getJuego(id);
      setJuego(juegoData);

      // Limpiar formulario
      setNuevoComentario({
        userId: 1,
        calidad: 0,
        dificultad: 0,
        texto: ''
      });

      alert('¡Comentario publicado!');
    } catch (err) {
      alert('Error al publicar comentario: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Componente de selector de estrellas
  const StarRating = ({ value, onChange, label }) => {
    const [hover, setHover] = useState(0);

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
          {label}: {value > 0 && `${value}/5`}
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '32px',
                padding: 0,
                transition: 'transform 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {star <= (hover || value) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar estrellas (solo lectura)
  const renderStars = (rating) => {
    return (
      <span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ fontSize: '18px' }}>
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          cursor: 'pointer', 
          marginBottom: 24,
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      >
        ← Volver
      </button>

      {loading && <p>Cargando juego...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {juego && (
        <>
          {/* Título */}
          <h1 style={{ textAlign: 'center', marginBottom: 32, fontSize: '2.5em' }}>
            {juego.titulo}
          </h1>

          {/* Juego */}
          {juego.rutaCarpetaJuego && (
            <div style={{ marginBottom: 32 }}>
              <iframe
                src={getJuegoUrl(juego.rutaCarpetaJuego)}
                width="100%"
                height="600"
                style={{ 
                  border: '2px solid #333', 
                  borderRadius: '8px',
                  backgroundColor: '#000',
                  display: 'block'
                }}
                title={`Jugar ${juego.titulo}`}
                allowFullScreen
              />
            </div>
          )}

          {/* Información del juego */}
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: 24, 
            borderRadius: 8,
            marginBottom: 32
          }}>
            <p style={{ fontSize: '18px', marginBottom: 16 }}>
              <strong>Descripción:</strong> {juego.descripcion || 'Sin descripción'}
            </p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div>
                <strong>Calidad Promedio:</strong>
                <div style={{ marginTop: 4 }}>
                  {juego.avgCalidad ? (
                    <>
                      {renderStars(Math.round(juego.avgCalidad))}
                      <span style={{ marginLeft: 8, fontSize: '16px' }}>{juego.avgCalidad}/5</span>
                    </>
                  ) : (
                    <span>Sin calificar</span>
                  )}
                </div>
              </div>
              <div>
                <strong>Dificultad Promedio:</strong>
                <div style={{ marginTop: 4 }}>
                  {juego.avgDificultad ? (
                    <>
                      {renderStars(Math.round(juego.avgDificultad))}
                      <span style={{ marginLeft: 8, fontSize: '16px' }}>{juego.avgDificultad}/5</span>
                    </>
                  ) : (
                    <span>Sin calificar</span>
                  )}
                </div>
              </div>
              <p style={{ fontStyle: 'italic' }}><strong>Autor:</strong> {juego.User?.nombre}</p>
            </div>
          </div>

          {/* Sección de comentarios */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ marginBottom: 24, fontSize: '2em' }}>💬 Comentarios ({comentarios.length})</h2>

            {/* Formulario para nuevo comentario */}
            <form onSubmit={handleSubmitComentario} style={{
              backgroundColor: '#f0f0f0',
              padding: 24,
              borderRadius: 8,
              marginBottom: 32
            }}>
              <h3 style={{ marginTop: 0 }}>Deja tu comentario</h3>
              
              <StarRating 
                value={nuevoComentario.calidad}
                onChange={(val) => setNuevoComentario({...nuevoComentario, calidad: val})}
                label="Calidad"
              />

              <StarRating 
                value={nuevoComentario.dificultad}
                onChange={(val) => setNuevoComentario({...nuevoComentario, dificultad: val})}
                label="Dificultad"
              />

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  Tu comentario:
                </label>
                <textarea 
                  value={nuevoComentario.texto}
                  onChange={(e) => setNuevoComentario({...nuevoComentario, texto: e.target.value})}
                  placeholder="Escribe tu opinión sobre el juego..."
                  style={{
                    width: '100%',
                    minHeight: 100,
                    padding: 12,
                    fontSize: '16px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: submitting ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {submitting ? 'Publicando...' : 'Publicar Comentario'}
              </button>
            </form>

            {/* Lista de comentarios */}
            {loadingComments && <p>Cargando comentarios...</p>}
            
            {!loadingComments && comentarios.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            )}

            {!loadingComments && comentarios.map((comentario) => (
              <div 
                key={comentario.id} 
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 16
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  flexWrap: 'wrap',
                  gap: 16
                }}>
                  <div>
                    <strong style={{ fontSize: '18px' }}>{comentario.User?.nombre || 'Usuario'}</strong>
                    <p style={{ color: '#666', fontSize: '14px', margin: '4px 0' }}>
                      {new Date(comentario.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '14px' }}>Calidad: </span>
                      {renderStars(comentario.calidad)}
                      <span style={{ fontSize: '14px', marginLeft: 8 }}>{comentario.calidad}/5</span>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '14px' }}>Dificultad: </span>
                      {renderStars(comentario.dificultad)}
                      <span style={{ fontSize: '14px', marginLeft: 8 }}>{comentario.dificultad}/5</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px' }}>⏱️ Tiempo jugado: </span>
                      <strong>{formatearTiempo(comentario.tiempoJuego || 0)}</strong>
                    </div>
                  </div>
                </div>

                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {comentario.texto}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}