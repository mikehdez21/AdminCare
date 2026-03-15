
import axios from 'axios';

const apiBaseUrl = axios.create({
  baseURL: import.meta.env.VITE_APP_API,
});
export const API_BASE_URL = import.meta.env.VITE_APP_API;
export default apiBaseUrl;