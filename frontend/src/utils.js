import React from 'react';
import Estrella from './components/Estrella'; // Importar el componente de estrella

export const API_BASE = 'http://localhost:3000';

// Helper para obtener URL del juego
export const getJuegoUrl = (rutaCarpetaJuego) => {
  if (!rutaCarpetaJuego) return null;
  // Asegurar la barra al final para que el iframe cargue el index.html
  const rutaNormalizada = rutaCarpetaJuego.endsWith('/') ? rutaCarpetaJuego : `${rutaCarpetaJuego}/`;
  return `${API_BASE}/juegos-ejecutables/${rutaNormalizada}index.html`;
};

// Redondear a 0.5
export const roundToHalf = (num) => {
  return Math.round(num * 2) / 2;
};

// Renderizar estrellas (lectura)
export const renderStars = (rating, size = 20) => {
  const rounded = roundToHalf(rating);
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push(<Estrella key={i} filled size={size} />);
    } else if (i === Math.ceil(rounded) && rounded % 1 !== 0) {
      stars.push(<Estrella key={i} half size={size} />);
    } else {
      stars.push(<Estrella key={i} filled={false} size={size} />);
    }
  }
  
  return <span style={{ display: 'inline-flex', gap: 2 }}>{stars}</span>;
};

// Convertir horas a formato legible
export const formatearTiempo = (horas) => {
  if (horas === 0) return '0 horas';
  if (horas < 1) return `${Math.round(horas * 60)} minutos`;
  const horasEnteras = Math.floor(horas);
  const minutos = Math.round((horas - horasEnteras) * 60);
  const horasStr = horasEnteras > 0 ? `${horasEnteras}h` : '';
  const minutosStr = minutos > 0 ? `${minutos}m` : '';
  return `${horasStr} ${minutosStr}`.trim();
};