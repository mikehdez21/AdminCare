import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addActivoFijo, getActivosFijos } from './activosActions';

export interface ActivosState {
  activosfijos: ActivosFijos[];
  error: string | null; // Agregar un campo para manejar errores
}

const initialState: ActivosState = {
  activosfijos: [],
  error: null,
}

const activosSlice = createSlice({  
  name: 'activosfijos',
  initialState,
  reducers: {
    setActivosFijos: (state, action: PayloadAction<ActivosFijos[]>) => {
      state.activosfijos = action.payload;
    },
    updateActivosFijos: (state, action: PayloadAction<ActivosFijos>) => {
      const index = state.activosfijos.findIndex(activo => activo.id_activo_fijo === action.payload.id_activo_fijo);
      if (index !== -1) {
        state.activosfijos[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActivosFijos.fulfilled, (state, action: PayloadAction<{ success: boolean; activos?: ActivosFijos[]; message: string }>) => {
        if (action.payload.success && action.payload.activos) {
          state.activosfijos = action.payload.activos;
        } else {
          state.activosfijos = [];
          state.error = action.payload.message || 'Error al obtener activos';
        }
      })
      .addCase(getActivosFijos.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(addActivoFijo.fulfilled, (state, action: PayloadAction<{ success: boolean; activos?: ActivosFijos[]; message: string }>) => {
        if (action.payload.success && action.payload.activos) {
          state.activosfijos = [...state.activosfijos, ...action.payload.activos];
        } else {
          state.activosfijos = [];
          state.error = action.payload.message || 'Error al añadir el activo';
        }
      })
      .addCase(addActivoFijo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { setActivosFijos, updateActivosFijos } = activosSlice.actions;
export default activosSlice.reducer;