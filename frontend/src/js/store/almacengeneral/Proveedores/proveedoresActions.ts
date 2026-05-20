import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export interface ProveedoresPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface GetProveedoresOptions {
  paginated?: boolean;
  page?: number;
  perPage?: number;
  search?: string;
}

export interface GetProveedoresResult {
  success: boolean;
  proveedor?: Proveedores[];
  pagination?: ProveedoresPagination;
  message: string;
}


// Agregar un nuevo proveedor
export const addProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacengeneral/addProveedor',
  async (nuevoProveedor: Proveedores) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/almacengeneral/proveedores`,
        nuevoProveedor,
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

// Obtener los proveedores registrados
export const getProveedores = createAsyncThunk<GetProveedoresResult, GetProveedoresOptions | void>(
  'almacengeneral/getProveedores',
  async (options, { getState }) => {
    const state = getState() as RootState;
    const shouldPaginate = Boolean(options?.paginated);

    if (!shouldPaginate && state.proveedor.pagination === null && state.proveedor.proveedores.length > 0) {
      return {
        success: true,
        proveedor: state.proveedor.proveedores,
        message: 'Proveedores cargados desde cache local',
      };
    }

    try {
      const queryParams = new URLSearchParams();

      if (shouldPaginate) {
        queryParams.set('paginated', '1');
        queryParams.set('page', String(options?.page ?? 1));
        queryParams.set('per_page', String(options?.perPage ?? 10));

        if (options?.search) {
          queryParams.set('search', options.search);
        }
      }

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/proveedores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
        withCredentials: true,
      });

      const proveedoresFormateados = response.data.data.map((proveedor: Proveedores) => {
        return {
          ...proveedor,
          created_at: proveedor.created_at
            ? formatDateHorasToFrontend(proveedor.created_at)
            : null,
          updated_at: proveedor.updated_at
            ? formatDateHorasToFrontend(proveedor.updated_at)
            : null,

        };
      });

      return {
        success: response.data.success,
        proveedor: proveedoresFormateados as Proveedores[],
        pagination: response.data.pagination,
        message: response.data.message,
      };
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
)

// Editar un proveedor
export const editProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacengeneral/editProveedor',
  async (proveedorEditado: Proveedores) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/almacengeneral/proveedores/${proveedorEditado.id_proveedor}`,
        proveedorEditado,
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

// Eliminar un proveedor
export const deleteProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacengeneral/deleteProveedor',
  async (proveedorEliminado: Proveedores) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/almacengeneral/proveedores/${proveedorEliminado.id_proveedor}`,
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

// Obtener los tipos de proveedores registrados
export const getTiposProveedores = createAsyncThunk<{ success: boolean; tiposProveedores?: []; message: string }>(
  'almacengeneral/getTiposProveedores',
  async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tipos-proveedor`, {
        withCredentials: true,
      });

      return { success: response.data.success, tiposProveedores: response.data.API_Response || [], message: response.data.message };
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

// Obtener los tipos de descuento registrados
export const getTiposDescuento = createAsyncThunk<{ success: boolean; descuentosProveedor?: []; message: string }>(
  'almacengeneral/getTiposDescuento',
  async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/descuentos-proveedor`, {
        withCredentials: true,
      });

      return { success: response.data.success, descuentosProveedor: response.data.API_Response || [], message: response.data.message };
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

