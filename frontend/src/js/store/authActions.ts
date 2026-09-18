import { isAxiosError } from 'axios';
import { User } from '@/@types/mainTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from './shared/errorMessage';

// Definiciones de tipos

interface LoginCredentials {
  user: string;
  password: string;
}

export interface AuthPayloadResponse {
  success: boolean;
  userData: User | null;
  userRol: string;
  userRolPermissions: string[];
  userDepartamento: string;
  message: string;
}

interface RefreshPermissionsResponse {
  success: boolean;
  permissions: string[];
  message: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
  sessionInvalid?: boolean;
}

// Acción para iniciar sesión
export const login = createAsyncThunk<AuthPayloadResponse, LoginCredentials>(
  'auth/login',
  async (credentials) => {

    try {
      // Realizar solicitud de inicio de sesión
      // (El interceptor de api se encarga del csrf-cookie y el header X-CSRF-TOKEN)
      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/auth/login`,
        credentials,
      );

      // Retornar datos en caso de éxito
      return {
        success: response.data.success,
        userData: response.data.user as User,
        userRol: response.data.rol as string,
        userRolPermissions: response.data.permissions as string[],
        userDepartamento: response.data.departamento as string,
        message: response.data.message,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const rawMessage = getBackendErrorMessage(error.response?.data, '');

        // Manejar diferentes tipos de errores basados en el status code
        let message = '';

        switch (status) {
        case 401:
          message = rawMessage || 'Credenciales inválidas';
          break;
        case 403:
          message = rawMessage || 'Acceso denegado';
          break;
        case 422:
          message = rawMessage || 'Datos inválidos';
          break;
        case 500:
          // Para errores de servidor (incluye errores de base de datos)
          message = rawMessage || 'Error interno del servidor';
          break;
        default:
          // Para errores de red u otros no clasificados
          if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
            message = 'Error de conexión. Verifica tu conexión a internet.';
          } else {
            message = rawMessage || 'Error en el servidor';
          }
        }

        return {
          success: false,
          userData: null,
          userRol: '',
          userRolPermissions: [],
          userDepartamento: '',
          message,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          userData: null,
          userRol: '',
          userRolPermissions: [],
          userDepartamento: '',
          message: 'Error de conexión',
        };
      }

      return {
        success: false,
        userData: null,
        userRol: '',
        userRolPermissions: [],
        userDepartamento: '',
        message: 'Error desconocido',
      };
    }

  }
);

// Acción para refrescar permisos del usuario autenticado
export const refreshAuthPermissions = createAsyncThunk<RefreshPermissionsResponse, void>(
  'auth/refreshPermissions',
  async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/HSS1/auth/permissions`);

      return {
        success: response.data.success,
        permissions: response.data.permissions as string[],
        message: response.data.message,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        return {
          success: false,
          permissions: [],
          message: getBackendErrorMessage(error.response?.data, 'Error al refrescar permisos'),
        };
      }

      return {
        success: false,
        permissions: [],
        message: 'Error desconocido al refrescar permisos',
      };
    }
  }
);

// Acción para cerrar sesión
export const logout = createAsyncThunk<LogoutResponse, void>(
  'auth/logout',
  async () => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/auth/logout`,
        {},
      );

      // Validar respuesta del backend
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          message: getBackendErrorMessage(response.data, 'Error inesperado al cerrar sesión'),
        };
      }
    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado al cerrar sesión'),
        };
      }

      return {
        success: false,
        message: 'Error inesperado al cerrar sesión',
      };
    }
  }
);

// Acción para verificar la sesión activa con el servidor
export const checkAuthSession = createAsyncThunk<AuthPayloadResponse, void>(
  'auth/checkSession',
  async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/HSS1/auth/check`);
      if (response.data.success) {
        return {
          success: true,
          userData: response.data.user as User,
          userRol: response.data.rol as string,
          userRolPermissions: response.data.permissions as string[],
          userDepartamento: response.data.departamento as string,
          message: response.data.message,
        };
      }
      return {
        success: false,
        userData: null,
        userRol: '',
        userRolPermissions: [],
        userDepartamento: '',
        message: getBackendErrorMessage(response.data, 'No autenticado'),
      };
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const rawMessage = getBackendErrorMessage(error.response?.data, '');
        if (status === 401 || status === 403 || status === 419) {
          return {
            success: false,
            userData: null,
            userRol: '',
            userRolPermissions: [],
            userDepartamento: '',
            message: rawMessage || 'Sesión no válida',
          };
        }
        return {
          success: false,
          userData: null,
          userRol: '',
          userRolPermissions: [],
          userDepartamento: '',
          message: rawMessage || 'Error al verificar sesión',
        };
      }
      return {
        success: false,
        userData: null,
        userRol: '',
        userRolPermissions: [],
        userDepartamento: '',
        message: 'Error de conexión',
      };
    }
  }
);
