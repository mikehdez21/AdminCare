
import axios from 'axios';

// En desarrollo: VITE_APP_API queda vacío y el proxy de Vite enruta /api y /sanctum.
// En producción (Vercel): definir VITE_APP_API en las variables de entorno del proyecto Vercel
// apuntando a la URL del backend en Railway, ej: https://mi-backend.up.railway.app
const base = (import.meta.env.VITE_APP_API || '').replace(/\/$/, '');

export const API_BASE_URL = base;

// Sanctum API tokens: usar Authorization Bearer en lugar de cookies cross-domain
const axiosInstance = axios.create({
  baseURL: base || undefined,
  withCredentials: true,
});

// Interceptor para agregar token de autenticación en cada request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;