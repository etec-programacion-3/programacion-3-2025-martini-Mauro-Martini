import React from 'react';

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmText, confirmColor = '#ef4444' }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Oscurecido
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div 
                style={{
                    backgroundColor: '#1f2937', // Fondo Gris Oscuro del modal
                    padding: 32,
                    borderRadius: 12,
                    width: '90%',
                    maxWidth: 450,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    color: 'white'
                }}
                onClick={(e) => e.stopPropagation()} // Evita que el clic dentro cierre el modal
            >
                <h3 style={{ marginTop: 0, color: 'white' }}>{title}</h3>
                <div style={{ marginBottom: 20, color: '#9ca3af' }}>
                    {children}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4b5563', // Botón Cancelar Gris
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: confirmColor, // Color de confirmación (rojo por defecto)
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}