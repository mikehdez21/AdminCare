import { Departamentos } from '@/@types/mainTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addDepartamento, getDepartamentos, ResultadoDepartamentos } from './departamentosActions';

export interface DepartamentoState{
    departamentos: Departamentos[];
    /** Página devuelta por las consultas paginadas (page/per_page). */
    departamentosPagina: Departamentos[];
    /** Metadatos de la última consulta paginada. */
    meta: PaginacionMeta | null;
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: DepartamentoState = {
  departamentos: [],
  departamentosPagina: [],
  meta: null,
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
      .addCase(getDepartamentos.fulfilled, (state, action: PayloadAction<ResultadoDepartamentos>) => {
        if (action.payload.success && action.payload.departamentos) {
          if (action.payload.meta) {
            state.departamentosPagina = action.payload.departamentos; // Carga la página de departamentos obtenida
            state.meta = action.payload.meta;
          } else {
            state.departamentos = action.payload.departamentos; // Carga la lista de departamentos obtenida
          }
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al obtener departamentos'; // Maneja errores al obtener usuarios
        }
      })
      .addCase(addDepartamento.fulfilled, (state, action: PayloadAction<{success: boolean, departamentos?: Departamentos[], message: string}>) => {
        if (action.payload.success && action.payload.departamentos){
          state.departamentos = action.payload.departamentos; // Mantener departamentos anteriores y añadir nuevos
        } else {
          state.departamentos = []
          state.error = action.payload.message || 'Error al añadir el departamento'; // Manejo de errores
        }
      })
  }
})

export const {setListDepartamentos} = departamentoSlice.actions
export default departamentoSlice.reducer;