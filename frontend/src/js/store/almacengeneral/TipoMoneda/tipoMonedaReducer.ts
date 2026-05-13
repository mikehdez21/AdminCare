import { TiposMoneda } from '@/@types/fiscalTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addTipoMoneda, getTiposMoneda, editTipoMoneda, deleteTipoMoneda } from './tipoMonedaActions';


export interface TipoMonedaState {
  tiposMoneda: TiposMoneda[];
  error: string | null;
}

const initialState: TipoMonedaState = {
  tiposMoneda: [],
  error: null,
}

const tipoMonedaSlice = createSlice({
  name: 'tipoMoneda',
  initialState,
  reducers: {
    setListTiposMoneda: (state, action: PayloadAction<TiposMoneda[]>) => {
      state.tiposMoneda = action.payload;
    },
    updateTipoMoneda: (state, action: PayloadAction<TiposMoneda>) => {
      const index = state.tiposMoneda.findIndex(tipo => tipo.id_tipomoneda === action.payload.id_tipomoneda);
      if (index !== -1) {
        state.tiposMoneda[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTiposMoneda.fulfilled, (state, action: PayloadAction<{ success: boolean, tiposMoneda?: TiposMoneda[], message: string }>) => {
        if (action.payload.success && Array.isArray(action.payload.tiposMoneda)) {
          state.tiposMoneda = action.payload.tiposMoneda;
          state.error = null;
        } else {
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de moneda';
        }
      })
      .addCase(getTiposMoneda.rejected, (state, action) => {
        state.error = action.error.message || 'Error al obtener tipos de moneda';
      })
      .addCase(addTipoMoneda.fulfilled, (state, action: PayloadAction<{ success: boolean, message: string }>) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al añadir el tipo de moneda';
        }
      })
      .addCase(addTipoMoneda.rejected, (state, action) => {
        state.error = action.error.message || 'Error al añadir el tipo de moneda';
      })
      .addCase(editTipoMoneda.fulfilled, (state, action: PayloadAction<{ success: boolean, message: string }>) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al editar el tipo de moneda';
        }
      })
      .addCase(editTipoMoneda.rejected, (state, action) => {
        state.error = action.error.message || 'Error al editar el tipo de moneda';
      })
      .addCase(deleteTipoMoneda.fulfilled, (state, action: PayloadAction<{ success: boolean, message: string }>) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al eliminar el tipo de moneda';
        }
      })
      .addCase(deleteTipoMoneda.rejected, (state, action) => {
        state.error = action.error.message || 'Error al eliminar el tipo de moneda';
      })
  }
})

export const { setListTiposMoneda, updateTipoMoneda } = tipoMonedaSlice.actions
export default tipoMonedaSlice.reducer;