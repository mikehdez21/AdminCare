import { ActivosFijos, EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addActivoFijo, getActivosFijos, getEstatusActivosFijos } from './activosActions';

export interface ActivosState {
  activosfijos: ActivosFijos[];
  estatusActivoFijo: EstatusActivosFijos[];
  error: string | null; // Agregar un campo para manejar errores
}

const initialState: ActivosState = {
  activosfijos: [],
  estatusActivoFijo: [],
  error: null,
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
    },

    setListEstatusActivosFijos: (state, action: PayloadAction<EstatusActivosFijos[]>) => {
      state.estatusActivoFijo = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(getActivosFijos.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.activosFijos) {
          state.activosfijos = action.payload.activosFijos;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener activos';
        }
      })
      .addCase(getActivosFijos.rejected, (state, action) => {
        state.error = action.error.message || 'Error inesperado'; // Manejo de errores inesperados
      })


      .addCase(addActivoFijo.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.activofijo) {
          state.activosfijos = [...state.activosfijos, action.payload.activofijo]; // Mantener activos anteriores y añadir nuevos
        } else {
          state.activosfijos = [];
          state.error = action.payload.message || 'Error al añadir el activo';
        }
      })
      .addCase(addActivoFijo.rejected, (state, action) => {
        state.error = action.error.message || 'Error inesperado';
      })

      .addCase(getEstatusActivosFijos.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.estatusAF) {
          state.estatusActivoFijo = action.payload.estatusAF;
        } else {
          state.estatusActivoFijo = [];
          state.error = action.payload.message || 'Error al obtener estatus de activos fijos';
        }
      })
      .addCase(getEstatusActivosFijos.rejected, (state, action) => {
        state.error = action.error.message || 'Error inesperado';
      })
  }
});

export const { setListActivosFijos, updateActivosFijos, setListEstatusActivosFijos } = activosSlice.actions;
export default activosSlice.reducer;