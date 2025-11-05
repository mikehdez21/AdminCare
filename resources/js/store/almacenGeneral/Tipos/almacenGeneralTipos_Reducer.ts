import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TiposProveedores, 
  FormasPago, 
  RegimenFiscal, 
  DescuentosProveedor, 
  TiposFacturacion, 
  TiposMoneda,
  TiposFacturas
} from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';

import {
  getTiposProveedores,
  getFormasPago,
  getTiposRegimen,
  getTiposDescuento,
  getTiposFacturacion,
  getTiposMoneda,
  getTiposFacturas
} from './almacenGeneralTipos_Actions';


export interface ProveedorState{
    tiposProveedores: TiposProveedores[];
    formasPago: FormasPago[];
    regimenesFiscales: RegimenFiscal[];
    descuentosProveedor: DescuentosProveedor[];
    tiposFacturacion: TiposFacturacion[];
    tiposMoneda: TiposMoneda[]; 
    tiposFacturas: TiposFacturas[]; 


    error: string | null; // Agregar un campo para manejar errores

}

const initialState: ProveedorState = {
  tiposProveedores: [],
  formasPago: [],
  regimenesFiscales: [],
  descuentosProveedor: [],
  tiposFacturacion: [],
  tiposMoneda: [], 
  tiposFacturas: [], 
  
  
  error: null, // Agregar un campo para manejar errores
}

const almacenGeneralTipos = createSlice({
  name: 'almacenGeneralTipos',
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder

    // Tipos de proveedores
      .addCase(getTiposProveedores.fulfilled, (state, action: PayloadAction<{success: boolean, tiposProveedores?: [], message: string}>) => {
        if (action.payload.success && action.payload.tiposProveedores){
          state.tiposProveedores = action.payload.tiposProveedores
        } else {
          state.tiposProveedores = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de proveedores';
        }
      })
      .addCase(getTiposProveedores.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Formas de pago
      .addCase(getFormasPago.fulfilled, (state, action: PayloadAction<{success: boolean, formasPago?: [], message: string}>) => {
        if (action.payload.success && action.payload.formasPago){
          state.formasPago = action.payload.formasPago
        } else {
          state.formasPago = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener formas de pago';
        }
      })
      .addCase(getFormasPago.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Regimenes fiscales
      .addCase(getTiposRegimen.fulfilled, (state, action: PayloadAction<{success: boolean, regimenesFiscales?: [], message: string}>) => {
        if (action.payload.success && action.payload.regimenesFiscales){
          state.regimenesFiscales = action.payload.regimenesFiscales
        } else {
          state.regimenesFiscales = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener regimenes fiscales';
        }
      })
      .addCase(getTiposRegimen.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Descuentos Proveedores
      .addCase(getTiposDescuento.fulfilled, (state, action: PayloadAction<{success: boolean, descuentosProveedor?: [], message: string}>) => {
        if (action.payload.success && action.payload.descuentosProveedor){
          state.descuentosProveedor = action.payload.descuentosProveedor
        } else {
          state.descuentosProveedor = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de descuento';
        }
      })
      .addCase(getTiposDescuento.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Tipos de facturacion
      .addCase(getTiposFacturacion.fulfilled, (state, action: PayloadAction<{success: boolean, tiposFacturacion?: [], message: string}>) => {
        if (action.payload.success && action.payload.tiposFacturacion){
          state.tiposFacturacion = action.payload.tiposFacturacion
        } else {
          state.tiposFacturacion = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de facturacion';
        }
      })
      .addCase(getTiposFacturacion.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Tipos de moneda
      .addCase(getTiposMoneda.fulfilled, (state, action: PayloadAction<{success: boolean, tiposMoneda?: [], message: string}>) => {
        if (action.payload.success && action.payload.tiposMoneda){
          state.tiposMoneda = action.payload.tiposMoneda
        } else {
          state.tiposMoneda = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de moneda';
        }
      })
      .addCase(getTiposMoneda.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Tipos de facturas
      .addCase(getTiposFacturas.fulfilled, (state, action: PayloadAction<{success: boolean, tiposFacturas?: [], message: string}>) => {
        if (action.payload.success && action.payload.tiposFacturas){
          state.tiposFacturas = action.payload.tiposFacturas
        } else {
          state.tiposFacturas = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de facturas';
        }
      })
  }
})

export default almacenGeneralTipos.reducer;