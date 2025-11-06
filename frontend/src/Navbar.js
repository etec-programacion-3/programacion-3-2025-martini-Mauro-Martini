import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: '#333',
      color: 'white',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Link to="/" style={{ 
        color: 'white', 
        textDecoration: 'none', 
        fontSize: '24px', 
        fontWeight: 'bold' 
      }}>
        🎮 GameHub
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Juegos
        </Link>

        {isAuthenticated() ? (
          <>
            <Link to="/subir-juego" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              borderRadius: 4
            }}>
              + Subir Juego
            </Link>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              borderLeft: '1px solid #555',
              paddingLeft: 24
            }}>
              <span>👤 {user?.nombre}</span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </>
        ) : (
          <Link to="/auth" style={{ 
            color: 'white', 
            textDecoration: 'none',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            borderRadius: 4
          }}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}