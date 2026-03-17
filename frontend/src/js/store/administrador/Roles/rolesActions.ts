import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';
import { Roles } from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar un nuevo Rol
export const addRol = createAsyncThunk<{ success: boolean; message: string }, Roles>(
  '/addRol',
  async (nuevoRol: Roles) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/admin/roles`,
        nuevoRol,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
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
  }
);

// Obtener los roles registrados
export const getRoles = createAsyncThunk<{success: boolean; roles?: Roles[]; message: string }>(
  '/getRoles',
  async () => {
    try{
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/admin/roles`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

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

      return { success: response.data.success, roles: rolesFormateados as Roles[], message: response.data.message };

    } catch (error) {
      // Manejo de errores
      if (axios.isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: error.response.data.message || 'Error inesperado',
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
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del rol en la URL para hacer la actualización correcta
      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/admin/roles/${rolEditado.id}`,
        rolEditado,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      console.log('updateAction', response.data.success)
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

// Eliminar un rol
export const deleteRol = createAsyncThunk<{ success: boolean; message: string }, Roles>(
  '/deleteDepartamento',
  async (rolEliminado: Roles) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del rol en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/admin/roles/${rolEliminado.id}`,
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