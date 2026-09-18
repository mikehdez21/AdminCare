import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getVWmovimientosActivosFijos, ResultadoVwMovimientosAF } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';

export interface vwMovimientosAFState {
  /** Lista completa de movimientos (consultas sin paginación). */
  activosMovimientos: VwMovimientosAF[];
  /** Página devuelta por las consultas paginadas (page/per_page). */
  activosMovimientosPagina: VwMovimientosAF[];
  /** Metadatos de la última consulta paginada. */
  meta: PaginacionMeta | null;
  error: string | null;
}

const initialState: vwMovimientosAFState = {
  activosMovimientos: [],
  activosMovimientosPagina: [],
  meta: null,
  error: null,
};

const vwMovimientosAFSlice = createSlice({
  name: 'vwMovimientosAF',
  initialState,
  reducers: {
    setListvwMovimientosAF: (state, action: PayloadAction<VwMovimientosAF[]>) => {
      state.activosMovimientos = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVWmovimientosActivosFijos.fulfilled, (state, action: PayloadAction<ResultadoVwMovimientosAF>) => {
        if (action.payload.success && action.payload.vwMovimientosAF) {
          if (action.payload.meta) {
            state.activosMovimientosPagina = action.payload.vwMovimientosAF;
            state.meta = action.payload.meta;
          } else {
            state.activosMovimientos = action.payload.vwMovimientosAF;
          }
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener movimientos de activos';
        }
      })
  }
});

export const { setListvwMovimientosAF } = vwMovimientosAFSlice.actions;
export default vwMovimientosAFSlice.reducer;