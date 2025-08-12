import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';
// Debug: show API base once
if (typeof window !== 'undefined') {
  // Avoid spamming if hot reloading
  if (!(window as any).__API_BASE_LOGGED__) {
    console.log('[HTTP] baseURL =', API_BASE);
    (window as any).__API_BASE_LOGGED__ = true;
  }
}

export const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  // Debug
  try {
    const url = `${(config.baseURL || '')}${config.url || ''}`;
    console.log('➡️  [HTTP] request', config.method?.toUpperCase(), url);
  } catch {}
  return config;
});

let isRefreshing = false;
let pending: Array<() => void> = [];

function redirectToLogin() {
  try {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login?next=${next}`);
  } catch {
    window.location.href = '/login';
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    try {
      const url = `${(error.config?.baseURL || '')}${error.config?.url || ''}`;
      console.warn('⚠️  [HTTP] error', error.response?.status, error.response?.statusText, 'for', error.config?.method?.toUpperCase(), url);
      if (error.response?.data) console.warn('   [HTTP] response body:', error.response.data);
    } catch {}
    const original = error.config;
    const status = error.response?.status;
    const isRefreshEndpoint = typeof original?.url === 'string' && original.url.includes('/api/auth/refresh');

  // Si estamos en refresh fallido (401 en /refresh), limpiar y redirigir
  if (status === 401 && isRefreshEndpoint) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      redirectToLogin();
      throw error;
    }

    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        await new Promise<void>((resolve) => pending.push(resolve));
      }
      try {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data;
        localStorage.setItem('accessToken', accessToken);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
        pending.forEach((fn) => fn());
        pending = [];
        return http(original);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        pending = [];
        redirectToLogin();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);



