import { isAxiosError } from 'axios';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import {
  type PaginacionConEntidadParams,
  type PaginacionMeta,
  type PaginacionParams,
} from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de activos fijos.
// `meta` solo está presente cuando la consulta fue paginada (envía page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoActivosFijos {
  success: boolean;
  activosFijos?: ActivosFijos[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo activo
export const addActivoFijo = createAsyncThunk<{ success: boolean; activofijo?: ActivosFijos; message: string }, ActivosFijos>(
  'almacengeneral/addActivoFijo',
  async (nuevoActivo: ActivosFijos) => {
    try {

      const response = await api.post(
        `${API_BASE_URL}/api/almacengeneral/activosfijos`,
        nuevoActivo
      );

      return { success: response.data.success, activofijo: response.data.data as ActivosFijos, message: response.data.message, };
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
  },
);

// Obtener TODOS los activos registrados.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getActivosFijos = createAsyncThunk<ResultadoActivosFijos, PaginacionParams | void>(
  'almacengeneral/getActivos',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos`,
        params ? { params } : undefined,
      );

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

      return { success: true, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Editar un activo
export const editActivoFijo = createAsyncThunk<{ success: boolean; message: string }, ActivosFijos>(
  'almacengeneral/editActivoFijo',
  async (activoFijoEditado: ActivosFijos) => {
    try {

      const response = await api.put(
        `${API_BASE_URL}/api/almacengeneral/activosfijos/${activoFijoEditado.id_activo_fijo}`,
        activoFijoEditado
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

// Eliminar un activo
export const deleteActivoFijo = createAsyncThunk<{ success: boolean; message: string }, ActivosFijos>(
  'almacengeneral/deleteActivoFijo',
  async (activoFijoEliminado: ActivosFijos) => {
    try {

      // Incluir el id del proveedor en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/almacengeneral/activosfijos/${activoFijoEliminado.id_activo_fijo}`
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

//  Activos Fijos Filtrados //

// Obtener ActivosFijos por Departamento.
// - Con número: devuelve la lista completa del departamento.
// - Con { id, page, per_page, search }: devuelve la página solicitada + `meta`.
export const getActivosFijosPorDepartamento = createAsyncThunk<ResultadoActivosFijos, PaginacionConEntidadParams | number>(
  'almacengeneral/getActivosFijosPorDepartamento',
  async (arg) => {
    const idDepartamento = typeof arg === 'number' ? arg : arg.id;
    const params = typeof arg === 'object' ? { page: arg.page, per_page: arg.per_page, search: arg.search } : undefined;

    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos/departamento/${idDepartamento}`,
        params ? { params } : undefined,
      );

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos por Ubicacion.
// - Con número: devuelve la lista completa de la ubicación.
// - Con { id, page, per_page, search }: devuelve la página solicitada + `meta`.
export const getActivosFijosPorUbicacion = createAsyncThunk<ResultadoActivosFijos, PaginacionConEntidadParams | number>(
  'almacengeneral/getActivosFijosPorUbicacion',
  async (arg) => {
    const idUbicacion = typeof arg === 'number' ? arg : arg.id;
    const params = typeof arg === 'object' ? { page: arg.page, per_page: arg.per_page, search: arg.search } : undefined;

    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos/ubicacion/${idUbicacion}`,
        params ? { params } : undefined,
      );

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos por Clasificacion.
// - Con número: devuelve la lista completa de la clasificación.
// - Con { id, page, per_page, search }: devuelve la página solicitada + `meta`.
export const getActivosFijosPorClasificacion = createAsyncThunk<ResultadoActivosFijos, PaginacionConEntidadParams | number>(
  'almacengeneral/getActivosFijosPorClasificacion',
  async (arg) => {
    const idClasificacion = typeof arg === 'number' ? arg : arg.id;
    const params = typeof arg === 'object' ? { page: arg.page, per_page: arg.per_page, search: arg.search } : undefined;

    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos/clasificacion/${idClasificacion}`,
        params ? { params } : undefined,
      );

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,
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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos por Responsable.
// - Con número: devuelve la lista completa del responsable.
// - Con { id, page, per_page, search }: devuelve la página solicitada + `meta`.
export const getActivosFijosPorResponsable = createAsyncThunk<ResultadoActivosFijos, PaginacionConEntidadParams | number>(
  'almacengeneral/getActivosFijosPorResponsable',
  async (arg) => {
    const idEmpleado = typeof arg === 'number' ? arg : arg.id;
    const params = typeof arg === 'object' ? { page: arg.page, per_page: arg.per_page, search: arg.search } : undefined;

    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos/responsable/${idEmpleado}`,
        params ? { params } : undefined,
      );

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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos dados de baja.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getActivosFijosDadosDeBaja = createAsyncThunk<ResultadoActivosFijos, PaginacionParams | void>(
  'almacengeneral/getActivosFijosDadosDeBaja',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-bajas`,
        params ? { params } : undefined,
      );

      const activosFormateados = response.data.data.map((activosFijos: ActivosFijos) => {
        return {
          ...activosFijos,

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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos no propios.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getActivosFijosNoPropios = createAsyncThunk<ResultadoActivosFijos, PaginacionParams | void>(
  'almacengeneral/getActivosFijosNoPropios',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-nopropios`,
        params ? { params } : undefined,
      );

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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos marcados como activos menores.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getActivosFijosMenores = createAsyncThunk<ResultadoActivosFijos, PaginacionParams | void>(
  'almacengeneral/getActivosFijosActivosMenores',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-menores`,
        params ? { params } : undefined,
      );

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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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

// Obtener ActivosFijos sin factura asociada.
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getActivosFijosSinFactura = createAsyncThunk<ResultadoActivosFijos, PaginacionParams | void>(
  'almacengeneral/getActivosFijosSinFactura',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/almacengeneral/activosfijos-sinfactura`,
        params ? { params } : undefined,
      );

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

      return { success: response.data.success, activosFijos: activosFormateados, meta: response.data.meta ?? null, message: response.data.message };
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
