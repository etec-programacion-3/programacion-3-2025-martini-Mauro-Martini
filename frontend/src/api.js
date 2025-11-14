const API_BASE = 'http://localhost:3001';

// Helper para obtener token - ¡CORRECCIÓN! AÑADIR 'EXPORT'
export const getToken = () => { 
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  // Remover comillas si las hay
  return token.replace(/^["']|["']$/g, '').trim();
};

// Helper para headers con autenticación (no necesita exportarse si solo se usa internamente)
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// AUTH
export async function register(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error en el registro');
  }
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error en el login');
  }
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener usuario');
  return res.json();
}

// USUARIOS
export async function getUsuarios() {
  const res = await fetch(`${API_BASE}/usuarios`);
  if (!res.ok) throw new Error(`GET /usuarios failed: ${res.status}`);
  return res.json();
}

export async function createUsuario(usuario) {
  const res = await fetch(`${API_BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /usuarios failed: ${res.status} ${text}`);
  }
  return res.json();
}

// USUARIOS - Eliminar (para cerrar cuenta)
export async function deleteUsuario(userId) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación.');
  }
  
  const res = await fetch(`${API_BASE}/usuarios/${userId}`, { // Asumiendo endpoint DELETE /usuarios/:id
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido al cerrar la cuenta' }));
    throw new Error(error.error || `DELETE /usuarios/${userId} failed: ${res.status}`);
  }
  
  // No devuelve contenido (204 No Content), solo se verifica res.ok
  return { message: 'Cuenta eliminada con éxito' };
}

// USUARIOS - Modificar
export async function updateUsuario(userId, userData) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor inicia sesión.');
  }
  
  // Usamos PUT al endpoint del usuario
  const res = await fetch(`${API_BASE}/usuarios/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `PUT /usuarios/${userId} failed: ${res.status}`);
  }
  // Devolvemos los datos actualizados del usuario (sin token, ya que no cambia)
  return res.json(); 
}


// JUEGOS
export async function getJuegos() {
  const res = await fetch(`${API_BASE}/juegos`);
  if (!res.ok) throw new Error(`GET /juegos failed: ${res.status}`);
  return res.json();
}

export async function getJuego(id) {
  const res = await fetch(`${API_BASE}/juegos/${id}`);
  if (!res.ok) throw new Error(`GET /juegos/${id} failed: ${res.status}`);
  return res.json();
}

export async function createJuego(formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/juegos`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
      // NO incluir Content-Type para FormData
    },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear juego');
  }
  return res.json();
}

// Helper para construir la URL de la imagen
export function getImageUrl(rutaImagen) {
  if (!rutaImagen) return null;
  return `${API_BASE}/uploads/${rutaImagen}`;
}

// Comentarios
export async function getCommentsByGame(gameId) {
  const res = await fetch(`${API_BASE}/comentarios/game/${gameId}`);
  if (!res.ok) throw new Error(`GET /comentarios/game/${gameId} failed: ${res.status}`);
  return res.json();
}

export async function createComment(comment) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor inicia sesión.');
  }
  
  const res = await fetch(`${API_BASE}/comentarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(comment),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `POST /comentarios failed: ${res.status}`);
  }
  
  return res.json();
}

export async function updateComment(commentId, commentData) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor inicia sesión.');
  }
  
  // Incluimos el ID del comentario en la URL
  const res = await fetch(`${API_BASE}/comentarios/${commentId}`, {
    method: 'PUT', // <-- Usamos PUT
    headers: getAuthHeaders(),
    body: JSON.stringify(commentData),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `PUT /comentarios/${commentId} failed: ${res.status}`);
  }
  
  return res.json();
}
export async function getJuegosByUserId(userId) {
  const res = await fetch(`${API_BASE}/juegos/user/${userId}`);
  if (!res.ok) throw new Error(`GET /juegos/user/${userId} failed: ${res.status}`);
  return res.json();
}

// JUEGOS - Actualizar (NUEVA)
export async function updateJuego(gameId, formData) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor inicia sesión.');
  }
  
  const res = await fetch(`${API_BASE}/juegos/${gameId}`, {
    method: 'PUT',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
      // NO incluir Content-Type para FormData
    },
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al actualizar juego');
  }
  return res.json();
}

// JUEGOS - Eliminar (NUEVA)
export async function deleteJuego(gameId) {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación.');
  }
  
  const res = await fetch(`${API_BASE}/juegos/${gameId}`, { 
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido al eliminar juego' }));
    throw new Error(error.error || `DELETE /juegos/${gameId} failed: ${res.status}`);
  }
  
  return { message: 'Juego eliminado con éxito' };
}
export async function updateGameStats(gameId, userId, hours) {
  const token = getToken();
  
  // Si no hay token, no podemos guardar.
  // No lanzamos error para no interrumpir el juego.
  if (!token) {
    console.warn('No hay token, no se pueden guardar estadísticas de tiempo.');
    return; 
  }
  
  const res = await fetch(`${API_BASE}/stats/${gameId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, hours }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido al guardar stats' }));
    // Logueamos el error pero no lo lanzamos, para no romper la app
    // si falla el seguimiento.
    console.error(`POST /stats/${gameId} failed: ${res.status}`, error.error);
  }
  
  // Opcional: devolver la respuesta por si es útil
  return res.json();
}