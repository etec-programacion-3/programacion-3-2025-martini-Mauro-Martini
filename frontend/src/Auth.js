import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { login as apiLogin, register as apiRegister } from './api';
import './App.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    contraseña: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // Login
        response = await apiLogin({
          email: formData.email,
          contraseña: formData.contraseña
        });
      } else {
        // Registro
        if (!formData.nombre) {
          setError('El nombre es requerido');
          setLoading(false);
          return;
        }
        response = await apiRegister({
          email: formData.email,
          nombre: formData.nombre,
          contraseña: formData.contraseña
        });
      }

      // Guardar token y usuario en context
      login(response.token, response.user);
      
      // Redirigir a home
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: 32 }}>
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: 12,
            borderRadius: 4,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Nombre de usuario:
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: 12,
                  fontSize: 16,
                  border: '1px solid #ccc',
                  borderRadius: 4
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={formData.contraseña}
              onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div style={{ 
          marginTop: 24, 
          textAlign: 'center',
          paddingTop: 24,
          borderTop: '1px solid #eee'
        }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', nombre: '', contraseña: '' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              cursor: 'pointer',
              fontSize: 14,
              textDecoration: 'underline'
            }}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        <div style={{ 
          marginTop: 16, 
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            ← Continuar sin iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}