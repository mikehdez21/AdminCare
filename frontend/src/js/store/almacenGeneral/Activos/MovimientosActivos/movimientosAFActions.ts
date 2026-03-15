import axios from 'axios';
import { MovimientosActivosFijos, VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import {formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';

// Agregar un nuevo movimiento del activo fijo registrado en AddActivoFijo
export const addMovimientoActivoFijo = createAsyncThunk<{ success: boolean; message: string }, MovimientosActivosFijos>(
  'almacenGeneral/addMovimientoActivoFijo',
  async (nuevoMovimientoActivo: MovimientosActivosFijos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/movimientos-activosfijos',
        nuevoMovimientoActivo,
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

// Obtener los movimientos de los activos registrados (TABLE)
export const getMovimientosActivosFijos = createAsyncThunk<{ success: boolean; movimientosAF?: MovimientosActivosFijos[], message: string }>(
  'almacenGeneral/movimientosActivosFijos',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/movimientos-activosfijos', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const movimientosAFFormateados = response.data.data.map((movimientoAF: MovimientosActivosFijos) => {
        return {
          ...movimientoAF,
          fecha_movimiento: movimientoAF.fecha_movimiento
            ? formatDateHorasToFrontend(movimientoAF.fecha_movimiento)
            : null,
          created_at: movimientoAF.created_at
            ? formatDateHorasToFrontend(movimientoAF.created_at)
            : null,
          updated_at: movimientoAF.updated_at
            ? formatDateHorasToFrontend(movimientoAF.updated_at)
            : null,
        };
      });

      return { success: true, movimientosAF: movimientosAFFormateados, message: response.data.message };
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

// Editar un movimiento del activo fijo
export const editMovimientoActivoFijo = createAsyncThunk<{ success: boolean; message: string }, MovimientosActivosFijos>(
  'almacenGeneral/editMovimientoActivoFijo',
  async (MovimientoActivoFijoEditado: MovimientosActivosFijos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/movimientos-activosfijos/${MovimientoActivoFijoEditado.id_movimientoAF}`,
        MovimientoActivoFijoEditado,
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

// Eliminar un movimiento de activo fijo
export const deleteMovimientoActivoFijo = createAsyncThunk<{ success: boolean; message: string }, MovimientosActivosFijos>(
  'almacenGeneral/deleteMovimientoActivoFijo',
  async (MovimientoActivoFijoEliminado: MovimientosActivosFijos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/movimientos-activosfijos/${MovimientoActivoFijoEliminado.id_movimientoAF}`,
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



// Obtener los movimientos de los activos registrados (VIEW)
export const getVWmovimientosActivosFijos = createAsyncThunk<{ success: boolean; vwMovimientosAF?: [], message: string }>(
  'almacenGeneral/view-activosfijos',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/view-activosfijos', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const vwMovimientosAFFormateados = response.data.data.map((vwMovimientosAF: VwMovimientosAF) => {
        return {
          ...vwMovimientosAF,

          fecha_compra_af: vwMovimientosAF.fecha_compra_af
            ? formatDateHorasToFrontend(vwMovimientosAF.fecha_compra_af)
            : null,

          fecha_registro_af: vwMovimientosAF.fecha_registro_af
            ? formatDateHorasToFrontend(vwMovimientosAF.fecha_registro_af)
            : null,

          created_at: vwMovimientosAF.created_at
            ? formatDateHorasToFrontend(vwMovimientosAF.created_at)
            : null,

          updated_at: vwMovimientosAF.updated_at
            ? formatDateHorasToFrontend(vwMovimientosAF.updated_at)
            : null, 
        };
      });

      return { success: true, vwMovimientosAF: vwMovimientosAFFormateados, message: response.data.message };
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



// Obtener los tipos de movimientos de los activos fijos
export const getTipoMovimientosActivosFijos = createAsyncThunk<{ success: boolean; tipoMovimientoAF?: [], message: string }>(
  'almacenGeneral/tipo-movimientosActivosFijos',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/tipos-movimientosaf', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });
      return { success: true, tipoMovimientoAF: response.data.data, message: response.data.message };
    }
    catch (error) {
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

