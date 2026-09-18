import { Ubicaciones } from '@/@types/mainTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addUbicacion, getUbicaciones, ResultadoUbicaciones } from './ubicacionesActions';

export interface UbicacionesState{
    ubicaciones: Ubicaciones[];
    /** Página devuelta por las consultas paginadas (page/per_page). */
    ubicacionesPagina: Ubicaciones[];
    /** Metadatos de la última consulta paginada. */
    meta: PaginacionMeta | null;
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: UbicacionesState = {
  ubicaciones: [],
  ubicacionesPagina: [],
  meta: null,
  error: null, // Agregar un campo para manejar errores
}

const ubicacionesSlice = createSlice({
  name: 'Ubicaciones',
  initialState,
  reducers: {
    setListUbicaciones: (state, action: PayloadAction<Ubicaciones[]>) => {
      state.ubicaciones = action.payload; // Establecer las Ubicaciones
      
    },
    updateUbicaciones: (state, action: PayloadAction<Ubicaciones>) => {
      const index = state.ubicaciones.findIndex(ubicacion => ubicacion.id_ubicacion === action.payload.id_ubicacion);
      if (index !== -1) {
        // Actualizar el rol existente
        state.ubicaciones[index] = action.payload;
      }
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUbicaciones.fulfilled, (state, action: PayloadAction<ResultadoUbicaciones>) => {
        if (action.payload.success && action.payload.ubicaciones) {
          if (action.payload.meta) {
            state.ubicacionesPagina = action.payload.ubicaciones; // Carga la página de ubicaciones obtenida
            state.meta = action.payload.meta;
          } else {
            state.ubicaciones = action.payload.ubicaciones; // Carga la lista de ubicaciones obtenida
          }
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al obtener ubicaciones'; // Maneja errores al obtener usuarios
        }
      })
      .addCase(addUbicacion.fulfilled, (state, action: PayloadAction<{success: boolean, ubicaciones?: Ubicaciones[], message: string}>) => {
        if (action.payload.success && action.payload.ubicaciones){
          state.ubicaciones = action.payload.ubicaciones; // Mantener ubicaciones anteriores y añadir nuevos
        } else {
          state.ubicaciones = []
          state.error = action.payload.message || 'Error al añadir la ubicacion'; // Manejo de errores
        }
      })
  }
})

export const {setListUbicaciones} = ubicacionesSlice.actions
export default ubicacionesSlice.reducer;