import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { deleteUsuario, updateUsuario } from './api'; 
import Modal from './components/Modal'; 
import './App.css'; 

// ----------------------------------------------------------------------
// SUB-COMPONENTE: Formulario de Modificación
// ----------------------------------------------------------------------
function ModificarCuentaForm({ user, onUserUpdate, setLoading, setError }) {
  const [currentPassword, setCurrentPassword] = useState(''); // <-- CAMPO DE SEGURIDAD
  const [newNombre, setNewNombre] = useState(user.nombre);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newAiEnabled, setNewAiEnabled] = useState(user.aiEnabled); // <-- NUEVO ESTADO

  const inputStyle = {
    width: '100%',
    padding: 10,
    fontSize: 14,
    borderRadius: 6,
    marginBottom: 10,
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!currentPassword) { 
      setError('Por favor, ingresa tu contraseña actual para confirmar los cambios.');
      setLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    
    // --- VALIDACIÓN MODIFICADA ---
    if (newNombre === user.nombre && !newPassword && newAiEnabled === user.aiEnabled) {
      setError('No se detectaron cambios en el nombre, la contraseña o la configuración de IA.');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        contraseñaActual: currentPassword,
      };
      
      if (newNombre !== user.nombre) {
        updateData.nombre = newNombre;
      }
      if (newPassword) {
        updateData.contraseñaNueva = newPassword;
      }
      
      // --- LÓGICA AÑADIDA ---
      if (newAiEnabled !== user.aiEnabled) {
        updateData.aiEnabled = newAiEnabled;
      }

      // 1. Llama a la API para actualizar los datos
      const updatedUser = await updateUsuario(user.id, updateData);
      
      // 2. Llama a la función del padre para actualizar el contexto
      onUserUpdate(updatedUser);
      
      setError('¡Cuenta actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      setError(err.message || 'Error al actualizar la cuenta.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleUpdate}>
      <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: 15 }}>
          **Modificar Cuenta (solo Nombre y/o Contraseña)**
      </div>
      
      {/* --- BLOQUE AÑADIDO --- */}
      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        color: '#f4f4f5', 
        marginBottom: 8,
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          checked={newAiEnabled}
          onChange={(e) => setNewAiEnabled(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        Activar Asistente IA
      </label>
      <p style={{
        color: '#a1a1aa',
        fontSize: '13px',
        margin: '0 0 20px 0',
        lineHeight: 1.5
      }}>
        El asistente te dará comentarios cuando tus calificaciones difieran mucho del promedio.
      </p>
      {/* --- FIN BLOQUE AÑADIDO --- */}
      
      {/* CAMPO DE SEGURIDAD REQUERIDO */}
      <label style={{ color: '#f4f4f5', display: 'block', marginBottom: 5 }}>Contraseña Actual:</label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        style={{...inputStyle, marginBottom: 20, border: '1px solid #ef4444'}} // Destacar seguridad
        placeholder="Requerido para guardar cambios"
      />
      
      <label style={{ color: '#f4f4f5', display: 'block', marginBottom: 5 }}>Nombre de Usuario:</label>
      <input
        type="text"
        name="nombre"
        value={newNombre}
        onChange={(e) => setNewNombre(e.target.value)}
        required
        style={inputStyle}
      />
      
      <label style={{ color: '#f4f4f5', display: 'block', marginBottom: 5 }}>Nueva Contraseña:</label>
      <input
        type="password"
        name="newPassword"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Dejar vacío para no cambiar"
        style={inputStyle}
      />
      
      <label style={{ color: '#f4f4f5', display: 'block', marginBottom: 5 }}>Confirmar Contraseña:</label>
      <input
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirma nueva contraseña"
        style={inputStyle}
      />
      
      <button 
        type="submit"
        disabled={setLoading || !currentPassword}
        style={{ 
          ...buttonStyle, 
          backgroundColor: setLoading || !currentPassword ? '#52525b' : '#ef4444', 
          color: 'white',
        }}
      >
        Guardar Cambios
      </button>
    </form>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: Panel Lateral de Cuenta
// ----------------------------------------------------------------------
export default function AccountPanel({ isOpen, onClose }) {
  const { user, logout, updateUserContext } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('view');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // <--- DEBE ESTAR AQUÍ
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
        setView('view');
        setError(null);
        setLoading(false);
    }
  }, [isOpen]);
  
  const handleUserUpdate = (updatedUser) => {
    updateUserContext(updatedUser);
    setView('view');
  };
  
  const handleCerrarCuenta = async () => {
    if (!user || loading) return;

    setLoading(true);
    setError(null);
    try {
      await deleteUsuario(user.id);
      
      logout();
      navigate('/');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al eliminar la cuenta');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const panelStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-350px',
    width: 350,
    height: '100%',
    backgroundColor: '#27272a', 
    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
    zIndex: 999,
    transition: 'right 0.3s ease-out',
    padding: 25,
    overflowY: 'auto',
    color: '#f4f4f5',
    borderLeft: '1px solid #3f3f46'
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && (
        <div 
          onClick={onClose} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 998,
            transition: 'background-color 0.3s'
          }}
        />
      )}

      <div style={panelStyle}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: 30, 
          color: '#ef4444', 
          borderBottom: '2px solid #3f3f46',
          paddingBottom: 15
        }}>
          Configuración de Cuenta
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            padding: 10,
            borderRadius: 6,
            marginBottom: 15,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {loading && (
             <p style={{ textAlign: 'center', color: '#a1a1aa' }}>Procesando...</p>
        )}

        {view === 'view' ? (
          <>
            {/* Información de la cuenta */}
            <div style={{ marginBottom: 30, lineHeight: 1.8 }}>
              <div style={{ color: '#a1a1aa', fontSize: 14 }}>Nombre de Usuario</div>
              <strong style={{ fontSize: 18 }}>{user.nombre}</strong>
              
              <div style={{ color: '#a1a1aa', fontSize: 14, marginTop: 15 }}>Correo Electrónico (Gmail)</div>
              <strong style={{ fontSize: 18 }}>{user.email}</strong>
              
              <div style={{ color: '#a1a1aa', fontSize: 14, marginTop: 15 }}>Contraseña</div>
              <strong style={{ fontSize: 18 }}>*************</strong>
            </div>

            <button
              onClick={() => { setView('edit'); setError(null); }}
              disabled={loading}
              style={{
                padding: '10px 20px',
                fontSize: 16,
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%',
                marginBottom: 20
              }}
            >
              Modificar Información
            </button>
          </>
        ) : (
          <>
            <ModificarCuentaForm 
                user={user} 
                onUserUpdate={handleUserUpdate} 
                setLoading={setLoading}
                setError={setError}
            />
            <button
                onClick={() => { setView('view'); setError(null); }}
                style={{
                    padding: '10px 20px',
                    fontSize: 16,
                    backgroundColor: '#52525b',
                    color: '#f4f4f5',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: '100%',
                    marginTop: 10
                }}
            >
                Cancelar Modificación
            </button>
          </>
        )}
        
        {/* Separador */}
        <div style={{ borderTop: '1px solid #3f3f46', paddingTop: 20, marginTop: 20 }}>
          
          {/* Botón de Salir */}
          <button
            onClick={() => { logout(); onClose(); }}
            style={{
              padding: '10px 20px',
              fontSize: 16,
              backgroundColor: '#52525b',
              color: '#f4f4f5',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%',
              marginBottom: 10
            }}
          >
            Salir de Sesión
          </button>
          
          {/* Botón de Borrar Cuenta */}
          <button
            onClick={() => setShowModal(true)}
            disabled={loading} // <--- Uso de 'loading'
            style={{
              padding: '10px 20px',
              fontSize: 16,
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%'
            }}
          >
            {loading ? 'Eliminando...' : 'Borrar Cuenta'} {/* <--- Uso de 'loading' */}
          </button>
        </div>
      </div>
      
      {/* Modal de Confirmación para Borrar Cuenta */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirmación de Eliminación de Cuenta"
        onConfirm={handleCerrarCuenta}
        confirmText={loading ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}
        confirmColor="#dc2626"
      >
        <p>⚠️ ¿Estás **ABSOLUTAMENTE SEGURO** de que quieres borrar tu cuenta? Esta acción es **IRREVERSIBLE** y eliminará todos tus datos. Los juegos que subiste permanecerán pero el autor dirá (Eliminado).</p>
        {error && (
          <div style={{ color: '#ef4444', marginTop: 10, fontWeight: 'bold' }}>
            Error: {error}
          </div>
        )}
      </Modal>
    </>
  );
}