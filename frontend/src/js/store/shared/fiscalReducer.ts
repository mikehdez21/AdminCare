import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  FormasPago,
  RegimenFiscal,
  TiposMoneda,
  TiposFacturacion
} from '@/@types/fiscalTypes';

import {
  getTiposRegimen,
  getTiposFacturacion
} from '@/store/shared/fiscalActions';

import { getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';

export interface FiscalState {
  formasPago: FormasPago[];
  regimenesFiscales: RegimenFiscal[];
  tiposMoneda: TiposMoneda[];
  tiposFacturacion: TiposFacturacion[];

  error: string | null;
}

const initialState: FiscalState = {
  formasPago: [],
  regimenesFiscales: [],
  tiposMoneda: [],
  tiposFacturacion: [],

  error: null,
};

const fiscalSlice = createSlice({
  name: 'Fiscal',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      // Formas de pago
      .addCase(getFormasPago.fulfilled, (state, action: PayloadAction<{ success: boolean, formasPago?: [], message: string }>) => {
        if (action.payload.success && action.payload.formasPago) {
          state.formasPago = action.payload.formasPago
        } else {
          state.formasPago = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener formas de pago';
        }
      })


      // Regimenes fiscales
      .addCase(getTiposRegimen.fulfilled, (state, action: PayloadAction<{ success: boolean, regimenesFiscales?: [], message: string }>) => {
        if (action.payload.success && action.payload.regimenesFiscales) {
          state.regimenesFiscales = action.payload.regimenesFiscales
        } else {
          state.regimenesFiscales = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener regimenes fiscales';
        }
      })


      // Tipos de moneda
      .addCase(getTiposMoneda.fulfilled, (state, action: PayloadAction<{ success: boolean, tiposMoneda?: [], message: string }>) => {
        if (action.payload.success && action.payload.tiposMoneda) {
          state.tiposMoneda = action.payload.tiposMoneda
        } else {
          state.tiposMoneda = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de moneda';
        }
      })


      // Tipos de facturacion
      .addCase(getTiposFacturacion.fulfilled, (state, action: PayloadAction<{ success: boolean, tiposFacturacion?: [], message: string }>) => {
        if (action.payload.success && action.payload.tiposFacturacion) {
          state.tiposFacturacion = action.payload.tiposFacturacion
        } else {
          state.tiposFacturacion = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de facturacion';
        }
      })
  },
});

export default fiscalSlice.reducer;
