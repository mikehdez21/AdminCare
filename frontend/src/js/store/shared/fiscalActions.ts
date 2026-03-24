import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';
import { createAsyncThunk } from '@reduxjs/toolkit';


// Obtener las formas de pago registrados
export const getFormasPago = createAsyncThunk<{success: boolean; formasPago?: []; message: string }>(
  'almacengeneral/getFormasPago',
  async () => {
    try{
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/formas-pago`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });
        
      return { success: response.data.success, formasPago: response.data.API_Response || [], message: response.data.message };
  
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


// Obtener los tipos de regimen registrados
export const getTiposRegimen = createAsyncThunk<{success: boolean; regimenesFiscales?: []; message: string }>(
  'almacengeneral/getTiposRegimen',
  async () => {
    try{
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


// Obtener los tipos de monedas registrados
export const getTiposMoneda = createAsyncThunk<{success: boolean; tiposMoneda?: []; message: string }>(
  'almacengeneral/getTiposMoneda',
  async () => {
    try{
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/tipos-moneda`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, tiposMoneda: response.data.API_Response || [], message: response.data.message };
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
export const getTiposFacturacion = createAsyncThunk<{success: boolean; tiposFacturacion?: []; message: string }>(
  'almacengeneral/getTiposFacturacion',
  async () => {
    try{
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