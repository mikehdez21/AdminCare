import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

interface ApiStatusResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiStatusUrl = apiBaseUrl ? `${apiBaseUrl}/api/HSS1/status` : '/api/HSS1/status';

export const checkApiStatus = createAsyncThunk<
  ApiStatusResponse,
  void,
  { rejectValue: string }
>('status/checkApiStatus', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(apiStatusUrl, { withCredentials: true });

    return {
      success: Boolean(response.data?.success),
      message: response.data?.message || 'La API respondió correctamente.',
      statusCode: response.data?.status_code || response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK'
          ? 'No se pudo conectar con la API.'
          : 'Error consultando el estado de la API.');

      return rejectWithValue(message);
    }

    return rejectWithValue('Error desconocido consultando el estado de la API.');
  }
});
