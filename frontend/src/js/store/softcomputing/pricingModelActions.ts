import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/variableApi';

export type PricingAlgorithm = 'linear_regression' | 'random_forest' | 'knn';

export interface PricingTrainRow {
  features: Record<string, number>;
  target: number;
}

export interface PricingTrainRequest {
  algorithm: PricingAlgorithm;
  rows: PricingTrainRow[];
  test_size?: number;
  random_state?: number;
  n_estimators?: number;
  n_neighbors?: number;
}

export interface PricingTrainFromDbRequest {
  algorithm?: PricingAlgorithm;
  test_size?: number;
  random_state?: number;
  n_estimators?: number;
  n_neighbors?: number;
  limit?: number;
}

export interface PricingPredictRow {
  features: Record<string, number>;
}

export interface PricingPredictRequest {
  model_id: string;
  rows: PricingPredictRow[];
}

interface GenericSoftComputingResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

const composeBackendErrorMessage = (fallback: string, responseData: unknown): string => {
  if (!responseData || typeof responseData !== 'object') {
    return fallback;
  }

  const payload = responseData as {
    message?: string;
    data?: {
      error?: string;
      errors?: Array<{ base_url?: string; path?: string; error?: string }>;
      hint?: string;
    };
  };

  const lines: string[] = [];
  lines.push(payload.message || fallback);

  if (payload.data?.error) {
    lines.push(payload.data.error);
  }

  if (Array.isArray(payload.data?.errors) && payload.data?.errors.length > 0) {
    const first = payload.data.errors[0];
    lines.push(`base_url: ${first.base_url || 'n/a'}`);
    if (first.path) lines.push(`path: ${first.path}`);
    if (first.error) lines.push(`detalle: ${first.error}`);
  }

  if (payload.data?.hint) {
    lines.push(payload.data.hint);
  }

  return lines.filter(Boolean).join('\n');
};

const getCsrfToken = async (): Promise<string> => {
  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

export const trainPricingModel = createAsyncThunk<GenericSoftComputingResponse, PricingTrainRequest>(
  'softcomputing/trainPricingModel',
  async (payload) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/softcomputing/pricing/train`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: composeBackendErrorMessage('Error al entrenar modelo de precios.', error.response.data),
          data: error.response.data.data,
        };
      }

      return {
        success: false,
        message: 'Error inesperado en trainPricingModel.',
      };
    }
  }
);

export const predictPricingModel = createAsyncThunk<GenericSoftComputingResponse, PricingPredictRequest>(
  'softcomputing/predictPricingModel',
  async (payload) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/softcomputing/pricing/predict`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: composeBackendErrorMessage('Error al predecir precios.', error.response.data),
          data: error.response.data.data,
        };
      }

      return {
        success: false,
        message: 'Error inesperado en predictPricingModel.',
      };
    }
  }
);

export const trainPricingModelFromDb = createAsyncThunk<GenericSoftComputingResponse, PricingTrainFromDbRequest | undefined>(
  'softcomputing/trainPricingModelFromDb',
  async (payload) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/softcomputing/pricing/train-db`,
        payload || {},
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: composeBackendErrorMessage('Error al entrenar modelo de precios desde base de datos.', error.response.data),
          data: error.response.data.data,
        };
      }

      return {
        success: false,
        message: 'Error inesperado en trainPricingModelFromDb.',
      };
    }
  }
);

export const listPricingModels = createAsyncThunk<GenericSoftComputingResponse>(
  'softcomputing/listPricingModels',
  async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/softcomputing/pricing/models`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        withCredentials: true,
      });

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: composeBackendErrorMessage('Error al listar modelos entrenados.', error.response.data),
          data: error.response.data.data,
        };
      }

      return {
        success: false,
        message: 'Error inesperado en listPricingModels.',
      };
    }
  }
);