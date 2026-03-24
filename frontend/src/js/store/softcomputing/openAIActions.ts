import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/variableApi';

type SoftComputingMode =
	| 'price_prediction'
	| 'anomaly_detection'
	| 'fraud_detection'
	| 'inventory_optimization';

type SoftComputingAlgorithm =
	| 'linear_regression'
	| 'random_forest'
	| 'knn'
	| 'naive_bayes'
	| 'logistic_regression'
	| 'mlp'
	| 'backpropagation'
	| 'kmeans';

export interface OpenAISoftComputingRequest {
	mode: SoftComputingMode;
	algorithm?: SoftComputingAlgorithm;
	prompt: string;
	data?: Record<string, unknown>;
	use_web_search?: boolean;
}

export interface OpenAISoftComputingResponse {
	success: boolean;
	message: string;
	data?: {
		mode: SoftComputingMode;
		algorithm?: SoftComputingAlgorithm;
		model_used: string;
		analysis_text: string;
		web_search?: {
			requested: boolean;
			attempted: boolean;
			used: boolean;
			tool_type?: string | null;
			disabled_reason?: string | null;
			sources?: Array<{
				title: string;
				url: string;
			}>;
		};
		raw_response: Record<string, unknown>;
	};
}

export const analyzeSoftComputing = createAsyncThunk<
	OpenAISoftComputingResponse,
	OpenAISoftComputingRequest
>(
  'softcomputing/analyzeSoftComputing',
  async (payload: OpenAISoftComputingRequest) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/softcomputing/analyze`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
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
          message: error.response.data.message || 'Error al ejecutar análisis de SoftComputing.',
        };
      }

      return {
        success: false,
        message: 'Error inesperado en analyzeSoftComputing.',
      };
    }
  }
);
