// src/services/api.js

const API_URL = 'http://localhost:3000';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en inicio de sesión');
    return data;
  },

  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en registro');
    return data;
  },

  // User Profile
  getProfile: async () => {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo perfil');
    return data;
  },
  
  // Dashboard Summary
  getDashboardSummary: async () => {
    const res = await fetch(`${API_URL}/users/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo dashboard');
    return data;
  },

  // Matches
  getMatches: async () => {
    const res = await fetch(`${API_URL}/matches`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo partidos');
    return data;
  },

  // Predictions
  getMyPredictions: async () => {
    const res = await fetch(`${API_URL}/predictions/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo pronósticos');
    return data;
  },
  
  createPrediction: async (matchId, homeScoreBet, awayScoreBet) => {
    const res = await fetch(`${API_URL}/predictions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ matchId, homeScoreBet: parseInt(homeScoreBet), awayScoreBet: parseInt(awayScoreBet) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al guardar pronóstico');
    return data;
  },
  
  updatePrediction: async (id, homeScoreBet, awayScoreBet) => {
    const res = await fetch(`${API_URL}/predictions/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ homeScoreBet: parseInt(homeScoreBet), awayScoreBet: parseInt(awayScoreBet) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar pronóstico');
    return data;
  },

  // Groups
  getMyGroups: async () => {
    const res = await fetch(`${API_URL}/groups`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo grupos');
    return data;
  },

  createGroup: async (name) => {
    const res = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creando grupo');
    return data;
  },

  joinGroup: async (invitationCode) => {
    const res = await fetch(`${API_URL}/groups/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ invitationCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al unirse al grupo');
    return data;
  },

  getGroupLeaderboard: async (id) => {
    const res = await fetch(`${API_URL}/groups/${id}/leaderboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error obteniendo leaderboard');
    return data;
  },

  // Profile
  updateProfile: async (name) => {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error actualizando perfil');
    return data;
  },

  // Admin Matches
  createMatch: async (matchData) => {
    const res = await fetch(`${API_URL}/matches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(matchData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creando partido');
    return data;
  },

  updateMatch: async (id, matchData) => {
    const res = await fetch(`${API_URL}/matches/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(matchData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error actualizando partido');
    return data;
  },

  triggerManualSync: async () => {
    const res = await fetch(`${API_URL}/matches/sync`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en sincronización manual');
    return data;
  }
};

