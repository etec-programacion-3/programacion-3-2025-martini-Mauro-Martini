import React from 'react';
import { renderStars, formatearTiempo } from '../utils';

export default function ComentarioItem({ comentario }) {
  return (
    <div 
      key={comentario.id} 
      style={{
        backgroundColor: '#1f2937', // Fondo Gris Oscuro
        border: '2px solid #4b5563', // Borde Gris
        borderRadius: '16px',
        padding: 28,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <strong style={{ fontSize: '20px', color: 'white' }}>
            {comentario.User?.nombre || 'Usuario'}
          </strong>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0' }}>
            {new Date(comentario.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          {/* Calidad */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', marginRight: 8 }}>Calidad</span>
            {renderStars(comentario.calidad, 18)}
            <span style={{ fontSize: '14px', marginLeft: 8, fontWeight: '600', color: 'white' }}>
              {comentario.calidad}/5
            </span>
          </div>
          {/* Dificultad */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', marginRight: 8 }}>Dificultad</span>
            {renderStars(comentario.dificultad, 18)}
            <span style={{ fontSize: '14px', marginLeft: 8, fontWeight: '600', color: 'white' }}>
              {comentario.dificultad}/5
            </span>
          </div>
          {/* Tiempo de juego */}
          {comentario.tiempoJuego > 0 && (
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
              ⏱️ {formatearTiempo(comentario.tiempoJuego)}
            </div>
          )}
        </div>
      </div>

      <p style={{ 
        fontSize: '16px', 
        lineHeight: 1.7,
        margin: 0,
        whiteSpace: 'pre-wrap',
        color: 'white'
      }}>
        {comentario.texto}
      </p>
    </div>
  );
}