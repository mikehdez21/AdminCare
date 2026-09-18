import { isAxiosError } from 'axios';
import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// Agregar un nuevo Estatus de Activos Fijos
export const addEstatusAF = createAsyncThunk<{ success: boolean; message: string }, EstatusActivosFijos>(
  'almacengeneral/addEstatusAF',
  async (nuevoEstatus: EstatusActivosFijos) => {
    try {

      const response = await api.post(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-estatus`,
        nuevoEstatus
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

// Obtener los estatus de activos fijos registrados
export const getEstatusAF = createAsyncThunk<{ success: boolean; estatusAF?: EstatusActivosFijos[]; message: string }>(
  'almacengeneral/getEstatusAF',
  async () => {
    try {

      const response = await api.get(`${API_BASE_URL}/api/almacengeneral/activosfijos-estatus`);

      const estatusFormateados = response.data.data.map((estatus: EstatusActivosFijos) => ({
        ...estatus,
        created_at: estatus.created_at ? formatDateHorasToFrontend(estatus.created_at) : null,
        updated_at: estatus.updated_at ? formatDateHorasToFrontend(estatus.updated_at) : null,
      }));

      return { success: response.data.success, estatusAF: estatusFormateados, message: response.data.message };
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

// Editar un Estatus de Activos Fijos
export const editEstatusAF = createAsyncThunk<{ success: boolean; message: string }, EstatusActivosFijos>(
  'almacengeneral/editEstatusAF',
  async (estatusEditado: EstatusActivosFijos) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-estatus/${estatusEditado.id_estatusaf}`,
        estatusEditado
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

// Eliminar un Estatus de Activos Fijos
export const deleteEstatusAF = createAsyncThunk<{ success: boolean; message: string }, EstatusActivosFijos>(
  'almacengeneral/deleteEstatusAF',
  async (estatusEliminado: EstatusActivosFijos) => {
    try {

      const response = await api.delete(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-estatus/${estatusEliminado.id_estatusaf}`
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
