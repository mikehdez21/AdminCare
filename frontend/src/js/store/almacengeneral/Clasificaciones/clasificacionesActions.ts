import { isAxiosError } from 'axios';
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// Agregar una nueva Clasificacion
export const addClasificacion = createAsyncThunk<{ success: boolean; message: string }, ClasificacionesAF>(
  'almacengeneral/addClasificacion',
  async (nuevaClasificacion: ClasificacionesAF) => {
    try {
      console.log(nuevaClasificacion)
      const response = await api.post(
        `${API_BASE_URL}/api/almacengeneral/clasificaciones`,
        nuevaClasificacion
      );

      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
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
  'almacengeneral/getClasificaciones',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/clasificaciones`);

      const clasificacionesFormateadas = (Array.isArray(response.data.data) ? response.data.data : []).map((clasificacion: Partial<ClasificacionesAF>) => {
        return {
          ...clasificacion,
          nombre_clasificacion: typeof clasificacion.nombre_clasificacion === 'string'
            ? clasificacion.nombre_clasificacion
            : '',
          cuenta_contable: typeof clasificacion.cuenta_contable === 'string'
            ? clasificacion.cuenta_contable
            : '',
          created_at: clasificacion.created_at
            ? formatDateHorasToFrontend(clasificacion.created_at)
            : null,
          updated_at: clasificacion.updated_at
            ? formatDateHorasToFrontend(clasificacion.updated_at)
            : null,

        };
      });

      return { success: response.data.success, clasificacion: clasificacionesFormateadas as ClasificacionesAF[], message: response.data.message };

    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
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
  'almacengeneral/editClasificacion',
  async (clasificacionEditada: ClasificacionesAF) => {
    try {

      // Incluir el id de la clasificación en la URL para hacer la actualización correcta
      const response = await api.put(
        `${API_BASE_URL}/api/almacengeneral/clasificaciones/${clasificacionEditada.id_clasificacion}`,
        clasificacionEditada
      );

      console.log('updateAction', response.data.success)
      return { success: response.data.success, message: response.data.message };

    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
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
  'almacengeneral/deleteClasificacion',
  async (clasificacionEliminada: ClasificacionesAF) => {
    try {

      // Incluir el id de la clasificación en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/almacengeneral/clasificaciones/${clasificacionEliminada.id_clasificacion}`
      );

      return { success: response.data.success, message: response.data.message };

    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return {
        success: false,
        message: 'Error inesperado',
      };
    }
  }
);
