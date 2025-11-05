import { FacturasAF } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addFactura, getFacturas } from './facturasActions';

export interface FacturaState{
    facturasaf: FacturasAF[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: FacturaState = {
  facturasaf: [],
  error: null, // Agregar un campo para manejar errores
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
      .addCase(getFacturas.fulfilled, (state, action: PayloadAction<{success: boolean, facturasaf?: FacturasAF[], message: string}>) => {
        if (action.payload.success && action.payload.facturasaf){
          state.facturasaf = action.payload.facturasaf
        } else {
          state.facturasaf = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener facturas';
        }
      })
      .addCase(getFacturas.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(addFactura.fulfilled, (state, action: PayloadAction<{success: boolean, facturasaf?: FacturasAF[], message: string}>) => {
        if (action.payload.success && action.payload.facturasaf){
          state.facturasaf = [...state.facturasaf, ...action.payload.facturasaf]; // Mantener facturas anteriores y añadir nuevos
        } else {
          state.facturasaf = []
          state.error = action.payload.message || 'Error al añadir el proveedor'; // Manejo de errores
        }
      })
      .addCase(addFactura.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const {setFacturas, updateFacturas} = facturaSlice.actions
export default facturaSlice.reducer;