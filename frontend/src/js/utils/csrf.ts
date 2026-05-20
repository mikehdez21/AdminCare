import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';

const csrfBootstrapKey = 'admincare_csrf_bootstrapped';

export const hasCsrfCookie = () => document.cookie.includes('XSRF-TOKEN=');

export const ensureCsrfCookie = async () => {
  if (hasCsrfCookie()) {
    return;
  }

  if (sessionStorage.getItem(csrfBootstrapKey) === '1') {
    return;
  }

  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  sessionStorage.setItem(csrfBootstrapKey, '1');
};