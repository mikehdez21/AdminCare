import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getVWmovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';

export interface vwMovimientosAFState {
  activosMovimientos: VwMovimientosAF[];
  error: string | null;
}

const initialState: vwMovimientosAFState = {
  activosMovimientos: [],
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
      .addCase(getVWmovimientosActivosFijos.fulfilled, (state, action: PayloadAction<{ success: boolean; vwMovimientosAF?: VwMovimientosAF[]; ActivosMovimientosView?: VwMovimientosAF[]; message: string }>) => {
        const activosMovimientos = action.payload.vwMovimientosAF || action.payload.ActivosMovimientosView || [];

        if (action.payload.success && activosMovimientos.length > 0) {
          state.activosMovimientos = activosMovimientos;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener movimientos de activos';
        }
      })
      .addCase(getVWmovimientosActivosFijos.rejected, (state, action) => {
        state.error = action.error.message || 'Error al obtener movimientos de activos';
      })
  }
});

export const { setListvwMovimientosAF } = vwMovimientosAFSlice.actions;
export default vwMovimientosAFSlice.reducer;