import { isAxiosError } from 'axios';
import { Roles } from '@/@types/mainTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de roles.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoRoles {
  success: boolean;
  roles?: Roles[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo Rol
export const addRol = createAsyncThunk<{ success: boolean; message: string }, Roles>(
  '/addRol',
  async (nuevoRol: Roles) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/admin/roles`,
        nuevoRol
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

// Obtener los roles registrados
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getRoles = createAsyncThunk<ResultadoRoles, PaginacionParams | void>(
  '/getRoles',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/admin/roles`,
        params ? { params } : undefined,
      );

      // Transforma las fechas aquí
      const rolesFormateados = response.data.data.map((rol: Roles) => {
        return {
          ...rol,
          created_at: rol.created_at
            ? formatDateHorasToFrontend(rol.created_at)
            : null,
          updated_at: rol.updated_at
            ? formatDateHorasToFrontend(rol.updated_at)
            : null,

          // Si hay más campos de fecha, agrégalos aquí
        };
      });

      return { success: response.data.success, roles: rolesFormateados as Roles[], meta: response.data.meta ?? null, message: response.data.message };

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

// Editar un rol
export const editRol = createAsyncThunk<{ success: boolean; message: string }, Roles>(
  '/editRol',
  async (rolEditado: Roles) => {
    try {

      // Incluir el id del rol en la URL para hacer la actualización correcta
      const response = await api.put(
        `${API_BASE_URL}/api/admin/roles/${rolEditado.id}`,
        rolEditado
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

// Eliminar un rol
export const deleteRol = createAsyncThunk<{ success: boolean; message: string }, Roles>(
  '/deleteDepartamento',
  async (rolEliminado: Roles) => {
    try {

      // Incluir el id del rol en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/admin/roles/${rolEliminado.id}`
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
