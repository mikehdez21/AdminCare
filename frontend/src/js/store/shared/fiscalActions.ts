import { isAxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// Obtener los tipos de regimen registrados
export const getTiposRegimen = createAsyncThunk<{ success: boolean; regimenesFiscales?: []; message: string }>(
  'almacengeneral/getTiposRegimen',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tipos-regimen`);

      return { success: response.data.success, regimenesFiscales: response.data.API_Response || [], message: response.data.message };
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

// Obtener los tipos de facturacion registrados
export const getTiposFacturacion = createAsyncThunk<{ success: boolean; tiposFacturacion?: []; message: string }>(
  'almacengeneral/getTiposFacturacion',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tipos-facturacion`);

      return { success: response.data.success, tiposFacturacion: response.data.API_Response || [], message: response.data.message };
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