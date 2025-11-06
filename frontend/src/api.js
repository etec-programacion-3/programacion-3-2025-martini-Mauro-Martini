const API_BASE = 'http://localhost:3000';

// Helper para obtener token
const getToken = () => localStorage.getItem('token');

// Helper para headers con autenticación
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
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
    body: formData, // FormData con titulo, descripcion, archivo, imagen
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
  const res = await fetch(`${API_BASE}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /comentarios failed: ${res.status} ${text}`);
  }
  return res.json();
}