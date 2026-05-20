import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/variableApi';
import type { RootState } from '@/store/store';


// Obtener los tipos de regimen registrados
export const getTiposRegimen = createAsyncThunk<{ success: boolean; regimenesFiscales?: []; message: string }>(
  'almacengeneral/getTiposRegimen',
  async (_, { getState }) => {
    const state = getState() as RootState;

    if (state.fiscal.regimenesFiscales.length > 0) {
      return {
        success: true,
        regimenesFiscales: state.fiscal.regimenesFiscales as [],
        message: 'Regimenes fiscales cargados desde cache local',
      };
    }

    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tipos-regimen`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, regimenesFiscales: response.data.API_Response || [], message: response.data.message };
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


// Obtener los tipos de facturacion registrados
export const getTiposFacturacion = createAsyncThunk<{ success: boolean; tiposFacturacion?: []; message: string }>(
  'almacengeneral/getTiposFacturacion',
  async (_, { getState }) => {
    const state = getState() as RootState;

    if (state.fiscal.tiposFacturacion.length > 0) {
      return {
        success: true,
        tiposFacturacion: state.fiscal.tiposFacturacion as [],
        message: 'Tipos de facturacion cargados desde cache local',
      };
    }

    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tipos-facturacion`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, tiposFacturacion: response.data.API_Response || [], message: response.data.message };
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