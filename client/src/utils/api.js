const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  async fetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      const error = new Error(errorData.message);
      if (errorData.requiresVerification) error.requiresVerification = true;
      throw error;
    }

    return response.json();
  },

  async fetchRaw(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message);
    }

    return response;
  },
};
