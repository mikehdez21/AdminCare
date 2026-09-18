import { isAxiosError } from 'axios';
import { Ubicaciones, ActivosUbicacionApiResponse } from '@/@types/mainTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de ubicaciones.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoUbicaciones {
  success: boolean;
  ubicaciones?: Ubicaciones[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar una nueva Ubicación
export const addUbicacion = createAsyncThunk<{ success: boolean; message: string }, Ubicaciones>(
  '/addUbicacion',
  async (nuevaUbicacion: Ubicaciones) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/admin/ubicaciones`,
        nuevaUbicacion
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

// Obtener las ubicaciones registradas
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getUbicaciones = createAsyncThunk<ResultadoUbicaciones, PaginacionParams | void>(
  '/getUbicaciones',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/admin/ubicaciones`,
        params ? { params } : undefined,
      );

      const ubicacionesFormateadas = response.data.data.map((ubicacion: Ubicaciones) => {
        return {
          ...ubicacion,
          created_at: ubicacion.created_at
            ? formatDateHorasToFrontend(ubicacion.created_at)
            : null,
          updated_at: ubicacion.updated_at
            ? formatDateHorasToFrontend(ubicacion.updated_at)
            : null,

        };
      });

      return { success: response.data.success, ubicaciones: ubicacionesFormateadas as Ubicaciones[], meta: response.data.meta ?? null, message: response.data.message };

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

// Editar una ubicación
export const editUbicacion = createAsyncThunk<{ success: boolean; message: string }, Ubicaciones>(
  '/editUbicacion',
  async (ubicacionEditada: Ubicaciones) => {
    try {

      // Incluir el id de la ubicación en la URL para hacer la actualización correcta
      const response = await api.put(
        `${API_BASE_URL}/api/admin/ubicaciones/${ubicacionEditada.id_ubicacion}`,
        ubicacionEditada
      );

      console.log('updateAction', response.data.success)
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

// Eliminar una ubicación
export const deleteUbicacion = createAsyncThunk<{ success: boolean; message: string }, Ubicaciones>(
  '/deleteUbicacion',
  async (ubicacionEliminada: Ubicaciones) => {
    try {

      // Incluir el id de la ubicación en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/admin/ubicaciones/${ubicacionEliminada.id_ubicacion}`
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

// Obtener activos asociados a una ubicación específica
export const getActivosUbicacion = createAsyncThunk<ActivosUbicacionApiResponse, number>(
  'almacengeneral/getActivosUbicacion',
  async (idUbicacion: number) => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/activosfijos/ubicacion/${idUbicacion}`);

      return { success: response.data.success, activosUbicacion: response.data.data || [], message: response.data.message };
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
