import axios from 'axios';
import { User, Roles, Departamentos } from '@/@types/mainTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';

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
      // Obtener CSRF cookie para la protección del servidor
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });

      // Obtener token CSRF de la metaetiqueta si está disponible
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
      }


      // Realizar solicitud de inicio de sesión
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/auth/login',
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      console.log(response)


      // Retornar datos en caso de éxito
      return {
        success: response.data.success,
        userData: response.data.user as User,
        userRol: response.data.rol as Roles, // Roles específicos del usuario logueado
        userDepartamento: response.data.departamento as Departamentos, // Departamento específico del usuario
        message: response.data.message,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          success: false,
          message: error.response?.data?.message || 'Error en el servidor',
        });
      } else if (error instanceof Error) {
        return rejectWithValue({
          success: false,
          message: error.message,
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
        'http://pruebas.hssadmincare.web/api/HSS1/auth/logout',
        {},
        { withCredentials: true }
      );

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
