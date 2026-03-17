import axios from 'axios';
import { User, Roles, Departamentos } from '@/@types/mainTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/variableApi';
// Definiciones de tipos

interface LoginCredentials {
  email_usuario: string;
  password: string;
}

interface LoginSuccessResponse {
  success: boolean;
  userData: User;
  userRol: Roles;
  userDepartamento: Departamentos;
  message: string;
}

interface LoginError {
  success: boolean;
  message: string;
}

// Acción para iniciar sesión
export const login = createAsyncThunk<
LoginSuccessResponse, // Tipos de datos retornados en caso de éxito
  LoginCredentials, // Tipos de datos esperados como parámetros
  { rejectValue: LoginError } // Tipos de datos retornados en caso de error
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    console.log(credentials)
    try {
      // 1. Obtener el CSRF cookie requerido por Sanctum SPA
      await axios.get(
        `${API_BASE_URL}/sanctum/csrf-cookie`,
        { withCredentials: true }
      );

      // 2. Realizar solicitud de inicio de sesión
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/auth/login`,
        credentials,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true, // Las cookies se manejan automáticamente
        }
      );

      console.log(response)

      // Retornar datos en caso de éxito
      return {
        success: response.data.success,
        userData: response.data.user as User,
        userRol: response.data.rol as Roles,
        userDepartamento: response.data.departamento as Departamentos,
        message: response.data.message,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        
        // Manejar diferentes tipos de errores basados en el status code
        let message = '';
        
        switch (status) {
        case 401:
          message = errorMessage || 'Credenciales inválidas';
          break;
        case 403:
          message = errorMessage || 'Acceso denegado';
          break;
        case 422:
          message = errorMessage || 'Datos inválidos';
          break;
        case 500:
          // Para errores de servidor (incluye errores de base de datos)
          message = errorMessage || 'Error interno del servidor';
          break;
        default:
          // Para errores de red u otros no clasificados
          if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
            message = 'Error de conexión. Verifica tu conexión a internet.';
          } else {
            message = errorMessage || 'Error en el servidor';
          }
        }
        
        return rejectWithValue({
          success: false,
          message: message,
        });
      } else if (error instanceof Error) {
        return rejectWithValue({
          success: false,
          message: 'Error de conexión',
        });
      }
    
      return rejectWithValue({
        success: false,
        message: 'Error desconocido',
      });
    }
    
  }
);

// Acción para cerrar sesión
export const logout = createAsyncThunk<
  { success: boolean; message: string }, // Tipos de datos retornados en caso de éxito
  void, // Sin parámetros
  { rejectValue: string } // Tipos de datos retornados en caso de error
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/auth/logout`,
        {},
        { withCredentials: true }
      );

      // Las cookies se limpian automáticamente en el servidor

      // Validar respuesta del backend
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return rejectWithValue(response.data.message || 'Error inesperado al cerrar sesión');
      }
    } catch (error) {
      // Manejo de errores
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Error inesperado al cerrar sesión');
      }

      return rejectWithValue('Error inesperado al cerrar sesión');
    }
  }
);
