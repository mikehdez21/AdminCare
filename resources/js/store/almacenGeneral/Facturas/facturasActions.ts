import axios from 'axios';
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import {formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar una nueva factura
export const addFactura = createAsyncThunk<{ success: boolean; message: string }, FacturasAF>(
  'almacenGeneral/addFactura',
  async (nuevaFactura: FacturasAF) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas',
        nuevaFactura,
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

// Obtener las facturas registradas
export const getFacturas = createAsyncThunk<{success: boolean; facturas?: FacturasAF[], message: string }>(
  'almacenGeneral/getFacturas',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/facturas', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });
    
      const facturasFormateadas = response.data.data.map((factura: FacturasAF) => {
        return {
          ...factura,
          fecha_fac_emision: factura.fecha_fac_emision
            ? formatDateHorasToFrontend(factura.fecha_fac_emision)
            : null,

          fecha_fac_recepcion: factura.fecha_fac_recepcion
            ? formatDateHorasToFrontend(factura.fecha_fac_recepcion)
            : null,

          created_at: factura.created_at
            ? formatDateHorasToFrontend(factura.created_at)
            : null,

          updated_at: factura.updated_at
            ? formatDateHorasToFrontend(factura.updated_at) 
            : null,
        };
      });
    
      return { success: true, facturas: facturasFormateadas, message: response.data.message };
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

// Editar una factura

// Eliminar una factura
