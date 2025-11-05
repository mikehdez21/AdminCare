import axios from 'axios';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import {formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';

// Agregar un nuevo activo
export const addActivoFijo = createAsyncThunk<{ success: boolean; message: string }, ActivosFijos>(
  'almacenGeneral/addActivoFijo',
  async (nuevoActivo: ActivosFijos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/activosfijos',
        nuevoActivo,
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

// Obtener los activos registrados
export const getActivosFijos = createAsyncThunk<{ success: boolean; activos?: ActivosFijos[], message: string }>(
  'almacenGeneral/getActivos',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/activosfijos', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const activosFormateados = response.data.data.map((activo: ActivosFijos) => {
        return {
          ...activo,
          fecha_adquisicion_af: activo.fecha_adquisicion_af
            ? formatDateHorasToFrontend(activo.fecha_adquisicion_af)
            : null,

          created_at: activo.created_at
            ? formatDateHorasToFrontend(activo.created_at)
            : null,

          updated_at: activo.updated_at
            ? formatDateHorasToFrontend(activo.updated_at)
            : null, 
        };
      });

      return { success: true, activos: activosFormateados, message: response.data.message };
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

// Editar un activo

// Eliminar un activo
