import axios from 'axios';
import { User } from '@/@types/mainTypes';
import { formatDateHorasToFrontend, getFechaHoraActual } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/variableApi';

// Agregar un nuevo usuario
export const addUser = createAsyncThunk<{ success: boolean; users?: User[]; message: string }, User>(
  '/addUser',
  async (nuevoUsuario: User) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const payload = {
        ...nuevoUsuario,
        usuario_compartido: nuevoUsuario.usuario_compartido || false,
        roles: nuevoUsuario.roles.map((role) => role.name),
      };

      const response = await axios.post(`${API_BASE_URL}/api/HSS1/admin/users`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, user: response.data.data as User, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
export const getUsers = createAsyncThunk<{ success: boolean; users?: User[]; message: string }>(
  '/getUsers',
  async () => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      // Transforma las fechas aquí
      const usuariosFormateados = response.data.data.map((usuario: User) => {
        return {
          ...usuario,
          created_at: usuario.created_at ? formatDateHorasToFrontend(usuario.created_at) : null,
          updated_at: usuario.updated_at ? formatDateHorasToFrontend(usuario.updated_at) : null,

          // Si hay más campos de fecha, agrégalos aquí
        };
      });

      return { success: response.data.success, users: usuariosFormateados as User[], message: response.data.message };
    } catch (error) {
      // Manejo de errores
      if (axios.isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
export const editUsuario = createAsyncThunk<{ success: boolean; message: string }, User>(
  '/editUsuario',
  async (usuarioEditado: User) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const payload = {
        ...usuarioEditado,
        roles: usuarioEditado.roles.map((role) => role.name),
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/admin/users/${usuarioEditado.id_usuario}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        },
      );

      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      console.log('Usuario a dar de baja:', usuarioBaja);

      // Incluir el id del usuario en la URL para hacer la baja correcta
      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/admin/users/${usuarioBaja.id_usuario}`,
        {
          estatus_activo: false,
          fecha_baja: getFechaHoraActual(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        },
      );

      console.log('bajaAction', response.data.success);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
        };
      }

      return {
        success: false,
        message: 'Error inesperado',
      };
    }
  },
);

// Eliminar un usuario (Borrar completamente el registro)
/*
export const deleteUsuario = createAsyncThunk<{ success: boolean; message: string }, User>(
  '/deleteUsuario',
  async (usuarioEliminado: User) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie` , { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del usuario en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/admin/users/${usuarioEliminado.id_usuario}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      console.log('deleteAction', response.data.success)
      return { success: response.data.success, message: response.data.message };
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
