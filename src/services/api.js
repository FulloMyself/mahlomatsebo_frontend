const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  async post(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  },
};
