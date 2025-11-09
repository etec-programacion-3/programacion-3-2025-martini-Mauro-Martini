import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AccountPanel from './AccountPanel'; 
import './App.css'; 

export default function Navbar() {
  // IMPORTAR 'loading' como 'authLoading' para evitar conflicto de nombres
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();
  // Estado para el panel lateral de la cuenta
  const [showAccountPanel, setShowAccountPanel] = useState(false); 
  
  const navItemStyle = {
    color: '#a1a1aa', 
    textDecoration: 'none', 
    padding: '8px 12px',
    borderRadius: 8,
    transition: 'background-color 0.2s'
  };

  const navItemHover = {
    backgroundColor: '#3f3f46',
    color: 'white' // Asegurar que el color del texto sea claro en hover
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none'
  };

  return (
    <nav style={{
      backgroundColor: '#27272a', // Fondo de Navbar oscuro
      padding: '16px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative', 
      zIndex: 100 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#ef4444', fontSize: '1.5em', fontWeight: 'bold' }}>
          🎮 GameHub
        </Link>
        <Link to="/" style={navItemStyle} onMouseOver={(e) => Object.assign(e.currentTarget.style, navItemHover)} onMouseOut={(e) => Object.assign(e.currentTarget.style, navItemStyle)}>
            Explorar
        </Link>
        
        {/* BOTONES DE GESTIÓN (Mis Juegos y Subir Juego) */}
        {isAuthenticated() && (
          <>
            {/* BOTÓN MIS JUEGOS (NUEVA POSICIÓN) */}
            <Link 
              to="/mis-juegos" 
              style={navItemStyle}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, navItemHover)} 
              onMouseOut={(e) => Object.assign(e.currentTarget.style, navItemStyle)}
            >
              🛠️ Mis Juegos
            </Link>

            {/* BOTÓN SUBIR JUEGO */}
            <Link 
              to="/subir" 
              style={{
                ...navItemStyle, 
                backgroundColor: '#ef4444', 
                color: 'white', 
                fontWeight: '600',
                padding: '8px 16px'
              }} 
              onMouseOver={(e) => Object.assign(e.currentTarget.style, {...navItemHover, backgroundColor: '#dc2626'})} 
              onMouseOut={(e) => Object.assign(e.currentTarget.style, {...navItemStyle, backgroundColor: '#ef4444', color: 'white'})}
            >
              ⬆️ Subir Juego
            </Link>
          </>
        )}
      </div>

      <div>
        {/* COMPROBACIÓN DE CARGA AÑADIDA */}
        {authLoading ? ( 
            <div style={{ color: '#a1a1aa', padding: '10px 20px' }}>Cargando...</div>
        ) : isAuthenticated() ? (
          // BOTÓN DE CUENTA (Solo si isAuthenticated es true y user no es null)
          <button
            onClick={() => setShowAccountPanel(!showAccountPanel)}
            style={{
                backgroundColor: '#ef4444', 
                color: 'white',
                padding: '10px 15px',
                borderRadius: 8,
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 101
            }}
          >
            <span style={{ fontSize: 18 }}>👤</span>
            {user?.nombre} 
          </button>
        ) : (
          // BOTÓN DE INICIAR SESIÓN (Si no está autenticado y no está cargando)
          <Link to="/auth">
            <button
              style={{
                ...buttonStyle,
                backgroundColor: '#ef4444', 
                color: 'white',
              }}
            >
              Iniciar Sesión
            </button>
          </Link>
        )}
      </div>
      
      {/* RENDERIZAR PANEL LATERAL */}
      {isAuthenticated() && (
          <AccountPanel 
            isOpen={showAccountPanel} 
            onClose={() => setShowAccountPanel(false)} 
          />
      )}
    </nav>
  );
}