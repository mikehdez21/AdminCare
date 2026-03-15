import axios from 'axios';
import { Empleados } from '@/@types/mainTypes';
import { formatDateHorasToFrontend, formatDateNacimientoToFrontend, getFechaHoraActual } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Agregar un nuevo empleado
export const addEmpleado = createAsyncThunk<{ success: boolean; empleados?: Empleados[]; message: string }, FormData>(
  '/addEmpleado',
  async (nuevoEmpleado: FormData) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', {
        withCredentials: true,
      });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      console.log('EmpleadoToAdd:', nuevoEmpleado);

      const response = await axios.post('http://pruebas.hssadmincare.web/api/HSS1/admin/empleados', nuevoEmpleado, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });





      return {
        success: response.data.success,
        empleados: response.data.data as Empleados[],
        message: response.data.message,
      };
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

// Obtener todos los empleados
export const getEmpleados = createAsyncThunk<{ success: boolean; empleados?: Empleados[]; message: string }, void>(
  '/getEmpleados',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', {
        withCredentials: true,
      });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/admin/empleados', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

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
        message: response.data.message,
      };
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

// Editar un empleado existente
export const editEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados>(
  '/editEmpleado',
  async (empleadoEditado: Empleados) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', {
        withCredentials: true,
      });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/empleados/${empleadoEditado.id_empleado}`,
        empleadoEditado,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        },
      );

      return {
        success: response.data.success,
        message: response.data.message,
      };
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

// Baja de un empleado (Inactivar el registro, no eliminarlo)
export const bajaEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados>(
  '/bajaEmpleado',
  async (empleadoBaja: Empleados) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', {
        withCredentials: true,
      });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      console.log('Empleado a dar de baja:', empleadoBaja);

      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/empleados/${empleadoBaja.id_empleado}/bajaEmpleado`,
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

      return {
        success: response.data.success,
        message: response.data.message,
      };
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

/*
// Eliminar un empleado (Borrar completamente el registro)
export const deleteEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados>(
  '/deleteEmpleado',
  async (empleadoEliminado: Empleados) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/empleados/${empleadoEliminado.id_empleado}`,
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
*/
