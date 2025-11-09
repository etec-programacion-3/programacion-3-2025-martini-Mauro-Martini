import React from 'react';

export default function ComentarioForm({
  isAuthenticated,
  yaCalifique,
  miComentario,
  submitting,
  nuevoComentario,
  setNuevoComentario,
  handleSubmit
}) {
  // Manejador local para limpiar el código de Juego.js
  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(nuevoComentario);
  };
    
  if (!isAuthenticated()) return null;

  if (!yaCalifique) {
    return (
      <div style={{
        backgroundColor: '#fee2e2', // Fondo Rojo muy claro
        padding: 24,
        borderRadius: '12px',
        marginBottom: 32,
        border: '2px solid #ef4444', // Borde Rojo
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '16px', color: '#991b1b' }}>
          💡 Califica el juego primero para poder comentar
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{
      backgroundColor: '#1f2937', // Fondo Gris Oscuro (contenedor)
      padding: 32,
      borderRadius: '16px',
      marginBottom: 32,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 20, color: 'white' }}>
        {miComentario?.texto ? 'Actualiza tu comentario' : 'Comparte tu opinión'}
      </h3>
      
      <textarea 
        value={nuevoComentario}
        onChange={(e) => setNuevoComentario(e.target.value)}
        placeholder="¿Qué te pareció el juego? Comparte tu experiencia..."
        style={{
          width: '100%',
          minHeight: 120,
          padding: 16,
          fontSize: '16px',
          borderRadius: '12px',
          border: '2px solid #4b5563', // Borde Gris
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          backgroundColor: '#374151', // ¡Fondo Gris Oscuro MÁS CLARO para compensar!
          color: 'white' // ¡Texto Blanco al escribir!
        }}
        required
      />

      <button 
        type="submit"
        disabled={submitting}
        style={{
          marginTop: 16,
          padding: '14px 32px',
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
        {submitting ? 'Publicando...' : (miComentario?.texto ? 'Actualizar Comentario' : 'Publicar Comentario')}
      </button>
    </form>
  );
}