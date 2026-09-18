import { isAxiosError } from 'axios';
import { FacturasAF, TiposFacturasAF, ActivosFacturaApiResponse, ActivoFacturaInput } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { ActivoEntityResponse } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { TIPOS_FACTURAS_ENDPOINT } from '../TipoFactura/tiposFacturasApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de facturas.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoFacturas {
  success: boolean;
  facturas?: FacturasAF[];
  meta?: PaginacionMeta | null;
  message: string;
}

/** API responses have existed in several shapes (data, API_Response or a raw array). */
const responseArray = <T>(payload: unknown, keys: string[] = ['data', 'API_Response']): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
    if (record[key] && typeof record[key] === 'object') {
      const nested = responseArray<T>(record[key], keys);
      if (nested.length > 0) return nested;
    }
  }
  return [];
};

// Agregar una nueva factura
export const addFactura = createAsyncThunk<{ success: boolean; message: string; id_factura?: number }, FacturasAF>(
  'almacengeneral/addFactura',
  async (nuevaFactura: FacturasAF) => {
    try {
      console.log('Nueva factura a agregar:', nuevaFactura);
      console.log('Factura a agregar:', nuevaFactura);

      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/almacengeneral/facturas`,
        nuevaFactura
      );

      return {
        success: response.data.success,
        message: response.data.message,
        id_factura: response.data?.data?.id_factura,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const backendMessage = getBackendErrorMessage(error.response.data, '');
        const status = error.response.status;
        const statusText = error.response.statusText;
        const axiosMessage = error.message;

        if (import.meta.env.DEV) {
          console.error('addFactura error detail:', {
            status,
            statusText,
            axiosMessage,
            responseData: error.response.data,
          });
        }

        return {
          success: false,
          message: backendMessage || 'No se pudo registrar la factura',
          id_factura: undefined,
        };
      }

      return {
        success: false,
        message: 'Error Actions inesperado',
        id_factura: undefined,
      };
    }
  }
);
// Obtener las facturas registradas.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getFacturas = createAsyncThunk<ResultadoFacturas, PaginacionParams | void>(
  'almacengeneral/getFacturas',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/HSS1/almacengeneral/facturas`,
        params ? { params } : undefined,
      );

      const facturasFormateadas = responseArray<FacturasAF>(response.data).map((factura: FacturasAF) => {
        return {
          ...factura,

          created_at: factura.created_at
            ? (formatDateHorasToFrontend(factura.created_at) || undefined)
            : undefined,

          updated_at: factura.updated_at
            ? (formatDateHorasToFrontend(factura.updated_at) || undefined)
            : undefined,
        };
      });

      return { success: true, facturas: facturasFormateadas, meta: response.data.meta ?? null, message: response.data.message };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          facturas: [],
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return {
        success: false,
        facturas: [],
        message: 'Error inesperado',
      };
    }
  }
);

// Editar una factura
export const updateFactura = createAsyncThunk<
  { success: boolean; message: string },
  { id: number; factura: Partial<FacturasAF> }
>(
  'almacengeneral/updateFactura',
  async ({ id, factura }) => {
    try {
      console.log('Factura a actualizar:', factura);

      const response = await api.put(
        `${API_BASE_URL}/api/HSS1/almacengeneral/facturas/${id}`,
        factura
      );

      return { success: response.data.success, message: response.data.message };
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

// Eliminar una factura

// Obtener los tipos de facturas registrados
export const getTiposFacturas = createAsyncThunk<{ success: boolean; tiposFacturas: TiposFacturasAF[]; message: string }>(
  'almacengeneral/getTiposFacturas',
  async () => {
    try {

      // Los tipos de factura tienen un único recurso CRUD canónico.
      const response = await api.get(`${API_BASE_URL}${TIPOS_FACTURAS_ENDPOINT}`);

      return { success: response.data?.success !== false, tiposFacturas: responseArray(response.data, ['API_Response', 'data']), message: response.data?.message || '' };
    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          tiposFacturas: [],
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        });
      }

      return ({
        success: false,
        tiposFacturas: [],
        message: 'Error inesperado',
      });
    }
  }
);

// Obtener activos asociados a una factura específica
export const getActivosFactura = createAsyncThunk<ActivosFacturaApiResponse, number>(
  'almacengeneral/getActivosFactura',
  async (idFactura: number) => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/HSS1/almacengeneral/facturas/${idFactura}/activos`);

      return { success: response.data.success, activosFactura: response.data.data || [], message: response.data.message };
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

// Agregar activos a una factura existente
export const addActivosToFactura = createAsyncThunk<
  { success: boolean; message: string; data?: ActivoEntityResponse[] },
  { id_factura: number; activos: ActivoFacturaInput[] }
>(
  'almacengeneral/addActivosToFactura',
  async ({ id_factura, activos }) => {
    try {

      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/almacengeneral/facturas/activos`,
        { id_factura, activos }
      );

      return { success: response.data.success, message: response.data.message, data: response.data.data };
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

// Actualizar activos de una factura
export const updateActivosFactura = createAsyncThunk<
  { success: boolean; message: string; data?: ActivoEntityResponse[] },
  { id_factura: number; activos: ActivoFacturaInput[] }
>(
  'almacengeneral/updateActivosFactura',
  async ({ id_factura, activos }) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}/api/HSS1/almacengeneral/facturas/${id_factura}/activos`,
        { activos }
      );

      return { success: response.data.success, message: response.data.message, data: response.data.data };
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

// Remover activo específico de una factura
export const removeActivoFromFactura = createAsyncThunk<
  { success: boolean; message: string },
  { id_factura: number; id_activo: number }
>(
  'almacengeneral/removeActivoFromFactura',
  async ({ id_factura, id_activo }) => {
    try {

      const response = await api.delete(
        `${API_BASE_URL}/api/HSS1/almacengeneral/facturas/${id_factura}/activos/${id_activo}`
      );

      return { success: response.data.success, message: response.data.message };
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
