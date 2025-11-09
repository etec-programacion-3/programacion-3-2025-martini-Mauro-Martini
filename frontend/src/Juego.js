import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getJuego, 
  getCommentsByGame, 
  createComment, 
  updateComment,
  updateGameStats // <-- IMPORTACIÓN AÑADIDA
} from './api';
import { useAuth } from './context/AuthContext';
import { getJuegoUrl } from './utils'; // Importa helpers
import JuegoInfo from './components/JuegoInfo'; 
import CalificacionPanel from './components/CalificacionPanel'; 
import ComentarioForm from './components/ComentarioForm'; 
import ComentarioItem from './components/ComentarioItem'; 
import './App.css';

// Componente de mensaje de error temporal (Toast/Floating Error)
const ErrorMessage = ({ message, setError }) => {
    useEffect(() => {
        if (message) {
            // Borra el error después de 5s
            const timer = setTimeout(() => setError(null), 5000); 
            return () => clearTimeout(timer);
        }
    }, [message, setError]);

    if (!message) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fee2e2', // Rojo claro para error
            color: '#991b1b', // Texto rojo oscuro
            padding: '12px 24px',
            borderRadius: 8,
            boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
            zIndex: 1000,
            fontSize: '16px',
            fontWeight: '600'
        }}>
            ❌ {message}
        </div>
    );
};

