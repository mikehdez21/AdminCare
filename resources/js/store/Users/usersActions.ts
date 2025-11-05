import axios from 'axios';
import { User } from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar un nuevo usuario
export const addUser = createAsyncThunk<{success: boolean; users?: User[]; message: string }, User>(
  '/addUser',
  async (nuevoUsuario: User) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/admin/users',
        nuevoUsuario,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

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
  }
);

// Obtener los usuarios registrados
export const getUsers = createAsyncThunk<{success: boolean; users?: User[]; message: string }>(
  '/getUsers',
  async () => {
    try{
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/admin/users', {
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
          created_at: usuario.created_at
            ? formatDateHorasToFrontend(usuario.created_at)
            : null,
          updated_at: usuario.updated_at
            ? formatDateHorasToFrontend(usuario.updated_at)
            : null,
      
          // Si hay más campos de fecha, agrégalos aquí
        };
      });
      
      return { success: response.data.success, users: usuariosFormateados as User[], message: response.data.message };

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

// Editar un usuario
export const editUsuario = createAsyncThunk<{ success: boolean; message: string }, User>(
  '/editUsuario',
  async (usuarioEditado: User) => {
    console.log('dataUser_Recibida: ', usuarioEditado)
    
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Crear un FormData para incluir la foto de perfil (si existe)
      const formData = new FormData();
      
      // Incluir los campos de usuario
      formData.append('id_usuario', usuarioEditado.id_usuario!.toString());
      formData.append('nombre_usuario', usuarioEditado.nombre_usuario);
      formData.append('email', usuarioEditado.email_usuario);
      formData.append('password', usuarioEditado.password);
      formData.append('is_active', usuarioEditado.estatus_activo ? '1' : '0');
      formData.append('id_departamento', usuarioEditado.id_departamento!.toString());
 
      // Agregar roles (puedes hacer lo mismo si el usuario tiene roles asociados)
      usuarioEditado.roles.forEach((role) => {
        formData.append('roles[]', role.name);
      });



      // Incluir el id del usuario en la URL para hacer la actualización correcta
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/users/${usuarioEditado.id_usuario}`,
        formData,
        {
          headers: {
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

// Baja de usuario (is_active = false)
export const bajaUsuario = createAsyncThunk<{ success: boolean; message: string }, User>(
  '/bajaUsuario',
  async (usuarioBaja: User) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del usuario en la URL para hacer la baja correcta
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/users/${usuarioBaja.id_usuario}`,
        {
          is_active: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      console.log('bajaAction', response.data.success)
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



// Eliminar un usuario (Borrar completamente el registro)
/*
export const deleteUsuario = createAsyncThunk<{ success: boolean; message: string }, User>(
  '/deleteUsuario',
  async (usuarioEliminado: User) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del usuario en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/users/${usuarioEliminado.id_usuario}`,
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