import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('mts_user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
})();

if (storedUser?.token) {
  api.defaults.headers.common.Authorization = `Bearer ${storedUser.token}`;
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
