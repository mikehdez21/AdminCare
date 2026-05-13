import axios from 'axios';
import { TiposMoneda } from '@/@types/fiscalTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { API_BASE_URL } from '@/variableApi';


// Agregar un nuevo Tipo de Moneda
export const addTipoMoneda = createAsyncThunk<{ success: boolean; message: string }, TiposMoneda>(
  'almacengeneral/addTipoMoneda',
  async (nuevoTipo: TiposMoneda) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/almacengeneral/tiposmoneda`,
        nuevoTipo,
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


// Obtener los tipos de moneda registrados
export const getTiposMoneda = createAsyncThunk<{ success: boolean; tiposMoneda?: []; message: string }>(
  'almacengeneral/getTiposMoneda',
  async () => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tiposmoneda`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const tiposFormateados = response.data.data.map((tipo: TiposMoneda) => ({
        ...tipo,
        created_at: tipo.created_at ? formatDateHorasToFrontend(tipo.created_at) : null,
        updated_at: tipo.updated_at ? formatDateHorasToFrontend(tipo.updated_at) : null,
      }));

      return { success: response.data.success, tiposMoneda: tiposFormateados, message: response.data.message };
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


// Editar un Tipo de Moneda
export const editTipoMoneda = createAsyncThunk<{ success: boolean; message: string }, TiposMoneda>(
  'almacengeneral/editTipoMoneda',
  async (tipoEditado: TiposMoneda) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/almacengeneral/tiposmoneda/${tipoEditado.id_tipomoneda}`,
        tipoEditado,
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


// Eliminar un Tipo de Moneda
export const deleteTipoMoneda = createAsyncThunk<{ success: boolean; message: string }, TiposMoneda>(
  'almacengeneral/deleteTipoMoneda',
  async (tipoEliminado: TiposMoneda) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/almacengeneral/tiposmoneda/${tipoEliminado.id_tipomoneda}`,
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
