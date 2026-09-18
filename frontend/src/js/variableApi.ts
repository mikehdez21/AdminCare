
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

const base = (import.meta.env.VITE_APP_API || '').replace(/\/$/, '');

export const API_BASE_URL = base;

// ------------------------------------------------------------------
// CSRF cookie helper — fetched once, reused for the lifetime of the app.
// Uses the raw `axios` (NOT the interceptor-carrying instance) to avoid
// recursion: the interceptor itself calls this function, so calling
// `axiosInstance.get(csrfUrl)` would re-enter the interceptor.
// ------------------------------------------------------------------
let csrfCookiePromise: Promise<void> | null = null;

function ensureCsrfCookie(): Promise<void> {
  if (!base) return Promise.resolve();

  if (!csrfCookiePromise) {
    csrfCookiePromise = axios
      .get(`${base}/sanctum/csrf-cookie`, { withCredentials: true })
      .then(() => undefined)
      .catch((err: unknown) => {
        // If the request fails, reset so the next attempt can try again.
        csrfCookiePromise = null;
        if (err instanceof Error) {
          console.warn('[variableApi] Failed to fetch CSRF cookie:', err.message);
        }
      });
  }

  return csrfCookiePromise;
}

// ------------------------------------------------------------------
// Helper: read the XSRF token from the <meta> tag injected by Laravel.
// ------------------------------------------------------------------
function getCsrfTokenFromMeta(): string | null {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  return meta?.content ?? null;
}

// ------------------------------------------------------------------
// Axios instance shared across the entire frontend.
// ------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: base || undefined,
  withCredentials: true,
});

// ------------------------------------------------------------------
// Request interceptor
// ------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = (config.url ?? '').trim();

    // --- Skip interceptors for the CSRF-cookie endpoint itself ----------
    // This avoids the infinite recursion where fetching the cookie
    // would trigger the interceptor which fetches the cookie, etc.
    const isCsrfRequest = url.includes('/sanctum/csrf-cookie');
    if (isCsrfRequest) {
      return config;
    }

    // --- Default Content-Type -------------------------------------------
    if (config.headers) {
      // Do NOT set Content-Type for FormData (browser sets the boundary)
      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;
      if (!isFormData && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    // --- CSRF header from <meta> tag (if present in the DOM) ------------
    const csrfMeta = getCsrfTokenFromMeta();
    if (csrfMeta && config.headers) {
      config.headers['X-CSRF-TOKEN'] = csrfMeta;
    }

    // --- Ensure the XSRF cookie is set before sending -------------------
    // Return a promise so axios waits for the cookie to be ready.
    return ensureCsrfCookie().then(() => config);
  },
  (error) => Promise.reject(error),
);

// ------------------------------------------------------------------
// Response interceptor — conservative 401 handling.
// authActions.ts already manages 401/403/419 via rejectWithValue().
// We only log a warning here; no redirect, no forced logout.
// ------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      // Do NOT warn for auth-related endpoints — those 401s are expected
      // (e.g. checkAuthSession when no session exists, login with bad creds).
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/check') ||
        url.includes('/auth/permissions') ||
        url.includes('/auth/logout') ||
        url.includes('/sanctum/');

      if (!isAuthEndpoint) {
        if (import.meta.env.DEV) {
          console.warn(
            '[variableApi] 401 Unauthorized —',
            url,
            '(no redirect; authActions handles it)',
          );
        }
      }
    }

    // Always reject so the calling code (authActions, etc.) receives the error.
    return Promise.reject(error);
  },
);

export default axiosInstance;