export default function Juego() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [juego, setJuego] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState(null); // Estado para errores de operación (toast)
  const [loadingError, setLoadingError] = useState(null); // Estado para errores de carga inicial
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Estados para calificación y comentario
  const [miCalificacion, setMiCalificacion] = useState({
    calidad: 0,
    dificultad: 0
  });
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mostrarFormCalificacion, setMostrarFormCalificacion] = useState(false);

  // --- Funciones de Carga y Actualización ---
  const fetchJuego = useCallback(async () => {
    try {
      const juegoData = await getJuego(id);
      setJuego(juegoData);
    } catch (err) {
      setLoadingError(err.message); // Usar loadingError para la carga inicial
    }
  }, [id]);

  const fetchComentarios = useCallback(async () => {
    try {
      const comments = await getCommentsByGame(id);
      setComentarios(comments);
      
      if (user) {
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
    }
  }, [id, user]);

  // Cargar juego inicial
  useEffect(() => {
    setLoading(true);
    fetchJuego().finally(() => setLoading(false));
  }, [fetchJuego]);

  // Cargar comentarios inicial
  useEffect(() => {
    setLoadingComments(true);
    fetchComentarios().finally(() => setLoadingComments(false));
  }, [fetchComentarios]);

  // --- [NUEVO] Efecto para rastrear el tiempo de juego ---
  useEffect(() => {
    // Solo rastrear si el usuario está autenticado y tenemos su ID y el ID del juego
    if (!isAuthenticated() || !user?.id || !id) {
      return;
    }

    // Definimos el intervalo. 30 segundos es un buen balance.
    const INTERVAL_MS = 30000; // 30 segundos
    
    // Calculamos cuántas horas son 30 segundos
    // (30 * 1000) ms / (1000 * 60 * 60) ms/hora = 0.00833 horas
    const HOURS_PER_INTERVAL = INTERVAL_MS / 3600000;

    // console.log(`Iniciando rastreo de tiempo. Enviando ${HOURS_PER_INTERVAL} horas cada ${INTERVAL_MS}ms`);

    // Creamos un intervalo que se ejecute cada 30 segundos
    const intervalId = setInterval(() => {
      // console.log(`Enviando stats: User ${user.id}, Game ${id}, Horas ${HOURS_PER_INTERVAL}`);
      
      // Llamamos a la API con el *incremento* de tiempo.
      // El backend debería sumar este valor al total existente.
      // Es 'fire-and-forget', no necesitamos esperar la respuesta.
      updateGameStats(id, user.id, HOURS_PER_INTERVAL)
        .catch(err => {
          // La función updateGameStats ya maneja el log, 
          // pero capturamos por si acaso.
          console.error("Error en el intervalo de envío de stats:", err);
        });

    }, INTERVAL_MS); 

    // Función de limpieza:
    // Esto es CRUCIAL. Se ejecuta cuando el usuario sale de la página (el componente se desmonta).
    // Detiene el intervalo para que no siga intentando enviar datos.
    return () => {
      // console.log("Deteniendo rastreo de tiempo.");
      clearInterval(intervalId);
    };

    // Este efecto depende de que el usuario esté logueado y el ID del juego esté disponible
  }, [isAuthenticated, user, id]);
  // --- Fin del nuevo efecto ---

  // Refresca tanto el juego como los comentarios después de una acción de guardado
  const refreshData = async () => {
    await fetchComentarios();
    await fetchJuego();
  };

  // Guardar/actualizar calificación
  const handleGuardarCalificacion = async () => {
    if (!isAuthenticated()) {
      setError('Debes iniciar sesión para calificar'); 
      navigate('/auth');
      return;
    }

    if (miCalificacion.calidad === 0 || miCalificacion.dificultad === 0) {
      setError('Por favor selecciona calidad y dificultad'); 
      return;
    }

    setSubmitting(true);
    try {
      const comentarioExistente = comentarios.find(c => c.userId === user.id);
      
      const datosComentario = {
        userId: user.id,
        gameId: parseInt(id),
        calidad: parseInt(miCalificacion.calidad),
        dificultad: parseInt(miCalificacion.dificultad),
        texto: comentarioExistente ? comentarioExistente.texto : '' 
      };
      
      if (comentarioExistente) {
        await updateComment(comentarioExistente.id, datosComentario);
      } else {
        await createComment(datosComentario);
      }

      await refreshData();
      setMostrarFormCalificacion(false);
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error al guardar calificación: ' + (err.message || 'Desconocido')); 
    } finally {
      setSubmitting(false);
    }
  };

  // Enviar comentario
  const handleSubmitComentario = async (texto) => {
    if (!isAuthenticated()) {
      setError('Debes iniciar sesión para comentar'); 
      navigate('/auth');
      return;
    }

    if (!texto.trim()) {
      setError('Por favor escribe un comentario'); 
      return;
    }

    const comentarioExistente = comentarios.find(c => c.userId === user.id);
    if (!comentarioExistente && (miCalificacion.calidad === 0 || miCalificacion.dificultad === 0)) {
        setError('Debes calificar el juego antes de comentar'); 
        return;
    }

    setSubmitting(true);
    try {
      const datosComentario = {
        userId: user.id,
        gameId: parseInt(id),
        calidad: parseInt(miCalificacion.calidad),
        dificultad: parseInt(miCalificacion.dificultad),
        texto: texto
      };
      
      if (comentarioExistente) {
        await updateComment(comentarioExistente.id, datosComentario); 
      } else {
        await createComment(datosComentario);
      }

      await refreshData();
      setNuevoComentario('');
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error al publicar comentario: ' + (err.message || 'Desconocido')); 
    } finally {
      setSubmitting(false);
    }
  };

  const miComentario = comentarios.find(c => c.userId === user?.id);
  const yaCalifique = miCalificacion.calidad > 0 && miCalificacion.dificultad > 0;
  const comentariosFiltrados = comentarios.filter(c => c.texto && c.texto.trim());

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#18181b', // Fondo principal oscuro
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
            backgroundColor: '#27272a', // Botón oscuro
            border: '2px solid #52525b', // Borde gris
            borderRadius: '12px',
            fontWeight: '600',
            color: '#f4f4f5', // Texto claro
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#3f3f46';
            e.currentTarget.style.borderColor = '#a1a1aa';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.borderColor = '#52525b';
          }}
        >
          ← Volver
        </button>

        {loading && <p style={{ textAlign: 'center', fontSize: '18px', color: '#a1a1aa' }}>Cargando juego...</p>}
        {loadingError && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '18px' }}>{loadingError}</p>}
        
        {juego && (
          <>
            {/* Título */}
            <h1 style={{ 
              textAlign: 'center', 
              marginBottom: 16, 
              fontSize: '3em',
              color: '#f4f4f5',
              fontWeight: '800'
            }}>
              {juego.titulo}
            </h1>

            <p style={{ 
              textAlign: 'center', 
              color: '#a1a1aa', // Texto secundario
              fontSize: '18px',
              marginBottom: 32,
              fontStyle: 'italic'
            }}>
              por {juego.User?.nombre}
            </p>

            {/* Juego Iframe */}
            {juego.rutaCarpetaJuego && (
              <div style={{ 
                marginBottom: 32,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.18)'
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
              <JuegoInfo juego={juego} />

              <CalificacionPanel 
                isAuthenticated={isAuthenticated}
                navigate={navigate}
                miCalificacion={miCalificacion}
                setMiCalificacion={setMiCalificacion}
                yaCalifique={yaCalifique}
                mostrarForm={mostrarFormCalificacion}
                setMostrarForm={setMostrarFormCalificacion}
                handleGuardar={handleGuardarCalificacion}
                submitting={submitting}
              />
            </div>

            {/* Sección de comentarios */}
            <div style={{ marginTop: 48 }}>
              <h2 style={{ 
                marginBottom: 32, 
                fontSize: '2em',
                color: '#f4f4f5',
                fontWeight: '700'
              }}>
                💬 Comentarios ({comentariosFiltrados.length})
              </h2>

              <ComentarioForm
                isAuthenticated={isAuthenticated}
                yaCalifique={yaCalifique}
                miComentario={miComentario}
                submitting={submitting}
                nuevoComentario={nuevoComentario}
                setNuevoComentario={setNuevoComentario}
                handleSubmit={handleSubmitComentario}
              />

              {/* Lista de comentarios */}
              {loadingComments && <p style={{ textAlign: 'center', color: '#a1a1aa' }}>Cargando comentarios...</p>}
              
              {!loadingComments && comentariosFiltrados.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 60,
                  backgroundColor: '#27272a', // Fondo oscuro
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                }}>
                  <p style={{ color: '#a1a1aa', fontSize: '18px', margin: 0 }}>
                    No hay comentarios aún. ¡Sé el primero en compartir tu opinión!
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {!loadingComments && comentariosFiltrados
                  .map((comentario) => (
                    <ComentarioItem key={comentario.id} comentario={comentario} />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
      {/* Muestra errores de operación como un toast */}
      <ErrorMessage message={error} setError={setError} /> 
    </div>
  );
}