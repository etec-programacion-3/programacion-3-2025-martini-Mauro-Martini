import React, { useState, useEffect } from 'react';
import { getJuegos, getImageUrl } from './api';
import { Link, Route, Routes } from 'react-router-dom';
import Juego from './Juego';
import Auth from './Auth';
import Navbar from './Navbar';
import SubirJuego from './SubirJuego'; 
import { renderStars, roundToHalf } from './utils';
import './App.css';
import MisJuegos from './MisJuegos';

function ListaDeJuegos() {
  const [juegos, setJuegos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJuegos() {
      setError(null);
      setLoading(true);
      try {
        const juegosData = await getJuegos();
        setJuegos(juegosData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJuegos();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#18181b', // Fondo principal oscuro
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ 
            fontSize: '3em', 
            marginBottom: 12,
            color: 'white', // Título Blanco
            fontWeight: '800'
          }}>
            Descubre Juegos Increíbles
          </h1>
          <p style={{ 
            fontSize: '1.2em', 
            color: '#9ca3af', // Subtítulo Gris
            maxWidth: 600,
            margin: '0 auto'
          }}>
            Explora nuestra colección de juegos creados por la comunidad
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: 16,
              animation: 'spin 2s linear infinite',
              color: '#ef4444' // Ícono de carga rojo
            }}>
              🎮
            </div>
            <p style={{ fontSize: '18px', color: '#9ca3af' }}>Cargando juegos...</p>
          </div>
        )}
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            padding: 20,
            borderRadius: 12,
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <p style={{ color: '#991b1b', fontSize: '16px', margin: 0 }}>
              ❌ {error}
            </p>
          </div>
        )}
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {juegos.map((juego) => (
            <Link 
              key={juego.id} 
              to={`/juegos/${juego.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="juego-card-modern">
                {juego.rutaImagen ? (
                  <div style={{
                    width: '100%',
                    height: 200,
                    overflow: 'hidden',
                    borderRadius: '12px 12px 0 0',
                    backgroundColor: '#3f3f46' // Fondo de imagen oscuro
                  }}>
                    <img 
                      src={getImageUrl(juego.rutaImagen)} 
                      alt={juego.titulo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: 200,
                    backgroundColor: '#3f3f46', // Fondo de ícono oscuro
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px 12px 0 0',
                    fontSize: '48px',
                    color: '#9ca3af'
                  }}>
                    🎮
                  </div>
                )}
                
                <div style={{ padding: 20 }}>
                  <h2 style={{ 
                    fontSize: '1.5em',
                    marginBottom: 12,
                    color: 'white', // Título de la tarjeta blanco
                    fontWeight: '700'
                  }}>
                    {juego.titulo}
                  </h2>
                  
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#9ca3af', // Etiqueta gris
                        minWidth: 70
                      }}>
                        Calidad:
                      </span>
                      {juego.avgCalidad ? (
                        <>
                          {renderStars(juego.avgCalidad, 18)}
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '600',
                            color: 'white' // Puntaje blanco
                          }}>
                            {roundToHalf(juego.avgCalidad)}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                          Sin calificar
                        </span>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#9ca3af', // Etiqueta gris
                        minWidth: 70
                      }}>
                        Dificultad:
                      </span>
                      {juego.avgDificultad ? (
                        <>
                          {renderStars(juego.avgDificultad, 18)}
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '600',
                            color: 'white' // Puntaje blanco
                          }}>
                            {roundToHalf(juego.avgDificultad)}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                          Sin calificar
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    paddingTop: 16,
                    borderTop: '1px solid #4b5563' // Separador gris
                  }}>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#9ca3af', // Autor gris
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{ color: 'white' }}>👤</span>
                      {juego.User?.nombre || '(Deleted User)'} {/* <-- CORRECCIÓN APLICADA AQUÍ */}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && juegos.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            padding: 80,
            backgroundColor: '#27272a', // Fondo de mensaje gris oscuro
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: 16, color: '#ef4444' }}>🎮</div>
            <h2 style={{ color: 'white', marginBottom: 8 }}>
              No hay juegos disponibles
            </h2>
            <p style={{ color: '#9ca3af' }}>
              Sé el primero en subir un juego
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ListaDeJuegos />} />
        <Route path="/juegos/:id" element={<Juego />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/subir" element={<SubirJuego />} /> 
        <Route path="/mis-juegos" element={<MisJuegos />} /> {/* <-- NUEVA RUTA */}
      </Routes>
    </>
  );
}