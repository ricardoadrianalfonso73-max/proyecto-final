import React from 'react';
import { Navigate } from 'react-router-dom';

const h = React.createElement;

/**
 * Protege rutas de administración.
 * Si no hay token en sessionStorage, redirige a /login.
 */
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('adminToken');

  if (!token) {
    return h(Navigate, { to: '/login', replace: true });
  }

  return children;
}

export default ProtectedRoute;
