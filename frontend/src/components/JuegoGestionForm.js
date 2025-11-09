import React, { useState } from 'react';
import Modal from './Modal';
// Asegúrate de importar las funciones de API de la ruta correcta
import { updateJuego, deleteJuego, getImageUrl } from '../api'; 

// Este componente es el formulario que se muestra dentro del Modal
export default function JuegoGestionForm({ juego, onUpdate, onDelete, onClose }) {
  // Estado local para manejar los campos del formulario
  const [formData, setFormData] = useState({
    titulo: juego.titulo,
    descripcion: juego.descripcion,
    archivoJuego: null,
    imagenPortada: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Manejador para actualizar el estado cuando el usuario escribe o sube archivos
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Si es un archivo, usa 'files[0]', si es texto, usa 'value'
      [name]: files ? files[0] : value,
    }));
  };

  // Manejador para el envío del formulario (Guardar Cambios)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Crear el FormData
      // FormData es necesario porque estamos enviando archivos (multipart/form-data)
      const data = new FormData();
      
      // 2. Adjuntar los campos de TEXTO (¡Esto es lo que faltaba!)
      // Usamos el estado 'formData' que se actualizó con handleChange
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);

      // 3. Adjuntar ARCHIVOS solo si el usuario seleccionó uno nuevo
      if (formData.archivoJuego) {
        data.append('archivo', formData.archivoJuego);
      }
      if (formData.imagenPortada) {
        data.append('imagen', formData.imagenPortada);
      }

      // 4. Llamar a la API
      const updatedJuego = await updateJuego(juego.id, data);
      
      onUpdate(updatedJuego); // Actualizar la lista en MisJuegos.js
      onClose(); // Cerrar el modal
    } catch (err) {
      setError(err.message || 'Error al actualizar el juego');
    } finally {
      setLoading(false);
    }
  };

  // Manejador para el botón de Eliminar (abre el modal de confirmación)
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteJuego(juego.id);
      onDelete(juego.id); // Actualizar la lista en MisJuegos.js
      onClose(); // Cerrar el modal
    } catch (err) {
      setError(err.message || 'Error al eliminar el juego');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Estilos (puedes personalizarlos)
  const inputStyle = {
    width: '100%',
    padding: 10,
    fontSize: 14,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#3f3f46',
    color: '#f4f4f5',
    border: '1px solid #52525b'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    marginTop: 10
  };

  return (
    <>
      <div style={{
        backgroundColor: '#1f2937', 
        padding: 30,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        width: '90%',
        maxWidth: 500,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: 'white', marginTop: 0 }}>Gestionar "{juego.titulo}"</h2>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 6, marginBottom: 15 }}>
            {error}
          </div>
        )}

        {/* Formulario de Actualización */}
        <form onSubmit={handleUpdate}>
          {/* Título */}
          <label style={{ display: 'block', marginBottom: 5, color: '#f4f4f5' }}>Título:</label>
          <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required style={inputStyle} />

          {/* Descripción */}
          <label style={{ display: 'block', marginBottom: 5, color: '#f4f4f5' }}>Descripción:</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows="3" style={{...inputStyle, resize: 'vertical'}} />

          {/* Archivo ZIP del Juego (Opcional) */}
          <label style={{ display: 'block', marginBottom: 5, color: '#f4f4f5' }}>
            Reemplazar Archivo (.zip):
          </label>
          <input type="file" name="archivoJuego" onChange={handleChange} accept=".zip" style={inputStyle} />

          {/* Imagen de Portada (Opcional) */}
          <label style={{ display: 'block', marginBottom: 5, color: '#f4f4f5' }}>
            Reemplazar Portada:
          </label>
          {juego.rutaImagen && !formData.imagenPortada && (
              <img src={getImageUrl(juego.rutaImagen)} alt="Portada Actual" style={{ maxWidth: 100, borderRadius: 8, marginBottom: 10 }} />
          )}
          <input type="file" name="imagenPortada" onChange={handleChange} accept="image/*" style={inputStyle} />
          
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{...buttonStyle, backgroundColor: '#52525b', flex: 1}}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{...buttonStyle, backgroundColor: loading ? '#4b5563' : '#ef4444', flex: 1}}>
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Botón de Eliminar (separado del form) */}
        <button 
          onClick={() => setShowDeleteModal(true)} 
          disabled={loading}
          style={{...buttonStyle, backgroundColor: '#dc2626', marginTop: 20}}>
          Eliminar Juego
        </button>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={`Eliminar "${juego.titulo}"`}
        onConfirm={handleDelete}
        confirmText={loading ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}
        confirmColor="#dc2626"
      >
        <p>¿Estás **seguro** de que quieres eliminar este juego? Esta acción es irreversible.</p>
      </Modal>
    </>
  );
}