import { Departamentos } from '@/@types/mainTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addDepartamento, getDepartamentos } from './departamentosActions';

export interface DepartamentoState{
    departamentos: Departamentos[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: DepartamentoState = {
  departamentos: [],
  error: null, // Agregar un campo para manejar errores
}

const departamentoSlice = createSlice({
  name: 'Departamentos',
  initialState,
  reducers: {
    setListDepartamentos: (state, action: PayloadAction<Departamentos[]>) => {
      state.departamentos = action.payload; // Establecer el Departamento
      
    },
    updateDepartamentos: (state, action: PayloadAction<Departamentos>) => {
      const index = state.departamentos.findIndex(departamento => departamento.id_departamento === action.payload.id_departamento);
      if (index !== -1) {
        // Actualizar el rol existente
        state.departamentos[index] = action.payload;
      }
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDepartamentos.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.departamentos) {
          state.departamentos = action.payload.departamentos; // Carga la lista de departamentos obtenida
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al obtener departamentos'; // Maneja errores al obtener usuarios
        }
      })
      .addCase(getDepartamentos.rejected, (state, action) => {
        state.error = action.error.message || 'Error inesperado'; // Manejo de errores inesperados
      })
      .addCase(addDepartamento.fulfilled, (state, action: PayloadAction<{success: boolean, departamentos?: Departamentos[], message: string}>) => {
        if (action.payload.success && action.payload.departamentos){
          state.departamentos = action.payload.departamentos; // Mantener departamentos anteriores y añadir nuevos
        } else {
          state.departamentos = []
          state.error = action.payload.message || 'Error al añadir el departamento'; // Manejo de errores
        }
      })
      .addCase(addDepartamento.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const {setListDepartamentos} = departamentoSlice.actions
export default departamentoSlice.reducer;