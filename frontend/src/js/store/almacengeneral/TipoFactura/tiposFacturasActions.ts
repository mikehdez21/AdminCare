import { isAxiosError } from 'axios';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';
import { TIPOS_FACTURAS_ENDPOINT } from './tiposFacturasApi';

export interface TipoFacturaMutationResult {
  success: boolean;
  message: string;
  tipoFactura?: TiposFacturasAF;
  id_tipofacturaaf?: number;
}

const responseArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  for (const key of ['data', 'API_Response', 'results']) {
    if (Array.isArray(record[key])) return record[key] as T[];
    if (record[key] && typeof record[key] === 'object') {
      const nested = responseArray<T>(record[key]);
      if (nested.length > 0) return nested;
    }
  }
  return [];
};

// Agregar un nuevo Tipo de Factura
export const addTipoFactura = createAsyncThunk<TipoFacturaMutationResult, TiposFacturasAF>(
  'almacengeneral/addTipoFactura',
  async (nuevoTipo: TiposFacturasAF) => {
    try {

      const response = await api.post(
        `${API_BASE_URL}${TIPOS_FACTURAS_ENDPOINT}`,
        nuevoTipo
      );

      return { success: response.data?.success !== false, message: response.data?.message || '', tipoFactura: response.data?.data };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return {
        success: false,
        message: 'Error inesperado',
      };
    }
  }
);

// Obtener los tipos de factura registrados
export const getTiposFacturas = createAsyncThunk<{ success: boolean; tiposFacturas: TiposFacturasAF[]; message: string }>(
  'almacengeneral/tipoFactura/getTiposFacturas',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}${TIPOS_FACTURAS_ENDPOINT}`);

      const tiposFormateados = responseArray<TiposFacturasAF>(response.data).map((tipo: TiposFacturasAF) => ({
        ...tipo,
        created_at: tipo.created_at ? (formatDateHorasToFrontend(tipo.created_at) || undefined) : undefined,
        updated_at: tipo.updated_at ? (formatDateHorasToFrontend(tipo.updated_at) || undefined) : undefined,
      }));

      return { success: response.data?.success !== false, tiposFacturas: tiposFormateados, message: response.data?.message || '' };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          tiposFacturas: [],
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return {
        success: false,
        tiposFacturas: [],
        message: 'Error inesperado',
      };
    }
  }
);

// Editar un Tipo de Factura
export const editTipoFactura = createAsyncThunk<TipoFacturaMutationResult, TiposFacturasAF>(
  'almacengeneral/editTipoFactura',
  async (tipoEditado: TiposFacturasAF) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}${TIPOS_FACTURAS_ENDPOINT}/${tipoEditado.id_tipofacturaaf}`,
        tipoEditado
      );

      return { success: response.data?.success !== false, message: response.data?.message || '', tipoFactura: response.data?.data };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return {
        success: false,
        message: 'Error inesperado',
      };
    }
  }
);

// Eliminar un Tipo de Factura
export const deleteTipoFactura = createAsyncThunk<TipoFacturaMutationResult, TiposFacturasAF>(
  'almacengeneral/deleteTipoFactura',
  async (tipoEliminado: TiposFacturasAF) => {
    try {

      const response = await api.delete(
        `${API_BASE_URL}${TIPOS_FACTURAS_ENDPOINT}/${tipoEliminado.id_tipofacturaaf}`
      );

      return {
        success: response.data?.success !== false,
        message: response.data?.message || '',
        id_tipofacturaaf: response.data?.data?.id_tipofacturaaf ?? tipoEliminado.id_tipofacturaaf,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return {
        success: false,
        message: 'Error inesperado',
      };
    }
  }
);
