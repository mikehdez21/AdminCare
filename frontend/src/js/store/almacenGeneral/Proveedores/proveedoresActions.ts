import axios from 'axios';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar un nuevo proveedor
export const addProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacenGeneral/addProveedor',
  async (nuevoProveedor: Proveedores) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/proveedores',
        nuevoProveedor,
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

// Obtener los proveedores registrados
export const getProveedores = createAsyncThunk<{ success: boolean; proveedor?: Proveedores[]; message: string }>(
  'almacenGeneral/getProveedores',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/proveedores', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const proveedoresFormateados = response.data.data.map((proveedor: Proveedores) => {
        return {
          ...proveedor,
          created_at: proveedor.created_at
            ? formatDateHorasToFrontend(proveedor.created_at)
            : null,
          updated_at: proveedor.updated_at
            ? formatDateHorasToFrontend(proveedor.updated_at)
            : null,

        };
      });

      return { success: response.data.success, proveedor: proveedoresFormateados as Proveedores[], message: response.data.message };

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

// Editar un proveedor
export const editProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacenGeneral/editProveedor',
  async (proveedorEditado: Proveedores) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Incluir el id del proveedor en la URL para hacer la actualización correcta
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/proveedores/${proveedorEditado.id_proveedor}`,
        proveedorEditado,
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

// Eliminar un proveedor
export const deleteProveedor = createAsyncThunk<{ success: boolean; message: string }, Proveedores>(
  'almacenGeneral/deleteProveedor',
  async (proveedorEliminado: Proveedores) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/proveedores/${proveedorEliminado.id_proveedor}`,
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

// Obtener los tipos de proveedores registrados
export const getTiposProveedores = createAsyncThunk<{ success: boolean; tiposProveedores?: []; message: string }>(
  'almacenGeneral/getTiposProveedores',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/tipos-proveedor', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, tiposProveedores: response.data.API_Response || [], message: response.data.message };

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

// Obtener los tipos de descuento registrados
export const getTiposDescuento = createAsyncThunk<{ success: boolean; descuentosProveedor?: []; message: string }>(
  'almacenGeneral/getTiposDescuento',
  async () => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/descuentos-proveedor', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      return { success: response.data.success, descuentosProveedor: response.data.API_Response || [], message: response.data.message };
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

