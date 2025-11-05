import axios from 'axios';
import { Departamentos } from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat'; 
import { createAsyncThunk } from '@reduxjs/toolkit';


// Agregar un nuevo Departamento
export const addDepartamento = createAsyncThunk<{ success: boolean; message: string }, Departamentos>(
  '/addDepartamento',
  async (nuevoDepartamento: Departamentos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.post(
        'http://pruebas.hssadmincare.web/api/HSS1/admin/departamentos',
        nuevoDepartamento,
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

// Obtener los departamentos registrados
export const getDepartamentos = createAsyncThunk<{success: boolean; departamentos?: Departamentos[]; message: string }>(
  '/getDepartamentos',
  async () => {
    try{
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.get('http://pruebas.hssadmincare.web/api/HSS1/admin/departamentos', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      });

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
      
      return { success: response.data.success, departamentos: departamentosFormateados as Departamentos[], message: response.data.message };

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

// Editar un departamento
export const editDepartamento = createAsyncThunk<{ success: boolean; message: string }, Departamentos>(
  '/editDepartamento',
  async (departamentoEditadao: Departamentos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del departamento en la URL para hacer la actualización correcta
      const response = await axios.put(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/admin/departamentos/${departamentoEditadao.id_departamento}`,
        departamentoEditadao,
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

// Eliminar un departamento
export const deleteDepartamento = createAsyncThunk<{ success: boolean; message: string }, Departamentos>(
  '/deleteDepartamento',
  async (departamentoEliminado: Departamentos) => {
    try {
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', { withCredentials: true });
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log(csrfToken);
      
      // Incluir el id del rol en la URL para hacer la eliminación correcta
      const response = await axios.delete(
        `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/admin/departamentos/${departamentoEliminado.id_departamento}`,
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