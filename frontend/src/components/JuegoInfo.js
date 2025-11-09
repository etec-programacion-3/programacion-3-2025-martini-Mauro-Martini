import React from 'react';
import { roundToHalf, renderStars } from '../utils';

export default function JuegoInfo({ juego }) {
  return (
    <div style={{ 
      backgroundColor: '#0f172a', // Fondo Gris Muy Oscuro
      padding: 32, 
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ 
        fontSize: '1.5em', 
        marginBottom: 16,
        color: 'white',
        fontWeight: '700'
      }}>
        Sobre el juego
      </h2>
      <p style={{ 
        fontSize: '16px', 
        lineHeight: 1.6,
        color: '#e5e7eb', // Gris muy claro
        marginBottom: 24
      }}>
        {juego.descripcion || 'Sin descripción'}
      </p>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 16
      }}>
        {/* Calidad Promedio */}
        <div>
          <div style={{ 
            fontSize: '14px', 
            color: '#9ca3af', // Gris medio
            marginBottom: 4,
            fontWeight: '600'
          }}>
            Calidad Promedio
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {juego.avgCalidad ? (
              <>
                {renderStars(juego.avgCalidad, 24)}
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                  {roundToHalf(juego.avgCalidad)}/5
                </span>
              </>
            ) : (
              <span style={{ color: '#9ca3af' }}>Sin calificar</span>
            )}
          </div>
        </div>
        
        {/* Dificultad Promedio */}
        <div>
          <div style={{ 
            fontSize: '14px', 
            color: '#9ca3af',
            marginBottom: 4,
            fontWeight: '600'
          }}>
            Dificultad Promedio
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {juego.avgDificultad ? (
              <>
                {renderStars(juego.avgDificultad, 24)}
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                  {roundToHalf(juego.avgDificultad)}/5
                </span>
              </>
            ) : (
              <span style={{ color: '#9ca3af' }}>Sin calificar</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}