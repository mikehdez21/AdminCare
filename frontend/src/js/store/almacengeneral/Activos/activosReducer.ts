import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addActivoFijo,
  getActivosFijos,
  getActivosFijosDadosDeBaja,
  getActivosFijosMenores,
  getActivosFijosNoPropios,
  getActivosFijosPorClasificacion,
  getActivosFijosPorDepartamento,
  getActivosFijosPorResponsable,
  getActivosFijosPorUbicacion,
  getActivosFijosSinFactura,
  ResultadoActivosFijos,
} from './activosActions';

export interface ActivosState {
  /** Lista completa de activos (consultas sin paginación). */
  activosfijos: ActivosFijos[];
  /** Página devuelta por las consultas paginadas (page/per_page). */
  activosFijosPagina: ActivosFijos[];
  /** Metadatos de la última consulta paginada. */
  meta: PaginacionMeta | null;
  error: string | null; // Agregar un campo para manejar errores
}

const initialState: ActivosState = {
  activosfijos: [],
  activosFijosPagina: [],
  meta: null,
  error: null,
}

// Reducer común para las consultas paginadas de las variantes de activos.
// Solo actualiza el campo de página + meta cuando la consulta fue paginada;
// la lista completa (`activosfijos`) se mantiene intacta.
function aplicarPaginacionActivos(
  state: ActivosState,
  action: PayloadAction<ResultadoActivosFijos>,
) {
  if (action.payload.success && action.payload.activosFijos && action.payload.meta) {
    state.activosFijosPagina = action.payload.activosFijos;
    state.meta = action.payload.meta;
    state.error = null;
  } else if (!action.payload.success) {
    state.error = action.payload.message || 'Error al obtener activos';
  }
}

const activosSlice = createSlice({
  name: 'activosfijos',
  initialState,
  reducers: {
    setListActivosFijos: (state, action: PayloadAction<ActivosFijos[]>) => {
      state.activosfijos = action.payload;
    },
    updateActivosFijos: (state, action: PayloadAction<ActivosFijos>) => {
      const index = state.activosfijos.findIndex(activo => activo.id_activo_fijo === action.payload.id_activo_fijo);
      if (index !== -1) {
        state.activosfijos[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(getActivosFijos.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.activosFijos) {
          if (action.payload.meta) {
            state.activosFijosPagina = action.payload.activosFijos;
            state.meta = action.payload.meta;
          } else {
            state.activosfijos = action.payload.activosFijos;
          }
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener activos';
        }
      })

      .addCase(getActivosFijosPorDepartamento.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosPorUbicacion.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosPorClasificacion.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosPorResponsable.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosDadosDeBaja.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosNoPropios.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosMenores.fulfilled, aplicarPaginacionActivos)
      .addCase(getActivosFijosSinFactura.fulfilled, aplicarPaginacionActivos)

      .addCase(addActivoFijo.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.activofijo) {
          state.activosfijos = [...state.activosfijos, action.payload.activofijo]; // Mantener activos anteriores y añadir nuevos
        } else {
          state.activosfijos = [];
          state.error = action.payload.message || 'Error al añadir el activo';
        }
      })
  }
});

export const { setListActivosFijos, updateActivosFijos } = activosSlice.actions;
export default activosSlice.reducer;