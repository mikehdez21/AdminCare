import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';
import { Ubicaciones, ActivosUbicacionApiResponse} from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar una nueva Ubicación
export const addUbicacion = createAsyncThunk<{ success: boolean; message: string }, Ubicaciones>(
  '/addUbicacion',
  async (nuevaUbicacion: Ubicaciones) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/admin/ubicaciones`,
        nuevaUbicacion,
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

// Obtener las ubicaciones registradas
export const getUbicaciones = createAsyncThunk<{success: boolean; ubicaciones?: Ubicaciones[]; message: string }>(
  '/getUbicaciones',
  async () => {
    try{
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/admin/ubicaciones`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const ubicacionesFormateadas = response.data.data.map((ubicacion: Ubicaciones) => {
        return {
          ...ubicacion,
          created_at: ubicacion.created_at
            ? formatDateHorasToFrontend(ubicacion.created_at)
            : null,
          updated_at: ubicacion.updated_at
            ? formatDateHorasToFrontend(ubicacion   .updated_at)
            : null,

        };
      });

      return { success: response.data.success, ubicaciones: ubicacionesFormateadas as Ubicaciones[], message: response.data.message };

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

// Editar una ubicación
export const editUbicacion = createAsyncThunk<{ success: boolean; message: string }, Ubicaciones>(
  '/editUbicacion',
  async (ubicacionEditada: Ubicaciones) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id de la ubicación en la URL para hacer la actualización correcta
      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/admin/ubicaciones/${ubicacionEditada.id_ubicacion}`,
        ubicacionEditada,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      console.log('updateAction', response.data.success)
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

// Eliminar una ubicación
export const deleteUbicacion = createAsyncThunk<{ success: boolean; message: string }, Ubicaciones>(
  '/deleteUbicacion',
  async (ubicacionEliminada: Ubicaciones) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id de la ubicación en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/admin/ubicaciones/${ubicacionEliminada.id_ubicacion}`,
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

// Obtener activos asociados a una ubicación específica
export const getActivosUbicacion = createAsyncThunk<ActivosUbicacionApiResponse, number>(
  'almacenGeneral/getActivosUbicacion',
  async (idUbicacion: number) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos/ubicacion/${idUbicacion}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });
    
      return { success: response.data.success, activosUbicacion: response.data.data || [], message: response.data.message };
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