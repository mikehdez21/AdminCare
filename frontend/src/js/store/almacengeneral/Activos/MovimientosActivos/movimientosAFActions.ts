import { isAxiosError } from 'axios';
import { MovimientosActivosFijos, VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de movimientos de activos fijos (vista).
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoVwMovimientosAF {
  success: boolean;
  vwMovimientosAF?: VwMovimientosAF[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo movimiento del activo fijo registrado en AddActivoFijo
export const addMovimientoActivoFijo = createAsyncThunk<{ success: boolean; message: string }, MovimientosActivosFijos>(
  'almacengeneral/addMovimientoActivoFijo',
  async (nuevoMovimientoActivo: MovimientosActivosFijos) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/almacengeneral/movimientos-activosfijos`,
        nuevoMovimientoActivo
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

// Obtener los movimientos de los activos registrados (TABLE)
export const getMovimientosActivosFijos = createAsyncThunk<{ success: boolean; movimientosAF?: MovimientosActivosFijos[], message: string }>(
  'almacengeneral/movimientosActivosFijos',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/movimientos-activosfijos`);

      const movimientosAFFormateados = response.data.data.map((movimientoAF: MovimientosActivosFijos) => {
        return {
          ...movimientoAF,
          fecha_movimiento: movimientoAF.fecha_movimiento
            ? formatDateHorasToFrontend(movimientoAF.fecha_movimiento)
            : null,
          created_at: movimientoAF.created_at
            ? formatDateHorasToFrontend(movimientoAF.created_at)
            : null,
          updated_at: movimientoAF.updated_at
            ? formatDateHorasToFrontend(movimientoAF.updated_at)
            : null,
        };
      });

      return { success: true, movimientosAF: movimientosAFFormateados, message: response.data.message };
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

// Editar un movimiento del activo fijo
export const editMovimientoActivoFijo = createAsyncThunk<{ success: boolean; message: string }, MovimientosActivosFijos>(
  'almacengeneral/editMovimientoActivoFijo',
  async (MovimientoActivoFijoEditado: MovimientosActivosFijos) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}/api/almacengeneral/movimientos-activosfijos/${MovimientoActivoFijoEditado.id_movimientoAF}`,
        MovimientoActivoFijoEditado
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

// Eliminar un movimiento de activo fijo
export const deleteMovimientoActivoFijo = createAsyncThunk<{ success: boolean; message: string }, MovimientosActivosFijos>(
  'almacengeneral/deleteMovimientoActivoFijo',
  async (MovimientoActivoFijoEliminado: MovimientosActivosFijos) => {
    try {

      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/almacengeneral/movimientos-activosfijos/${MovimientoActivoFijoEliminado.id_movimientoAF}`
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

// Obtener los movimientos de los activos registrados (VIEW).
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getVWmovimientosActivosFijos = createAsyncThunk<ResultadoVwMovimientosAF, PaginacionParams | void>(
  'almacengeneral/view-activosfijos',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/view-activosfijos`,
        params ? { params } : undefined,
      );

      const vwMovimientosAFFormateados = response.data.data.map((vwMovimientosAF: VwMovimientosAF) => {
        return {
          ...vwMovimientosAF,

          fecha_registro_af: vwMovimientosAF.fecha_registro_af
            ? formatDateHorasToFrontend(vwMovimientosAF.fecha_registro_af)
            : null,

          created_at: vwMovimientosAF.created_at
            ? formatDateHorasToFrontend(vwMovimientosAF.created_at)
            : null,

          updated_at: vwMovimientosAF.updated_at
            ? formatDateHorasToFrontend(vwMovimientosAF.updated_at)
            : null,
        };
      });

      return { success: true, vwMovimientosAF: vwMovimientosAFFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener los tipos de movimientos de los activos fijos
export const getTipoMovimientosActivosFijos = createAsyncThunk<{ success: boolean; tipoMovimientoAF?: [], message: string }>(
  'almacengeneral/tipo-movimientosActivosFijos',
  async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/tipos-movimientosaf`);
      return { success: true, tipoMovimientoAF: response.data.data, message: response.data.message };
    }
    catch (error) {
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
