
import axios from 'axios';

// En desarrollo: VITE_APP_API queda vacío y el proxy de Vite enruta /api y /sanctum.
// En producción (Vercel): definir VITE_APP_API en las variables de entorno del proyecto Vercel
// apuntando a la URL del backend en Railway, ej: https://mi-backend.up.railway.app
const base = (import.meta.env.VITE_APP_API || '').replace(/\/$/, '');

export const API_BASE_URL = base;

// Sanctum SPA: axios lee automáticamente la cookie XSRF-TOKEN y envía X-XSRF-TOKEN.
// No manipular CSRF manualmente en los actions.
const axiosInstance = axios.create({
  baseURL: base || undefined,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default axiosInstance;