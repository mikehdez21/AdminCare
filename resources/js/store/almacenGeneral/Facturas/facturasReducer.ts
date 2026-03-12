import { FacturasAF, TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { ActivoEntityResponse } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addFactura,
  getFacturas,
  getTiposFacturas,
  getActivosFactura,
  addActivosToFactura,
  updateActivosFactura,
  removeActivoFromFactura,
  updateFactura
} from './facturasActions';

export interface FacturaState {
  facturasaf: FacturasAF[];
  tiposFacturas: TiposFacturasAF[];
  activosFactura: ActivoEntityResponse[];
  error: string | null;
}

const initialState: FacturaState = {
  facturasaf: [],
  tiposFacturas: [],
  activosFactura: [],
  error: null,
}

const facturaSlice = createSlice({
  name: 'facturas',
  initialState,
  reducers: {
    setFacturas: (state, action: PayloadAction<FacturasAF[]>) => {
      state.facturasaf = action.payload; // Establecer el Facturas
    },
    updateFacturas: (state, action: PayloadAction<FacturasAF>) => {
      const index = state.facturasaf.findIndex(factura => factura.id_factura === action.payload.id_factura);
      if (index !== -1) {
        // Actualizar la factura existente
        state.facturasaf[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFacturas.fulfilled, (state, action: PayloadAction<{ success: boolean, facturasaf?: FacturasAF[], message: string }>) => {
        if (action.payload.success && action.payload.facturasaf) {
          state.facturasaf = action.payload.facturasaf
        } else {
          state.facturasaf = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener facturas';
        }
      })
      .addCase(getFacturas.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(addFactura.fulfilled, (state, action: PayloadAction<{ success: boolean, facturasaf?: FacturasAF[], message: string }>) => {
        if (action.payload.success && action.payload.facturasaf) {
          state.facturasaf = [...state.facturasaf, ...action.payload.facturasaf]; // Mantener facturas anteriores y añadir nuevos
        } else {
          state.facturasaf = []
          state.error = action.payload.message || 'Error al añadir el proveedor'; // Manejo de errores
        }
      })
      .addCase(addFactura.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Actualizar factura
      .addCase(updateFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(updateFactura.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Tipos de facturas
      .addCase(getTiposFacturas.fulfilled, (state, action: PayloadAction<{ success: boolean, tiposFacturas?: [], message: string }>) => {
        if (action.payload.success && action.payload.tiposFacturas) {
          state.tiposFacturas = action.payload.tiposFacturas
        } else {
          state.tiposFacturas = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de facturas';
        }
      })

      // Activos de factura
      .addCase(getActivosFactura.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.activosFactura) {
          state.activosFactura = action.payload.activosFactura;
        } else {
          state.activosFactura = [];
          state.error = action.payload.message;
        }
      })
      .addCase(getActivosFactura.rejected, (state, action) => {
        state.activosFactura = [];
        state.error = action.payload as string;
      })

      // Agregar activos a factura
      .addCase(addActivosToFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          // Limpiar error en caso de éxito
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(addActivosToFactura.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Actualizar activos de factura
      .addCase(updateActivosFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          // Limpiar error en caso de éxito
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(updateActivosFactura.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Remover activo de factura
      .addCase(removeActivoFromFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          // Limpiar error en caso de éxito
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(removeActivoFromFactura.rejected, (state, action) => {
        state.error = action.payload as string;
      })
  }
})

export const { setFacturas, updateFacturas } = facturaSlice.actions
export default facturaSlice.reducer;