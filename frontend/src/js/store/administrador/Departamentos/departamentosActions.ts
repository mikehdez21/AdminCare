import { isAxiosError } from 'axios';
import { Departamentos } from '@/@types/mainTypes';
import { type PaginacionMeta, type PaginacionParams } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

// ---------------------------------------------------------------------------
// Resultado común de las consultas de departamentos.
// `meta` solo está presente cuando la consulta fue paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoDepartamentos {
  success: boolean;
  departamentos?: Departamentos[];
  meta?: PaginacionMeta | null;
  message: string;
}

// Agregar un nuevo Departamento
export const addDepartamento = createAsyncThunk<{ success: boolean; message: string }, Departamentos>(
  '/addDepartamento',
  async (nuevoDepartamento: Departamentos) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/api/HSS1/admin/departamentos`,
        nuevoDepartamento
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

// Obtener los departamentos registrados
// - Sin argumentos: devuelve la lista completa (comportamiento original).
// - Con PaginacionParams: devuelve la página solicitada + `meta`.
export const getDepartamentos = createAsyncThunk<ResultadoDepartamentos, PaginacionParams | void>(
  '/getDepartamentos',
  async (params: PaginacionParams | void) => {
    try {

      const response = await api.get(
        `${API_BASE_URL}/api/HSS1/admin/departamentos`,
        params ? { params } : undefined,
      );

      const departamentosFormateados = response.data.data.map((departamento: Departamentos) => {
        return {
          ...departamento,
          created_at: departamento.created_at
            ? formatDateHorasToFrontend(departamento.created_at)
            : null,
          updated_at: departamento.updated_at
            ? formatDateHorasToFrontend(departamento.updated_at)
            : null,

        };
      });

      return { success: response.data.success, departamentos: departamentosFormateados as Departamentos[], meta: response.data.meta ?? null, message: response.data.message };

    } catch (error) {
      // Manejo de errores
      if (isAxiosError(error) && error.response) {
        // Retornar la respuesta del backend como parte del error
        return ({
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        });
      }

      return ({
        success: false,
        message: 'Error inesperado',
      });
    }
  }
)

// Editar un departamento
export const editDepartamento = createAsyncThunk<{ success: boolean; message: string }, Departamentos>(
  '/editDepartamento',
  async (departamentoEditado: Departamentos) => {
    try {

      // Incluir el id del departamento en la URL para hacer la actualización correcta
      const response = await api.put(
        `${API_BASE_URL}/api/HSS1/admin/departamentos/${departamentoEditado.id_departamento}`,
        departamentoEditado
      );

      console.log('updateAction', response.data.success)
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

// Eliminar un departamento
export const deleteDepartamento = createAsyncThunk<{ success: boolean; message: string }, Departamentos>(
  '/deleteDepartamento',
  async (departamentoEliminado: Departamentos) => {
    try {

      // Incluir el id del rol en la URL para hacer la eliminación correcta
      const response = await api.delete(
        `${API_BASE_URL}/api/HSS1/admin/departamentos/${departamentoEliminado.id_departamento}`
      );

      console.log('deleteAction', response.data.success)
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