import { Empleados } from '@/@types/mainTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addEmpleado, getEmpleados, editEmpleado, bajaEmpleado } from './empleadosActions';

export interface EmpleadosState {
    empleados: Empleados[]; // Lista completa de empleados
    currentEmpleado: Empleados | null; // Empleado Logeado en Especifico
    error: string | null; // Agregar un campo para manejar errores
}

const initialState: EmpleadosState = {
  empleados: [], // Lista completa de empleados
  currentEmpleado: null, // Empleado Logeado en Especifico
  error: null, // Agregar un campo para manejar errores
}

const empleadosSlice = createSlice({
  name: 'Empleados',
  initialState,
  reducers: {


    // Acciones para la lista completa de empleados
    setListEmpleados: (state, action: PayloadAction<Empleados[]>) => {
      state.empleados = action.payload; // Establecer la lista completa de empleados
    },

    updateEmpleado: (state, action: PayloadAction<Empleados>) => {
      const index = state.empleados.findIndex(empleado => empleado.id_empleado === action.payload.id_empleado);
      if (index !== -1) {
        state.empleados[index] = {
          ...state.empleados[index],
          ...action.payload, // Actualizar todos los datos, incluido el departamento
        };
      }
    },

    // Acciones para el empleado actual (currentEmpleado)
    setCurrentEmpleado: (state, action: PayloadAction<Empleados>) => {
      state.currentEmpleado = action.payload; // Establece el empleado actual LOGEADO en el estado
    },

  },

  extraReducers: (builder) => {
    builder
    // Manejo de la lista completa de empleados
      .addCase(getEmpleados.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.empleados) {
          state.empleados = action.payload.empleados; // Carga la lista de empleados obtenida
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al obtener empleados'; // Maneja errores al obtener empleados
        }
      })
      .addCase(getEmpleados.rejected, (state, action) => {
        state.error = action.error.message || 'Error inesperado'; // Manejo de errores inesperados
      })
      .addCase(addEmpleado.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.empleados) {
          state.empleados.push(action.payload.empleados[0]); // Agrega el nuevo empleado a la lista
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al agregar empleado'; // Maneja errores al agregar empleado
        }
      })
      .addCase(editEmpleado.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.message) {
          const updateEmpleado = action.meta.arg; // Usuario actualizado enviado como argumento
          const index = state.empleados.findIndex((empleado) => empleado.id_empleado === updateEmpleado.id_empleado);
          if (index !== -1) {
            state.empleados[index] = updateEmpleado; // Actualiza el empleado en la lista
          }
        } else {
          state.error = action.payload.message || 'Error al editar empleado'; // Maneja errores al editar empleado
        }
      })

      .addCase(bajaEmpleado.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.empleados = state.empleados.filter(
            (empleado) => empleado.id_empleado !== action.meta.arg.id_empleado // Filtra el empleado eliminado
          );
        } else {
          state.error = action.payload.message || 'Error al eliminar empleado'; // Maneja errores al eliminar empleado
        }
      });

    /*
      // Eliminar un empleado (Borra el registro)
      .addCase(deleteEmpleado.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.empleados = state.empleados.filter(
            (empleado) => empleado.id_empleado !== action.meta.arg.id_empleado // Filtra el empleado eliminado
          );
        } else {
          state.error = action.payload.message || 'Error al eliminar empleado'; // Maneja errores al eliminar empleado
        }
      });
      */
  },
});

export const { setListEmpleados, setCurrentEmpleado, updateEmpleado } = empleadosSlice.actions; // Exportar las acciones
export default empleadosSlice.reducer; // Exportar el reducer
