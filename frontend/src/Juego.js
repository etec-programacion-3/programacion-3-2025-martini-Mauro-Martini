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
  
  // Estados separados para calificación y comentario
  const [miCalificacion, setMiCalificacion] = useState({
    calidad: 0,
    dificultad: 0
  });
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mostrarFormCalificacion, setMostrarFormCalificacion] = useState(false);

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
        
        // Buscar si el usuario ya calificó
        if (isAuthenticated()) {
          const miComentario = comments.find(c => c.userId === user.id);
          if (miComentario) {
            setMiCalificacion({
              calidad: miComentario.calidad,
              dificultad: miComentario.dificultad
            });
          }
        }
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    fetchComentarios();
  }, [id, isAuthenticated, user]);

  // Helper para obtener URL del juego
  const getJuegoUrl = (rutaCarpetaJuego) => {
    if (!rutaCarpetaJuego) return null;
    return `http://localhost:3000/juegos-ejecutables/${rutaCarpetaJuego}index.html`;
  };

  // Redondear a 0.5
  const roundToHalf = (num) => {
    return Math.round(num * 2) / 2;
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

  // Guardar/actualizar calificación
  const handleGuardarCalificacion = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para calificar');
      navigate('/auth');
      return;
    }

    if (miCalificacion.calidad === 0 || miCalificacion.dificultad === 0) {
      alert('Por favor selecciona calidad y dificultad');
      return;
    }

    setSubmitting(true);
    try {
      // Buscar si ya existe un comentario del usuario
      const comentarioExistente = comentarios.find(c => c.userId === user.id);
      
      await createComment({
        userId: user.id,
        gameId: parseInt(id),
        calidad: parseInt(miCalificacion.calidad),
        dificultad: parseInt(miCalificacion.dificultad),
        texto: comentarioExistente ? comentarioExistente.texto : '' // Mantener texto si existe
      });

      // Recargar datos
      const comments = await getCommentsByGame(id);
      setComentarios(comments);
      const juegoData = await getJuego(id);
      setJuego(juegoData);

      setMostrarFormCalificacion(false);
      alert('¡Calificación guardada!');
    } catch (err) {
      console.error('Error completo:', err);
      alert('Error al guardar calificación: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Enviar comentario
  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para comentar');
      navigate('/auth');
      return;
    }

    if (!nuevoComentario.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    // Verificar que tenga calificación
    if (miCalificacion.calidad === 0 || miCalificacion.dificultad === 0) {
      alert('Debes calificar el juego antes de comentar');
      return;
    }

    setSubmitting(true);
    try {
      await createComment({
        userId: user.id,
        gameId: parseInt(id),
        calidad: parseInt(miCalificacion.calidad),
        dificultad: parseInt(miCalificacion.dificultad),
        texto: nuevoComentario
      });

      // Recargar comentarios y juego
      const comments = await getCommentsByGame(id);
      setComentarios(comments);
      const juegoData = await getJuego(id);
      setJuego(juegoData);

      setNuevoComentario('');
      alert('¡Comentario publicado!');
    } catch (err) {
      console.error('Error completo:', err);
      alert('Error al publicar comentario: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Componente de estrella SVG
  const Star = ({ filled, half, size = 24, color = '#fbbf24' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'inline-block' }}
    >
      {half ? (
        <>
          <defs>
            <linearGradient id={`half-${size}`}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#half-${size})`}
            stroke={color}
            strokeWidth="1"
          />
        </>
      ) : (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={filled ? color : '#e5e7eb'}
          stroke={color}
          strokeWidth="1"
        />
      )}
    </svg>
  );

  // Renderizar estrellas (lectura)
  const renderStars = (rating, size = 20) => {
    const rounded = roundToHalf(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rounded)) {
        stars.push(<Star key={i} filled size={size} />);
      } else if (i === Math.ceil(rounded) && rounded % 1 !== 0) {
        stars.push(<Star key={i} half size={size} />);
      } else {
        stars.push(<Star key={i} filled={false} size={size} />);
      }
    }
    
    return <span style={{ display: 'inline-flex', gap: 2 }}>{stars}</span>;
  };

  // Selector de estrellas interactivo
  const StarRating = ({ value, onChange, label }) => {
    const [hover, setHover] = useState(0);

    return (
      <div style={{ marginBottom: 20 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 12, 
          fontWeight: '600',
          fontSize: '16px',
          color: '#1f2937'
        }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                  padding: 4,
                  transition: 'transform 0.2s',
                  transform: hover === star ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <Star filled={star <= (hover || value)} size={32} />
              </button>
            ))}
          </div>
          {value > 0 && (
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#4b5563',
              marginLeft: 8
            }}>
              {value}/5
            </span>
          )}
        </div>
      </div>
    );
  };

  const miComentario = comentarios.find(c => c.userId === user?.id);
  const yaCalifique = miCalificacion.calidad > 0 && miCalificacion.dificultad > 0;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      paddingBottom: 60
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            cursor: 'pointer', 
            marginBottom: 24,
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontWeight: '600',
            color: '#374151',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          ← Volver
        </button>

        {loading && <p style={{ textAlign: 'center', fontSize: '18px', color: '#6b7280' }}>Cargando juego...</p>}
        {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '18px' }}>{error}</p>}
        
        {juego && (
          <>
            {/* Título */}
            <h1 style={{ 
              textAlign: 'center', 
              marginBottom: 16, 
              fontSize: '3em',
              color: '#111827',
              fontWeight: '800'
            }}>
              {juego.titulo}
            </h1>

            <p style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              fontSize: '18px',
              marginBottom: 32,
              fontStyle: 'italic'
            }}>
              por {juego.User?.nombre}
            </p>

            {/* Juego */}
            {juego.rutaCarpetaJuego && (
              <div style={{ 
                marginBottom: 32,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
              }}>
                <iframe
                  src={getJuegoUrl(juego.rutaCarpetaJuego)}
                  width="100%"
                  height="600"
                  style={{ 
                    border: 'none',
                    backgroundColor: '#000',
                    display: 'block'
                  }}
                  title={`Jugar ${juego.titulo}`}
                  allowFullScreen
                />
              </div>
            )}

            {/* Información y calificación */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
              marginBottom: 32
            }}>
              {/* Info del juego */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: 32, 
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  fontSize: '1.5em', 
                  marginBottom: 16,
                  color: '#111827',
                  fontWeight: '700'
                }}>
                  Sobre el juego
                </h2>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: 1.6,
                  color: '#4b5563',
                  marginBottom: 24
                }}>
                  {juego.descripcion || 'Sin descripción'}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      marginBottom: 4,
                      fontWeight: '600'
                    }}>
                      Calidad Promedio
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {juego.avgCalidad ? (
                        <>
                          {renderStars(juego.avgCalidad, 24)}
                          <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                            {roundToHalf(juego.avgCalidad)}/5
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>Sin calificar</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      marginBottom: 4,
                      fontWeight: '600'
                    }}>
                      Dificultad Promedio
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {juego.avgDificultad ? (
                        <>
                          {renderStars(juego.avgDificultad, 24)}
                          <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                            {roundToHalf(juego.avgDificultad)}/5
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>Sin calificar</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de calificación del usuario */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: 32, 
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: yaCalifique ? '2px solid #10b981' : '2px solid #e5e7eb'
              }}>
                <h2 style={{ 
                  fontSize: '1.5em', 
                  marginBottom: 16,
                  color: '#111827',
                  fontWeight: '700'
                }}>
                  {yaCalifique ? '✓ Tu Calificación' : 'Califica este juego'}
                </h2>

                {!isAuthenticated() ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ marginBottom: 16, color: '#6b7280' }}>
                      Inicia sesión para calificar
                    </p>
                    <button
                      onClick={() => navigate('/auth')}
                      style={{
                        padding: '12px 32px',
                        fontSize: '16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                ) : !mostrarFormCalificacion && yaCalifique ? (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: 8 }}>Calidad</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {renderStars(miCalificacion.calidad, 24)}
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                          {miCalificacion.calidad}/5
                        </span>
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: 8 }}>Dificultad</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {renderStars(miCalificacion.dificultad, 24)}
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                          {miCalificacion.dificultad}/5
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMostrarFormCalificacion(true)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Modificar Calificación
                    </button>
                  </div>
                ) : (
                  <div>
                    <StarRating 
                      value={miCalificacion.calidad}
                      onChange={(val) => setMiCalificacion({...miCalificacion, calidad: val})}
                      label="Calidad"
                    />
                    <StarRating 
                      value={miCalificacion.dificultad}
                      onChange={(val) => setMiCalificacion({...miCalificacion, dificultad: val})}
                      label="Dificultad"
                    />
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={handleGuardarCalificacion}
                        disabled={submitting || miCalificacion.calidad === 0 || miCalificacion.dificultad === 0}
                        style={{
                          flex: 1,
                          padding: '14px',
                          fontSize: '16px',
                          backgroundColor: submitting ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {submitting ? 'Guardando...' : (yaCalifique ? 'Actualizar' : 'Guardar Calificación')}
                      </button>
                      {mostrarFormCalificacion && (
                        <button
                          onClick={() => setMostrarFormCalificacion(false)}
                          style={{
                            padding: '14px 24px',
                            fontSize: '16px',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de comentarios */}
            <div style={{ marginTop: 48 }}>
              <h2 style={{ 
                marginBottom: 32, 
                fontSize: '2em',
                color: '#111827',
                fontWeight: '700'
              }}>
                💬 Comentarios ({comentarios.filter(c => c.texto && c.texto.trim()).length})
              </h2>

              {/* Formulario de comentario */}
              {isAuthenticated() && yaCalifique && (
                <form onSubmit={handleSubmitComentario} style={{
                  backgroundColor: 'white',
                  padding: 32,
                  borderRadius: '16px',
                  marginBottom: 32,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: '#111827' }}>
                    {miComentario?.texto ? 'Actualiza tu comentario' : 'Comparte tu opinión'}
                  </h3>
                  
                  <textarea 
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="¿Qué te pareció el juego? Comparte tu experiencia..."
                    style={{
                      width: '100%',
                      minHeight: 120,
                      padding: 16,
                      fontSize: '16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: 1.6
                    }}
                    required
                  />

                  <button 
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: 16,
                      padding: '14px 32px',
                      fontSize: '16px',
                      backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {submitting ? 'Publicando...' : (miComentario?.texto ? 'Actualizar Comentario' : 'Publicar Comentario')}
                  </button>
                </form>
              )}

              {isAuthenticated() && !yaCalifique && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: 24,
                  borderRadius: '12px',
                  marginBottom: 32,
                  border: '2px solid #fbbf24',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '16px', color: '#92400e' }}>
                    💡 Califica el juego primero para poder comentar
                  </p>
                </div>
              )}

              {/* Lista de comentarios */}
              {loadingComments && <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando comentarios...</p>}
              
              {!loadingComments && comentarios.filter(c => c.texto && c.texto.trim()).length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 60,
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ color: '#9ca3af', fontSize: '18px', margin: 0 }}>
                    No hay comentarios aún. ¡Sé el primero en compartir tu opinión!
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {!loadingComments && comentarios
                  .filter(c => c.texto && c.texto.trim())
                  .map((comentario) => (
                    <div 
                      key={comentario.id} 
                      style={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: 28,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 16
                      }}>
                        <div>
                          <strong style={{ fontSize: '20px', color: '#111827' }}>
                            {comentario.User?.nombre || 'Usuario'}
                          </strong>
                          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0' }}>
                            {new Date(comentario.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: '13px', color: '#6b7280', marginRight: 8 }}>Calidad</span>
                            {renderStars(comentario.calidad, 18)}
                            <span style={{ fontSize: '14px', marginLeft: 8, fontWeight: '600', color: '#374151' }}>
                              {comentario.calidad}/5
                            </span>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: '13px', color: '#6b7280', marginRight: 8 }}>Dificultad</span>
                            {renderStars(comentario.dificultad, 18)}
                            <span style={{ fontSize: '14px', marginLeft: 8, fontWeight: '600', color: '#374151' }}>
                              {comentario.dificultad}/5
                            </span>
                          </div>
                          {comentario.tiempoJuego > 0 && (
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              ⏱️ {formatearTiempo(comentario.tiempoJuego)}
                            </div>
                          )}
                        </div>
                      </div>

                      <p style={{ 
                        fontSize: '16px', 
                        lineHeight: 1.7,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        color: '#374151'
                      }}>
                        {comentario.texto}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}