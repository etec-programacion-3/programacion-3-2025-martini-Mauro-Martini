import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getJuegosByUserId, getImageUrl } from './api';
import JuegoGestionForm from './components/JuegoGestionForm'; 
import './App.css';

export default function MisJuegos() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);

  // Función para obtener los juegos del usuario autenticado
  const fetchMisJuegos = useCallback(async () => {
    // Si no hay usuario, salimos. La redirección ya se maneja en el useEffect.
    if (!user) return; 
    
    setLoading(true);
    setError(null);
    try {
      // LLAMADA A LA RUTA CORRECTA QUE YA DEBE FUNCIONAR EN EL BACKEND
      const juegosData = await getJuegosByUserId(user.id);
      setJuegos(juegosData);
    } catch (err) {
      setError(err.message || 'Error al cargar tus juegos.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Manejo de redirección y carga inicial
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated()) {
        navigate('/auth');
        return;
      }
      if (user) {
        fetchMisJuegos();
      }
    }
  }, [authLoading, isAuthenticated, navigate, user, fetchMisJuegos]);

  // Lógica para actualizar la lista después de editar
  const handleUpdateSuccess = (updatedJuego) => {
    setJuegos(juegos.map(j => (j.id === updatedJuego.id ? updatedJuego : j)));
    setJuegoSeleccionado(null);
  };

  // Lógica para actualizar la lista después de eliminar
  const handleDeleteSuccess = (deletedId) => {
    setJuegos(juegos.filter(j => j.id !== deletedId));
    setJuegoSeleccionado(null);
  };

  if (authLoading || loading || !user) {
    return <p style={{ textAlign: 'center', padding: 50, color: '#a1a1aa' }}>Cargando juegos de usuario...</p>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#18181b', 
      padding: '40px 20px', 
      color: 'white' 
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ 
          marginBottom: 40, 
          borderBottom: '2px solid #3f3f46', 
          paddingBottom: 10,
          color: '#f4f4f5'
        }}>
          🛠️ Mis Juegos Publicados
        </h1>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: 15, borderRadius: 8, marginBottom: 20 }}>
            ❌ {error}
          </div>
        )}

        {juegos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, backgroundColor: '#27272a', borderRadius: 16 }}>
            <p style={{ fontSize: '1.2em', color: '#a1a1aa' }}>Aún no has subido ningún juego.</p>
            <Link to="/subir" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>
              ¡Sube el primero ahora!
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {juegos.map((juego) => (
              <div key={juego.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: '#27272a', 
                padding: 15, 
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}>
                <img 
                  src={getImageUrl(juego.rutaImagen)} 
                  alt={juego.titulo} 
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 15 }} 
                />
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ margin: 0, color: '#f4f4f5' }}>
                    <Link to={`/juegos/${juego.id}`} style={{ color: '#f4f4f5', textDecoration: 'none' }}>
                      {juego.titulo}
                    </Link>
                  </h3>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: 14 }}>
                    Calidad Promedio: {juego.avgCalidad || 'Sin calificar'}
                  </p>
                </div>
                
                <button
                  onClick={() => setJuegoSeleccionado(juego)}
                  style={{ 
                    padding: '8px 15px', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 8, 
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginLeft: 15
                  }}
                >
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal/Panel de Gestión */}
      {juegoSeleccionado && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
        }}>
            {/* Aquí se asume que JuegoGestionForm maneja el cierre con el botón/lógica interna */}
            <JuegoGestionForm
                juego={juegoSeleccionado}
                onUpdate={handleUpdateSuccess}
                onDelete={handleDeleteSuccess}
                onClose={() => setJuegoSeleccionado(null)}
            />
        </div>
      )}
    </div>
  );
}