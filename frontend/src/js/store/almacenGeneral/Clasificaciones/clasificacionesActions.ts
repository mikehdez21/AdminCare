import axios from 'axios';
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';


// Agregar una nueva Clasificacion
export const addClasificacion = createAsyncThunk<{ success: boolean; message: string }, ClasificacionesAF>(
  'almacenGeneral/addClasificacion',
  async (nuevaClasificacion: ClasificacionesAF) => {
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
export const getClasificaciones = createAsyncThunk<{ success: boolean; clasificacion?: ClasificacionesAF[]; message: string }>(
  'almacenGeneral/getClasificaciones',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/clasificaciones', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const clasificacionesFormateadas = response.data.data.map((clasificacion: ClasificacionesAF) => {
        return {
          ...clasificacion,
          created_at: clasificacion.created_at
            ? formatDateHorasToFrontend(clasificacion.created_at)
            : null,
          updated_at: clasificacion.updated_at
            ? formatDateHorasToFrontend(clasificacion.updated_at)
            : null,

        };
      });

      return { success: response.data.success, clasificacion: clasificacionesFormateadas, message: response.data.message };

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

// Editar una clasificación
export const editClasificacion = createAsyncThunk<{ success: boolean; message: string }, ClasificacionesAF>(
  'almacenGeneral/editClasificacion',
  async (clasificacionEditada: ClasificacionesAF) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      // Incluir el id de la clasificación en la URL para hacer la actualización correcta
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

// Eliminar una clasificación
export const deleteClasificacion = createAsyncThunk<{ success: boolean; message: string }, ClasificacionesAF>(
  'almacenGeneral/deleteClasificacion',
  async (clasificacionEliminada: ClasificacionesAF) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      // Incluir el id de la clasificación en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/clasificaciones/${clasificacionEliminada.id_clasificacion}`,
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