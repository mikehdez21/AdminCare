import { MovimientosActivosFijos, TipoMovimientoAF, VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addMovimientoActivoFijo, getVWmovimientosActivosFijos, getTipoMovimientosActivosFijos, getMovimientosActivosFijos } from './movimientosAFActions';

export interface MovimientosActivosState {
  movimientosAF: MovimientosActivosFijos[];
  vwMovimientosAF?: VwMovimientosAF[];
  tipoMovimientoAF: TipoMovimientoAF[];
  error: string | null; // Agregar un campo para manejar errores
}

const initialState: MovimientosActivosState = {
  movimientosAF: [],
  vwMovimientosAF: [],
  tipoMovimientoAF: [],
  error: null,
}

const MovimientosActivosSlice = createSlice({  
  name: 'movimientosAF',
  initialState,
  reducers: {
    setListMovimientosAF: (state, action: PayloadAction<MovimientosActivosFijos[]>) => {
      state.movimientosAF = action.payload;
    },
    setListvwMovimientosAF: (state, action: PayloadAction<VwMovimientosAF[]>) => {
      state.vwMovimientosAF = action.payload;
    },
    updateMovimientosAF: (state, action: PayloadAction<MovimientosActivosFijos>) => {
      const index = state.movimientosAF.findIndex(movimiento => movimiento.id_movimientoAF === action.payload.id_movimientoAF);
      if (index !== -1) {
        state.movimientosAF[index] = action.payload;
      }
    },

    setListTipoMovimientoAF: (state, action: PayloadAction<TipoMovimientoAF[]>) => {
      state.tipoMovimientoAF = action.payload;
    }

   
  },
  extraReducers: (builder) => {
    builder

      .addCase(getMovimientosActivosFijos.fulfilled, (state, action: PayloadAction<{ success: boolean; movimientosAF?: MovimientosActivosFijos[]; message: string }>) => {
        if (action.payload.success && action.payload.movimientosAF) {
          state.movimientosAF = action.payload.movimientosAF;
        } else {
          state.movimientosAF = [];
          state.error = action.payload.message || 'Error al obtener los movimientos de activos';
        }
      })
      .addCase(getMovimientosActivosFijos.rejected, (state, action) => {
        state.error = action.payload as string;
      })


      .addCase(getVWmovimientosActivosFijos.fulfilled, (state, action: PayloadAction<{ success: boolean; vwMovimientosAF?: VwMovimientosAF[]; message: string }>) => {
        if (action.payload.success && action.payload.vwMovimientosAF) {
          state.vwMovimientosAF = action.payload.vwMovimientosAF;
        } else {
          state.vwMovimientosAF = [];
          state.error = action.payload.message || 'Error al obtener la vista de activos fijos';
        }
      })
      .addCase(getVWmovimientosActivosFijos.rejected, (state, action) => {
        state.error = action.payload as string;
      })


      .addCase(addMovimientoActivoFijo.fulfilled, (state, action: PayloadAction<{ success: boolean; movimientosAF?: MovimientosActivosFijos[]; message: string }>) => {
        if (action.payload.success && action.payload.movimientosAF) {
          state.movimientosAF = [...state.movimientosAF, ...action.payload.movimientosAF];
        } else {
          state.movimientosAF = [];
          state.error = action.payload.message || 'Error al añadir el activo';
        }
      })
      .addCase(addMovimientoActivoFijo.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(getTipoMovimientosActivosFijos.fulfilled, (state, action: PayloadAction<{ success: boolean; tipoMovimientoAF?: TipoMovimientoAF[]; message: string }>) => {
        if (action.payload.success && action.payload.tipoMovimientoAF) {
          state.tipoMovimientoAF = action.payload.tipoMovimientoAF;
        } else {
          state.tipoMovimientoAF = [];
          state.error = action.payload.message || 'Error al obtener tipos de movimiento';
        }
      })
      .addCase(getTipoMovimientosActivosFijos.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { setListMovimientosAF, setListvwMovimientosAF, updateMovimientosAF, setListTipoMovimientoAF } = MovimientosActivosSlice.actions;
export default MovimientosActivosSlice.reducer;