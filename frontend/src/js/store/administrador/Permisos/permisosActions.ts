import { isAxiosError } from 'axios';
import { Permission } from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// Agregar un nuevo Permiso
export const addPermiso = createAsyncThunk<{ success: boolean; permisos?: Permission[]; message: string }, Permission>(
  '/addPermiso',
  async (nuevoPermiso: Permission) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/admin/permisos`,
        nuevoPermiso
      );

      const permisosData = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      const permisosResp = permisosData.filter(Boolean).map((perm: Permission) => ({
        ...perm,
        created_at: perm.created_at ? formatDateHorasToFrontend(perm.created_at) : null,
        updated_at: perm.updated_at ? formatDateHorasToFrontend(perm.updated_at) : null,
      }));

      return { success: response.data.success, permisos: permisosResp as Permission[], message: response.data.message };
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

// Obtener los permisos registrados
export const getPermisos = createAsyncThunk<{ success: boolean; permisos?: Permission[]; message: string }>(
  '/getPermisos',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/HSS1/admin/permisos`);

      const permisosFormateados = response.data.data.map((perm: Permission) => ({
        ...perm,
        created_at: perm.created_at ? formatDateHorasToFrontend(perm.created_at) : null,
        updated_at: perm.updated_at ? formatDateHorasToFrontend(perm.updated_at) : null,
      }));

      return { success: response.data.success, permisos: permisosFormateados as Permission[], message: response.data.message };

    } catch (error) {
      if (isAxiosError(error) && error.response) {
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

// Editar un permiso
export const editPermiso = createAsyncThunk<{ success: boolean; message: string }, Permission>(
  '/editPermiso',
  async (permisoEditado: Permission) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}/api/HSS1/admin/permisos/${permisoEditado.id}`,
        permisoEditado
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

// Eliminar un permiso
export const deletePermiso = createAsyncThunk<{ success: boolean; message: string }, Permission>(
  '/deletePermiso',
  async (permisoEliminado: Permission) => {
    try {

      const response = await api.delete(
        `${API_BASE_URL}/api/HSS1/admin/permisos/${permisoEliminado.id}`
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
