import axios from 'axios';
import { FacturasAF, ActivosFacturaApiResponse, ActivoFacturaInput } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { ActivoEntityResponse } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';

const buildBackendErrorMessage = (payload: unknown): string => {
  if (typeof payload === 'string') {
    const cleaned = payload.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 0) {
      return cleaned.slice(0, 300);
    }
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const data = payload as {
    message?: string;
    error?: string;
    data?: Record<string, string[] | string>;
    errors?: Record<string, string[] | string>;
  };

  const baseMessage = data.message || data.error || '';
  const validationBag = data.data || data.errors;

  if (!validationBag || typeof validationBag !== 'object') {
    return baseMessage;
  }

  const validationLines = Object.entries(validationBag)
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value.map((msg) => `${field}: ${msg}`);
      }

      if (typeof value === 'string') {
        return [`${field}: ${value}`];
      }

      return [];
    })
    .filter(Boolean);

  if (validationLines.length === 0) {
    return baseMessage;
  }

  return `${baseMessage}\n${validationLines.join('\n')}`;
};


// Agregar una nueva factura
export const addFactura = createAsyncThunk<{ success: boolean; message: string; id_factura?: number }, FacturasAF>(
  'almacenGeneral/addFactura',
  async (nuevaFactura: FacturasAF) => {
    try {
      console.log('Nueva factura a agregar:', nuevaFactura),
        await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas',
        nuevaFactura,
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
        id_factura: response.data?.data?.id_factura,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = buildBackendErrorMessage(error.response.data);
        const status = error.response.status;
        const statusText = error.response.statusText;
        const axiosMessage = error.message;

        const debugMessage = [
          backendMessage,
          `HTTP ${status}${statusText ? ` ${statusText}` : ''}`,
          axiosMessage,
        ]
          .filter(Boolean)
          .join('\n');

        console.error('addFactura error detail:', {
          status,
          statusText,
          axiosMessage,
          responseData: error.response.data,
        });

        return {
          success: false,
          message: debugMessage || 'Error en addFactura Action',
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

// Obtener las facturas registradas
export const getFacturas = createAsyncThunk<{ success: boolean; facturas?: FacturasAF[], message: string }>(
  'almacenGeneral/getFacturas',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const facturasFormateadas = response.data.data.map((factura: FacturasAF) => {
        return {
          ...factura,

          created_at: factura.created_at
            ? formatDateHorasToFrontend(factura.created_at)
            : null,

          updated_at: factura.updated_at
            ? formatDateHorasToFrontend(factura.updated_at)
            : null,
        };
      });

      return { success: true, facturas: facturasFormateadas, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
        };
      }

      return {
        success: false,
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
  'almacenGeneral/updateFactura',
  async ({ id, factura }) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas/${id}`,
        factura,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
export const getTiposFacturas = createAsyncThunk<{ success: boolean; tiposFacturas?: []; message: string }>(
  'almacenGeneral/getTiposFacturas',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/tipos-facturas', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, tiposFacturas: response.data.API_Response || [], message: response.data.message };
    } catch (error) {
      // Manejo de errores
      if (axios.isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: error.response.data.message || 'Error inesperado',
        });
      }

      return ({
        success: false,
        message: 'Error inesperado',
      });
    }
  }
);

// Obtener activos asociados a una factura específica
export const getActivosFactura = createAsyncThunk<ActivosFacturaApiResponse, number>(
  'almacenGeneral/getActivosFactura',
  async (idFactura: number) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas/${idFactura}/activos`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, activosFactura: response.data.data || [], message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
  'almacenGeneral/addActivosToFactura',
  async ({ id_factura, activos }) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas/activos',
        { id_factura, activos },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      return { success: response.data.success, message: response.data.message, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
  'almacenGeneral/updateActivosFactura',
  async ({ id_factura, activos }) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas/${id_factura}/activos`,
        { activos },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      return { success: response.data.success, message: response.data.message, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
  'almacenGeneral/removeActivoFromFactura',
  async ({ id_factura, id_activo }) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas/${id_factura}/activos/${id_activo}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
        };
      }

      return {
        success: false,
        message: 'Error inesperado',
      };
    }
  }
);
