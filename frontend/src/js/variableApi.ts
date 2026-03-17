
import axios from 'axios';

// En desarrollo: VITE_APP_API puede quedar vacio y el proxy de Vite enruta /api y /sanctum.
// En produccion (Vercel): establecer VITE_APP_API apuntando al backend en Railway.
// Ejemplo: https://admincare-production.up.railway.app
const base = (import.meta.env.VITE_APP_API || '').replace(/\/$/, '');

export const API_BASE_URL = base;

const axiosInstance = axios.create({
  baseURL: base || undefined,
  withCredentials: true,
});

export default axiosInstance;