
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import Products from './pages/Products.js';
import TechnicalService from './pages/TechnicalService.js';
import Contact from './pages/Contact.js';
import Admin from './pages/Admin.js';
import Login from './pages/Login.js';
import Registro from './pages/Registro.js';
import MiCuenta from './pages/MiCuenta.js';
import ProtectedRoute from './components/ProtectedRoute.js';

const h = React.createElement;

function Placeholder({ title }) {
  return h('main', { className: 'placeholder-page' },
    h('h1', null, title),
    h('p', null, 'Esta sección será desarrollada en la próxima etapa.')
  );
}

function Layout() {
  return h(React.Fragment, null,
    h(Header),
    h(Routes, null,

      h(Route, {
        path: '/',
        element: h(Home)
      }),

      h(Route, {
        path: '/productos',
        element: h(Products)
      }),

      h(Route, {
        path: '/servicio-tecnico',
        element: h(TechnicalService)
      }),

      h(Route, {
        path: '/contacto',
        element: h(Contact)
      }),

      h(Route, {
        path: '/login',
        element: h(Login)
      }),

      h(Route, {
        path: '/registro',
        element: h(Registro)
      }),

      // CUENTA DEL CLIENTE
      h(Route, {
        path: '/mi-cuenta',
        element: h(MiCuenta)
      }),

      // PANEL DE ADMINISTRACIÓN (SIN CAMBIOS)
      h(Route, {
        path: '/admin',
        element: h(ProtectedRoute, null, h(Admin))
      }),

      h(Route, {
        path: '*',
        element: h(Placeholder, {
          title: 'PÁGINA NO ENCONTRADA'
        })
      })
    ),
    h(Footer)
  );
}

function App() {
  return h(
    BrowserRouter,
    null,
    h(Layout)
  );
}

export default App;
