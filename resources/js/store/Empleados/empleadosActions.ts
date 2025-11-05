import axios from 'axios';
import { Empleados } from '@/@types/mainTypes';
import {formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar un nuevo empleado
export const addEmpleado = createAsyncThunk< { success: boolean; empleados?: Empleados[]; message: string }, { empleado: Empleados; fotoEmpleado: File | null; } >(
  '/addEmpleado',
  async ({ empleado, fotoEmpleado }) => {
    console.log('Empleado a agregar:', empleado);
    console.log('Foto del empleado:', fotoEmpleado);
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // FormData para enviar datos al servidor cuando el Content-Type es multipart/form-data
      // Esto es necesario para enviar archivos (como fotos) y otros datos

      const formData = new FormData();
      formData.append('nombre_empleado', empleado.nombre_empleado);
      formData.append('apellido_paterno', empleado.apellido_paterno);
      formData.append('apellido_materno', empleado.apellido_materno);
      formData.append('email_empleado', empleado.email_empleado);
      formData.append('telefono_empleado', empleado.telefono_empleado);
      formData.append('genero', empleado.genero);
      formData.append('fecha_nacimiento', empleado.fecha_nacimiento ? empleado.fecha_nacimiento.toString() : '');
      formData.append('estatus_activo', empleado.estatus_activo ? '1' : '0');
      formData.append('fecha_alta', empleado.fecha_alta ? empleado.fecha_alta.toString() : '');
      formData.append('fecha_baja', empleado.fecha_baja ? empleado.fecha_baja.toString() : '');
      if (fotoEmpleado) {
        formData.append('foto_empleado', fotoEmpleado);
      }
      formData.append('firma_movimientos', empleado.firma_movimientos);
      formData.append('id_departamento', empleado.id_departamento!.toString());

      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/admin/empleados',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );
      console.log(response);

      return { success: response.data.success, empleados: response.data.data as Empleados[], message: response.data.message };
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

// Obtener todos los empleados
export const getEmpleados = createAsyncThunk<{ success: boolean; empleados?: Empleados[]; message: string }, void>(
  '/getEmpleados',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get(
        'http://pruebas.hssadmincare.web/api/HSS1/admin/empleados',
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      )

      const empleadosFormateados = response.data.data.map((empleado: Empleados) => {
        return {
          ...empleado,
          created_at: empleado.created_at
            ? formatDateHorasToFrontend(empleado.created_at)
            : null,
          updated_at: empleado.updated_at
            ? formatDateHorasToFrontend(empleado.updated_at)
            : null,
      
        };
      });

      console.log('Empleados obtenidos:', empleadosFormateados);
    
      return { success: response.data.success, empleados: empleadosFormateados as Empleados[], message: response.data.message };
    
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

// Editar un empleado existente
export const editEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados>(
  '/editEmpleado',
  async (empleadoEditado: Empleados) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
      const formData = new FormData();

      formData.append('id_empleado', empleadoEditado.id_empleado!.toString());
      formData.append('nombre_empleado', empleadoEditado.nombre_empleado);
      formData.append('apellido_paterno', empleadoEditado.apellido_paterno);
      formData.append('apellido_materno', empleadoEditado.apellido_materno);
      formData.append('email_empleado', empleadoEditado.email_empleado);
      formData.append('telefono_empleado', empleadoEditado.telefono_empleado);
      formData.append('genero_empleado', empleadoEditado.genero);
      formData.append('fecha_nacimiento', empleadoEditado.fecha_nacimiento ? empleadoEditado.fecha_nacimiento.toString() : '');
      formData.append('estatus_activo', empleadoEditado.estatus_activo.toString());
      formData.append('fecha_alta', empleadoEditado.fecha_alta ? empleadoEditado.fecha_alta.toString() : '');
      formData.append('fecha_baja', empleadoEditado.fecha_baja ? empleadoEditado.fecha_baja.toString() : '');
      if (empleadoEditado.foto_empleado) {
        formData.append('foto_empleado', empleadoEditado.foto_empleado);
      }
      formData.append('firma_movimientos', empleadoEditado.firma_movimientos);
      formData.append('id_departamento', empleadoEditado.id_departamento!.toString());

      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/empleados/${empleadoEditado.id_empleado}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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

// Baja de un empleado (Inactivar el registro, no eliminarlo)
export const bajaEmpleado = createAsyncThunk<{ success: boolean; message: string }, Empleados
>(
  '/bajaEmpleado',
  async (empleadoBaja: Empleados) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      console.log('Empleado a dar de baja:', empleadoBaja);

      const getLocalDateTime = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
      };

      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/admin/empleados/${empleadoBaja.id_empleado}/bajaEmpleado`,
        {
          estatus_activo: false,
          fecha_baja: getLocalDateTime(),
        },
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