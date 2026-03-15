import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getVWmovimientosActivosFijos } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFActions';

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
      .addCase(getVWmovimientosActivosFijos.fulfilled, (state, action: PayloadAction<{ success: boolean; ActivosMovimientosView?: VwMovimientosAF[]; message: string }>) => {
        if (action.payload.success && action.payload.ActivosMovimientosView) {
          state.activosMovimientos = action.payload.ActivosMovimientosView;
        } else {
          state.activosMovimientos = [];
          state.error = action.payload.message || 'Error al obtener movimientos de activos';
        }
      })
      .addCase(getVWmovimientosActivosFijos.rejected, (state, action) => {
        state.error = action.payload as string;
      })
  }
});

export const { setListvwMovimientosAF } = vwMovimientosAFSlice.actions;
export default vwMovimientosAFSlice.reducer;