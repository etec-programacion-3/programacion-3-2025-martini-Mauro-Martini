import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('=== CARGANDO AUTH DESDE LOCALSTORAGE ===');
      console.log('Token almacenado:', storedToken);
      console.log('User almacenado:', storedUser);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('Auth cargado exitosamente:', parsedUser);
      } else {
        console.log('No hay datos de autenticación en localStorage');
      }
    } catch (error) {
      console.error('Error al cargar auth desde localStorage:', error);
      // Si hay error, limpiar todo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login - ASEGURAR QUE SE GUARDA CORRECTAMENTE
  const login = (newToken, userData) => {
    console.log('=== LOGIN ===');
    console.log('Token recibido:', newToken);
    console.log('Usuario recibido:', userData);
    
    // Guardar en localStorage como strings limpios
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Actualizar estado
    setToken(newToken);
    setUser(userData);
    
    // Verificar que se guardó correctamente
    console.log('Token guardado:', localStorage.getItem('token'));
    console.log('User guardado:', localStorage.getItem('user'));
    console.log('=============');
  };

  // Logout
  const logout = () => {
    console.log('=== LOGOUT ===');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log('Sesión cerrada');
  };

  // Verificar si está autenticado
  const isAuthenticated = () => {
    const authenticated = !!token && !!user;
    console.log('¿Autenticado?', authenticated, { token: !!token, user: !!user });
    return authenticated;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};