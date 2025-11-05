import axios from 'axios';
import { Clasificaciones } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar una nueva Clasificacion
export const addClasificacion = createAsyncThunk<{ success: boolean; message: string }, Clasificaciones>(
  'almacenGeneral/addClasificacion',
  async (nuevaClasificacion: Clasificaciones) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(nuevaClasificacion)
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/clasificaciones',
        nuevaClasificacion,
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

// Obtener las clasificaciones registradas
export const getClasificaciones = createAsyncThunk<{success: boolean; clasificacion?: Clasificaciones[]; message: string }>(
  'almacenGeneral/getClasificaciones',
  async () => {
    try{
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/clasificaciones', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });
      
      return { success: response.data.success, clasificacion: response.data.data as Clasificaciones[], message: response.data.message };

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

// Editar una clasificacion
export const editClasificacion = createAsyncThunk<{ success: boolean; message: string }, Clasificaciones>(
  'almacenGeneral/editClasificacion',
  async (clasificacionEditada: Clasificaciones) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del proveedor en la URL para hacer la actualización correcta
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/clasificaciones/${clasificacionEditada.id_clasificacion}`,
        clasificacionEditada,
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

// Eliminar un proveedor
export const deleteClasificacion = createAsyncThunk<{ success: boolean; message: string }, Clasificaciones>(
  'almacenGeneral/deleteClasificacion',
  async (clasificacionEliminada: Clasificaciones) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/proveedores/${clasificacionEliminada.id_clasificacion}`,
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