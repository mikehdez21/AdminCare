import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

export interface AxiosQueryConfig {
  url: string;
  method?: AxiosRequestConfig['method'];
  params?: AxiosRequestConfig['params'];
  data?: AxiosRequestConfig['data'];
}

export const axiosBaseQuery: BaseQueryFn<
  AxiosQueryConfig,
  unknown,
  { status: number; message: string }
> = async ({ url, method = 'GET', params, data }) => {
  try {
    const result = await api({
      url: `${API_BASE_URL}${url}`,
      method,
      params,
      data,
    });
    return { data: result.data };
  } catch (err) {
    const axiosError = err as {
      response?: { data: unknown; status: number };
      message?: string;
    };
    const status = axiosError.response?.status ?? 0;
    const message = getBackendErrorMessage(
      axiosError.response?.data ?? err,
      'Error inesperado',
    );
    return { error: { status, message } };
  }
};

export function extraerLista<T>(payload: unknown): T[] {
  const p = payload as { success?: boolean; data?: T[] } | undefined;
  if (p?.success === false) return [];
  return p?.data ?? [];
}

export function extraerPaginado<T>(payload: unknown): {
  items: T[];
  meta?: unknown;
} {
  const p = payload as { data?: T[]; meta?: unknown } | undefined;
  return { items: p?.data ?? [], meta: p?.meta };
}

export function extraerApiRespuesta<T>(payload: unknown): T[] {
  const p = payload as
    | { API_Response?: T[]; success?: boolean; data?: T[] }
    | undefined;
  if (p?.success === false) return [];
  return p?.API_Response ?? p?.data ?? [];
}
