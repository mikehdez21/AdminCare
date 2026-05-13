import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addTipoFactura, getTiposFacturas, editTipoFactura, deleteTipoFactura } from './tiposFacturasActions';


export interface TiposFacturasState {
  tiposFacturasAF: TiposFacturasAF[];
  error: string | null;
}

const initialState: TiposFacturasState = {
  tiposFacturasAF: [],
  error: null,
}

const tiposFacturasSlice = createSlice({
  name: 'tiposFacturas',
  initialState,
  reducers: {
    setListTiposFacturas: (state, action: PayloadAction<TiposFacturasAF[]>) => {
      state.tiposFacturasAF = action.payload;
    },
    updateTipoFactura: (state, action: PayloadAction<TiposFacturasAF>) => {
      const index = state.tiposFacturasAF.findIndex(tipo => tipo.id_tipofacturaaf === action.payload.id_tipofacturaaf);
      if (index !== -1) {
        state.tiposFacturasAF[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTiposFacturas.fulfilled, (state, action: PayloadAction<{ success: boolean, tiposFacturas?: TiposFacturasAF[], message: string }>) => {
        if (action.payload.success && Array.isArray(action.payload.tiposFacturas)) {
          state.tiposFacturasAF = action.payload.tiposFacturas;
          state.error = null;
        } else {
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de facturas';
        }
      })
      .addCase(getTiposFacturas.rejected, (state, action) => {
        state.error = action.error.message || 'Error al obtener tipos de facturas';
      })
      .addCase(addTipoFactura.fulfilled, (state, action: PayloadAction<{ success: boolean, message: string }>) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al añadir el tipo de factura';
        }
      })
      .addCase(addTipoFactura.rejected, (state, action) => {
        state.error = action.error.message || 'Error al añadir el tipo de factura';
      })
      .addCase(editTipoFactura.fulfilled, (state, action: PayloadAction<{ success: boolean, message: string }>) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al editar el tipo de factura';
        }
      })
      .addCase(editTipoFactura.rejected, (state, action) => {
        state.error = action.error.message || 'Error al editar el tipo de factura';
      })
      .addCase(deleteTipoFactura.fulfilled, (state, action: PayloadAction<{ success: boolean, message: string }>) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al eliminar el tipo de factura';
        }
      })
      .addCase(deleteTipoFactura.rejected, (state, action) => {
        state.error = action.error.message || 'Error al eliminar el tipo de factura';
      })
  }
})

export const { setListTiposFacturas, updateTipoFactura } = tiposFacturasSlice.actions
export default tiposFacturasSlice.reducer;
