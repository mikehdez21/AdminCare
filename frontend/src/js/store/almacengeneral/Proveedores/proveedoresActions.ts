import { isAxiosError } from 'axios';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de proveedores.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoProveedores {
  success: boolean;
  proveedores?: Proveedores[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo proveedor
export const addProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacengeneral/addProveedor',
  async (nuevoProveedor: Proveedores) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/almacengeneral/proveedores`,
        nuevoProveedor
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

// Obtener los proveedores registrados.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getProveedores = createAsyncThunk<ResultadoProveedores, PaginacionParams | void>(
  'almacengeneral/getProveedores',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/proveedores`,
        params ? { params } : undefined,
      );

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

      return { success: response.data.success, proveedores: proveedoresFormateados as Proveedores[], meta: response.data.meta ?? null, message: response.data.message };

    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        });
      }

      return ({
        success: false,
        message: 'Error inesperado',
      });
    }
  }
)

// Editar un proveedor
export const editProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacengeneral/editProveedor',
  async (proveedorEditado: Proveedores) => {
    try {

      // Incluir el id del proveedor en la URL para hacer la actualización correcta
      const response = await api.put(
        `${API_BASE_URL}/api/almacengeneral/proveedores/${proveedorEditado.id_proveedor}`,
        proveedorEditado
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

// Eliminar un proveedor
export const deleteProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacengeneral/deleteProveedor',
  async (proveedorEliminado: Proveedores) => {
    try {

      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/almacengeneral/proveedores/${proveedorEliminado.id_proveedor}`
      );

      console.log('deleteAction', response.data.success)
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

// Obtener los tipos de proveedores registrados
export const getTiposProveedores = createAsyncThunk<{ success: boolean; tiposProveedores?: []; message: string }>(
  'almacengeneral/getTiposProveedores',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/tipos-proveedor`);

      return { success: response.data.success, tiposProveedores: response.data.API_Response || [], message: response.data.message };

    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        });
      }

      return ({
        success: false,
        message: 'Error inesperado',
      });
    }
  }
)

// Obtener los tipos de descuento registrados
export const getTiposDescuento = createAsyncThunk<{ success: boolean; descuentosProveedor?: []; message: string }>(
  'almacengeneral/getTiposDescuento',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/descuentos-proveedor`);

      return { success: response.data.success, descuentosProveedor: response.data.API_Response || [], message: response.data.message };
    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        });
      }

      return ({
        success: false,
        message: 'Error inesperado',
      });
    }
  }
)
