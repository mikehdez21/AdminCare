import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Agregar un nuevo activo
export const addActivoFijo = createAsyncThunk<{ success: boolean; activofijo?: ActivosFijos; message: string }, ActivosFijos>(
  'almacenGeneral/addActivoFijo',
  async (nuevoActivo: ActivosFijos) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos`,
        nuevoActivo,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        }
      );

      return { success: response.data.success, activofijo: response.data.data as ActivosFijos, message: response.data.message, };
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
  },
);

// Obtener TODOS los activos registrados
export const getActivosFijos = createAsyncThunk<{ success: boolean; activosFijos?: ActivosFijos[], message: string }>(
  'almacenGeneral/getActivos',
  async () => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,

          created_at: activosFijos.created_at
            ? formatDateHorasToFrontend(activosFijos.created_at)
            : null,

          updated_at: activosFijos.updated_at
            ? formatDateHorasToFrontend(activosFijos.updated_at)
            : null,
        };
      });

      return { success: true, activosFijos: activosFormateados, message: response.data.message };
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
export const editActivoFijo = createAsyncThunk<{ success: boolean; message: string }, ActivosFijos>(
  'almacenGeneral/editActivoFijo',
  async (activoFijoEditado: ActivosFijos) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      const response = await axios.put(
        `${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos/${activoFijoEditado.id_activo_fijo}`,
        activoFijoEditado,
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

// Eliminar un activo
export const deleteActivoFijo = createAsyncThunk<{ success: boolean; message: string }, ActivosFijos>(
  'almacenGeneral/deleteActivoFijo',
  async (activoFijoEliminado: ActivosFijos) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);

      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos/${activoFijoEliminado.id_activo_fijo}`,
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

// Obtener los estatus de los Activos Fijos
export const getEstatusActivosFijos = createAsyncThunk<{ success: boolean; estatusAF?: []; message: string }>(
  'almacenGeneral/getEstatusActivosFijos',
  async () => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/tipos-estatusaf`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });


      return { success: response.data.success, estatusAF: response.data.API_Response || [], message: response.data.message };
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
);



//  Activos Fijos Filtrados //

// Obtener ActivosFijos por Departamento
export const getActivosFijosPorDepartamento = createAsyncThunk<{ success: boolean; activosFijos?: ActivosFijos[], message: string }, number>(
  'almacenGeneral/getActivosFijosPorDepartamento',
  async (id_departamento: number) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos/departamento/${id_departamento}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
          fecha_compra_af: activosFijos.fecha_compra_af
            ? formatDateHorasToFrontend(activosFijos.fecha_compra_af)
            : null,

          fecha_registro_af: activosFijos.fecha_registro_af
            ? formatDateHorasToFrontend(activosFijos.fecha_registro_af)
            : null,

          created_at: activosFijos.created_at
            ? formatDateHorasToFrontend(activosFijos.created_at)
            : null,

          updated_at: activosFijos.updated_at
            ? formatDateHorasToFrontend(activosFijos.updated_at)
            : null,
        };
      });

      return { success: response.data.success, activosFijos: activosFormateados, message: response.data.message };
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

// Obtener ActivosFijos por Ubicacion
export const getActivosFijosPorUbicacion = createAsyncThunk<{ success: boolean; activosFijos?: ActivosFijos[], message: string }, number>(
  'almacenGeneral/getActivosFijosPorUbicacion',
  async (id_ubicacion: number) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos/ubicacion/${id_ubicacion}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
          fecha_compra_af: activosFijos.fecha_compra_af
            ? formatDateHorasToFrontend(activosFijos.fecha_compra_af)
            : null,

          fecha_registro_af: activosFijos.fecha_registro_af
            ? formatDateHorasToFrontend(activosFijos.fecha_registro_af)
            : null,

          created_at: activosFijos.created_at
            ? formatDateHorasToFrontend(activosFijos.created_at)
            : null,

          updated_at: activosFijos.updated_at
            ? formatDateHorasToFrontend(activosFijos.updated_at)
            : null,
        };
      });

      return { success: response.data.success, activosFijos: activosFormateados, message: response.data.message };
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

// Obtener ActivosFijos por Clasificacion
export const getActivosFijosPorClasificacion = createAsyncThunk<{ success: boolean; activosFijos?: ActivosFijos[], message: string }, number>(
  'almacenGeneral/getActivosFijosPorClasificacion',
  async (id_clasificacion: number) => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos/clasificacion/${id_clasificacion}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
          fecha_compra_af: activosFijos.fecha_compra_af
            ? formatDateHorasToFrontend(activosFijos.fecha_compra_af)
            : null,

          fecha_registro_af: activosFijos.fecha_registro_af
            ? formatDateHorasToFrontend(activosFijos.fecha_registro_af)
            : null,

          created_at: activosFijos.created_at
            ? formatDateHorasToFrontend(activosFijos.created_at)
            : null,

          updated_at: activosFijos.updated_at
            ? formatDateHorasToFrontend(activosFijos.updated_at)
            : null,
        };
      });

      return { success: response.data.success, activosFijos: activosFormateados, message: response.data.message };
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


// Obtener ActivosFijos dados de baja
export const getActivosFijosDadosDeBaja = createAsyncThunk<{ success: boolean; activosFijos?: ActivosFijos[], message: string }>(
  'almacenGeneral/getActivosFijosDadosDeBaja',
  async () => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/activosfijos-bajas`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
          fecha_compra_af: activosFijos.fecha_compra_af
            ? formatDateHorasToFrontend(activosFijos.fecha_compra_af)
            : null,

          fecha_registro_af: activosFijos.fecha_registro_af
            ? formatDateHorasToFrontend(activosFijos.fecha_registro_af)
            : null,

          created_at: activosFijos.created_at
            ? formatDateHorasToFrontend(activosFijos.created_at)
            : null,

          updated_at: activosFijos.updated_at
            ? formatDateHorasToFrontend(activosFijos.updated_at)
            : null,
        };
      });

      return { success: response.data.success, activosFijos: activosFormateados, message: response.data.message };
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