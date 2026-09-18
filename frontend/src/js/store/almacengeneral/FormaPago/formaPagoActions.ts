import { isAxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { FormasPago } from '@/@types/fiscalTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// Agregar una nueva Forma de Pago
export const addFormaPago = createAsyncThunk<{ success: boolean; message: string }, FormasPago>(
  'almacengeneral/addFormaPago',
  async (nuevaFormaPago: FormasPago) => {
    try {

      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/almacengeneral/formaspago`,
        nuevaFormaPago
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

// Obtener las formas de pago registradas
export const getFormasPago = createAsyncThunk<{ success: boolean; formasPago?: []; message: string }>(
  'almacengeneral/getFormasPago',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/HSS1/almacengeneral/formaspago`);

      const formasPagoFormateadas = response.data.data.map((forma: FormasPago) => ({
        ...forma,
        created_at: forma.created_at ? formatDateHorasToFrontend(forma.created_at) : null,
        updated_at: forma.updated_at ? formatDateHorasToFrontend(forma.updated_at) : null,
      }));

      return { success: response.data.success, formasPago: formasPagoFormateadas, message: response.data.message };
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

// Editar una Forma de Pago
export const editFormaPago = createAsyncThunk<{ success: boolean; message: string }, FormasPago>(
  'almacengeneral/editFormaPago',
  async (formaEditada: FormasPago) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}/api/HSS1/almacengeneral/formaspago/${formaEditada.id_formapago}`,
        formaEditada
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

// Eliminar una Forma de Pago
export const deleteFormaPago = createAsyncThunk<{ success: boolean; message: string }, FormasPago>(
  'almacengeneral/deleteFormaPago',
  async (formaEliminada: FormasPago) => {
    try {

      const response = await api.delete(
        `${API_BASE_URL}/api/HSS1/almacengeneral/formaspago/${formaEliminada.id_formapago}`
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
