import { isAxiosError } from 'axios';
import { User } from '@/@types/mainTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend, getFechaHoraActual } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de usuarios.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoUsuarios {
  success: boolean;
  users?: User[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo usuario
export const addUser = createAsyncThunk<{ success: boolean; users?: User[]; message: string }, User & { password: string }>(
  '/addUser',
  async (nuevoUsuario: User & { password: string }) => {
    try {

      const payload = {
        ...nuevoUsuario,
        usuario_compartido: nuevoUsuario.usuario_compartido || false,
        roles: nuevoUsuario.roles.map((role) => role.name),
      };

      const response = await api.post(`${API_BASE_URL}/api/admin/users`, payload);

      return { success: response.data.success, user: response.data.data as User, message: response.data.message };
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

// Obtener los usuarios registrados
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getUsers = createAsyncThunk<ResultadoUsuarios, PaginacionParams | void>(
  '/getUsers',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/admin/users`,
        params ? { params } : undefined,
      );

      // Transforma las fechas aquí
      const usuariosFormateados = response.data.data.map((usuario: User) => {
        return {
          ...usuario,
          created_at: usuario.created_at ? formatDateHorasToFrontend(usuario.created_at) : null,
          updated_at: usuario.updated_at ? formatDateHorasToFrontend(usuario.updated_at) : null,

          // Si hay más campos de fecha, agrégalos aquí
        };
      });

      return { success: response.data.success, users: usuariosFormateados as User[], meta: response.data.meta ?? null, message: response.data.message };
    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
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

// Editar un usuario
export const editUsuario = createAsyncThunk<{ success: boolean; message: string }, User & { password?: string }>(
  '/editUsuario',
  async (usuarioEditado: User & { password?: string }) => {
    try {

      const payload = {
        ...usuarioEditado,
        roles: usuarioEditado.roles.map((role) => role.name),
      };

      const response = await api.put(
        `${API_BASE_URL}/api/admin/users/${usuarioEditado.id_usuario}`,
        payload
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
  },
);

// Baja de usuario (is_active = false)
export const bajaUsuario = createAsyncThunk<{ success: boolean; message: string }, User>(
  '/bajaUsuario',
  async (usuarioBaja: User) => {
    try {

      // Incluir el id del usuario en la URL para hacer la baja correcta
      const response = await api.put(
        `${API_BASE_URL}/api/admin/users/${usuarioBaja.id_usuario}`,
        {
          estatus_activo: false,
          fecha_baja: getFechaHoraActual(),
        }
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
  },
);
