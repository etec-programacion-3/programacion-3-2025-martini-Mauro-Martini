import React, { useState, useEffect } from 'react';
import { getJuegos, getImageUrl } from './api';
import { Link, Route, Routes } from 'react-router-dom';
import Juego from './Juego';
import Auth from './Auth';
import Navbar from './Navbar';
import './App.css';

// Componente de estrella SVG
const Star = ({ filled, half, size = 16 }) => (
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
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#half-${size})`}
          stroke="#fbbf24"
          strokeWidth="1"
        />
      </>
    ) : (
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#fbbf24' : '#e5e7eb'}
        stroke="#fbbf24"
        strokeWidth="1"
      />
    )}
  </svg>
);

// Redondear a 0.5
const roundToHalf = (num) => {
  return Math.round(num * 2) / 2;
};

// Renderizar estrellas
const renderStars = (rating, size = 16) => {
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
      backgroundColor: '#f9fafb',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ 
            fontSize: '3em', 
            marginBottom: 12,
            color: '#111827',
            fontWeight: '800'
          }}>
            Descubre Juegos Increíbles
          </h1>
          <p style={{ 
            fontSize: '1.2em', 
            color: '#6b7280',
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
              animation: 'spin 2s linear infinite'
            }}>
              🎮
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Cargando juegos...</p>
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
                    backgroundColor: '#e5e7eb'
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
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px 12px 0 0',
                    fontSize: '48px'
                  }}>
                    🎮
                  </div>
                )}
                
                <div style={{ padding: 20 }}>
                  <h2 style={{ 
                    fontSize: '1.5em',
                    marginBottom: 12,
                    color: '#111827',
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
                        color: '#6b7280',
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
                            color: '#374151'
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
                        color: '#6b7280',
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
                            color: '#374151'
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
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>👤</span>
                      {juego.User.nombre}
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
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: 16 }}>🎮</div>
            <h2 style={{ color: '#374151', marginBottom: 8 }}>
              No hay juegos disponibles
            </h2>
            <p style={{ color: '#6b7280' }}>
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
      </Routes>
    </>
  );
}