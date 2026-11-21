import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    const savedUsuario = sessionStorage.getItem('adminUsuario');

    if (savedToken && savedUsuario) {
      try {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUsuario));
      } catch {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUsuario');
      }
    }
    setLoading(false);
  }, []);

  function login(nuevoToken, nuevoUsuario) {
    sessionStorage.setItem('adminToken', nuevoToken);
    sessionStorage.setItem('adminUsuario', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }

  function logout() {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsuario');
    setToken(null);
    setUsuario(null);
  }

  const value = {
    usuario,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    logout
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;
