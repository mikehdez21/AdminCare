import axios from 'axios';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { API_BASE_URL } from '@/variableApi';
import type { RootState } from '@/store/store';


// Agregar un nuevo Tipo de Factura
export const addTipoFactura = createAsyncThunk<{ success: boolean; message: string }, TiposFacturasAF>(
  'almacengeneral/addTipoFactura',
  async (nuevoTipo: TiposFacturasAF) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/almacengeneral/tiposfacturas`,
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


// Obtener los tipos de factura registrados
export const getTiposFacturas = createAsyncThunk<{ success: boolean; tiposFacturas?: TiposFacturasAF[]; message: string }>(
  'almacengeneral/getTiposFacturas',
  async (_, { getState }) => {
    const state = getState() as RootState;

    if (state.tiposFacturas.tiposFacturasAF.length > 0) {
      return {
        success: true,
        tiposFacturas: state.tiposFacturas.tiposFacturasAF,
        message: 'Tipos de factura cargados desde cache local',
      };
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tiposfactura`, {
        withCredentials: true,
      });

      const tiposFormateados = response.data.data.map((tipo: TiposFacturasAF) => ({
        ...tipo,
        created_at: tipo.created_at ? formatDateHorasToFrontend(tipo.created_at) : null,
        updated_at: tipo.updated_at ? formatDateHorasToFrontend(tipo.updated_at) : null,
      }));

      return { success: response.data.success, tiposFacturas: tiposFormateados, message: response.data.message };
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


// Editar un Tipo de Factura
export const editTipoFactura = createAsyncThunk<{ success: boolean; message: string }, TiposFacturasAF>(
  'almacengeneral/editTipoFactura',
  async (tipoEditado: TiposFacturasAF) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/almacengeneral/tiposfacturas/${tipoEditado.id_tipofacturaaf}`,
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


// Eliminar un Tipo de Factura
export const deleteTipoFactura = createAsyncThunk<{ success: boolean; message: string }, TiposFacturasAF>(
  'almacengeneral/deleteTipoFactura',
  async (tipoEliminado: TiposFacturasAF) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/almacengeneral/tiposfacturas/${tipoEliminado.id_tipofacturaaf}`,
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
