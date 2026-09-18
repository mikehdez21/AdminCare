import { isAxiosError } from 'axios';
import { Empleados } from '@/@types/mainTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend, formatDateNacimientoToFrontend, getFechaHoraActual } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de empleados.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoEmpleados {
  success: boolean;
  empleados?: Empleados[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo empleado
export const addEmpleado = createAsyncThunk<{ success: boolean; empleados?: Empleados[]; message: string }, FormData>(
  '/addEmpleado',
  async (nuevoEmpleado: FormData) => {
    try {

      console.log('EmpleadoToAdd:', nuevoEmpleado);

      const response = await api.post(`${API_BASE_URL}/api/admin/empleados`, nuevoEmpleado);

      return {
        success: response.data.success,
        empleados: response.data.data as Empleados[],
        message: response.data.message,
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
  },
);

// Obtener todos los empleados
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getEmpleados = createAsyncThunk<ResultadoEmpleados, PaginacionParams | void>(
  '/getEmpleados',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/admin/empleados`,
        params ? { params } : undefined,
      );

      const empleadosFormateados = response.data.data.map((empleado: Empleados) => {
        return {
          ...empleado,
          fecha_nacimiento: empleado.fecha_nacimiento
            ? formatDateNacimientoToFrontend(empleado.fecha_nacimiento)
            : null,

          created_at: empleado.created_at ? formatDateHorasToFrontend(empleado.created_at) : null,
          updated_at: empleado.updated_at ? formatDateHorasToFrontend(empleado.updated_at) : null,
        };

      });

      return {
        success: response.data.success,
        empleados: empleadosFormateados as Empleados[],
        meta: response.data.meta ?? null,
        message: response.data.message,
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
  },
);

// Editar un empleado existente
export const editEmpleado = createAsyncThunk<{ success: boolean; message: string }, FormData>(
  '/editEmpleado',
  async (empleadoEditado: FormData) => {
    try {

      // Agregar el método PUT para Laravel
      empleadoEditado.append('_method', 'PUT');

      const response = await api.post(
        `${API_BASE_URL}/api/admin/empleados/${empleadoEditado.get('id_empleado')}`,
        empleadoEditado
      );

      return {
        success: response.data.success,
        message: response.data.message,
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
  },
);

// Baja de un empleado (Inactivar el registro, no eliminarlo)
export const bajaEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados>(
  '/bajaEmpleado',
  async (empleadoBaja: Empleados) => {
    try {

      console.log('Empleado a dar de baja:', empleadoBaja);

      const response = await api.put(
        `${API_BASE_URL}/api/admin/empleados/${empleadoBaja.id_empleado}/bajaEmpleado`,
        {
          estatus_activo: false,
          fecha_baja: getFechaHoraActual(),
        }
      );

      return {
        success: response.data.success,
        message: response.data.message,
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
  },
);

/*
// Eliminar un empleado (Borrar completamente el registro)
export const deleteEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados>(
  '/deleteEmpleado',
  async (empleadoEliminado: Empleados) => {
    try {
      const response = await api.delete(
        `${API_BASE_URL}/api/admin/empleados/${empleadoEliminado.id_empleado}`
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
*/
