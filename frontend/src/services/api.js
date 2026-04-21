const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // If body is FormData (or URLSearchParams), let the browser set the Content-Type automatically.
  if (options.body && (options.body instanceof FormData || options.body instanceof URLSearchParams)) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized: token might be expired. Handle logout.
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
};
