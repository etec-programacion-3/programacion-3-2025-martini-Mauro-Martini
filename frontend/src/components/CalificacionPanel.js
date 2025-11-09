import React from 'react';
import StarRating from './StarRating';
import { renderStars } from '../utils';

export default function CalificacionPanel({
  isAuthenticated,
  navigate,
  miCalificacion,
  setMiCalificacion,
  yaCalifique,
  mostrarForm,
  setMostrarForm,
  handleGuardar,
  submitting
}) {
  return (
    <div style={{ 
      backgroundColor: '#1f2937', // Fondo Gris Oscuro
      padding: 32, 
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      border: yaCalifique ? '2px solid #ef4444' : '2px solid #4b5563' // Borde Rojo para calificado
    }}>
      <h2 style={{ 
        fontSize: '1.5em', 
        marginBottom: 16,
        color: 'white', // Texto Blanco
        fontWeight: '700'
      }}>
        {yaCalifique ? '✓ Tu Calificación' : 'Califica este juego'}
      </h2>

      {!isAuthenticated() ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ marginBottom: 16, color: '#9ca3af' }}>
            Inicia sesión para calificar
          </p>
          <button
            onClick={() => navigate('/auth')}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              backgroundColor: '#ef4444', // Botón Rojo
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      ) : !mostrarForm && yaCalifique ? (
        <div>
          {/* Muestra calificación actual */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: 8 }}>Calidad</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {renderStars(miCalificacion.calidad, 24)}
              <span style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                {miCalificacion.calidad}/5
              </span>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: 8 }}>Dificultad</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {renderStars(miCalificacion.dificultad, 24)}
              <span style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                {miCalificacion.dificultad}/5
              </span>
            </div>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#ef4444', // Botón Rojo
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Modificar Calificación
          </button>
        </div>
      ) : (
        <div>
          {/* Formulario de calificación */}
          {/* Nota: StarRating usa #1f2937 como color de label. */}
          <StarRating 
            value={miCalificacion.calidad}
            onChange={(val) => setMiCalificacion({...miCalificacion, calidad: val})}
            label="Calidad"
          />
          <StarRating 
            value={miCalificacion.dificultad}
            onChange={(val) => setMiCalificacion({...miCalificacion, dificultad: val})}
            label="Dificultad"
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleGuardar}
              disabled={submitting || miCalificacion.calidad === 0 || miCalificacion.dificultad === 0}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                backgroundColor: submitting ? '#4b5563' : '#ef4444', // Botón Rojo
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {submitting ? 'Guardando...' : (yaCalifique ? 'Actualizar' : 'Guardar Calificación')}
            </button>
            {mostrarForm && (
              <button
                onClick={() => setMostrarForm(false)}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  backgroundColor: '#4b5563', // Botón Cancelar Gris Oscuro
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}