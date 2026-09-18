import { FacturasAF, TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { ActivoEntityResponse } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addFactura,
  getFacturas,
  getTiposFacturas,
  getActivosFactura,
  addActivosToFactura,
  updateActivosFactura,
  removeActivoFromFactura,
  updateFactura,
  ResultadoFacturas,
} from './facturasActions';
import {
  addTipoFactura,
  editTipoFactura,
  deleteTipoFactura,
  getTiposFacturas as getTiposFacturasCatalog,
  TipoFacturaMutationResult,
} from '../TipoFactura/tiposFacturasActions';

export interface FacturaState {
  /** Lista completa de facturas (consultas sin paginación). */
  facturasaf: FacturasAF[];
  /** Página devuelta por las consultas paginadas (page/per_page). */
  facturasafPagina: FacturasAF[];
  /** Metadatos de la última consulta paginada. */
  meta: PaginacionMeta | null;
  tiposFacturas: TiposFacturasAF[];
  activosFactura: ActivoEntityResponse[];
  error: string | null;
  tiposFacturasLoading: boolean;
  tiposFacturasError: string | null;
  tiposFacturasMutationLoading: boolean;
  tiposFacturasMutationError: string | null;
}

const initialState: FacturaState = {
  facturasaf: [],
  facturasafPagina: [],
  meta: null,
  tiposFacturas: [],
  activosFactura: [],
  error: null,
  tiposFacturasLoading: false,
  tiposFacturasError: null,
  tiposFacturasMutationLoading: false,
  tiposFacturasMutationError: null,
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
      .addCase(getFacturas.fulfilled, (state, action: PayloadAction<ResultadoFacturas>) => {
        if (action.payload.success && action.payload.facturas) {
          if (action.payload.meta) {
            state.facturasafPagina = action.payload.facturas;
            state.meta = action.payload.meta;
          } else {
            state.facturasaf = action.payload.facturas;
          }
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener facturas';
        }
      })
      .addCase(getFacturas.rejected, (state, action) => {
        state.error = action.error.message || 'Error al obtener facturas';
      })
      .addCase(addFactura.fulfilled, (state, action: PayloadAction<{ success: boolean, facturasaf?: FacturasAF[], message: string }>) => {
        if (action.payload.success && action.payload.facturasaf) {
          state.facturasaf = [...state.facturasaf, ...action.payload.facturasaf]; // Mantener facturas anteriores y añadir nuevos
        } else {
          state.facturasaf = []
          state.error = action.payload.message || 'Error al añadir el proveedor'; // Manejo de errores
        }
      })

      // Actualizar factura
      .addCase(updateFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })

      // Tipos de facturas
      .addCase(getTiposFacturas.pending, (state) => {
        state.tiposFacturasLoading = true;
        state.tiposFacturasError = null;
      })
      .addCase(getTiposFacturas.fulfilled, (state, action) => {
        state.tiposFacturasLoading = false;
        if (action.payload.success) {
          state.tiposFacturas = Array.isArray(action.payload.tiposFacturas) ? action.payload.tiposFacturas : [];
          state.tiposFacturasError = null;
        } else {
          state.tiposFacturas = [];
          state.tiposFacturasError = action.payload.message || 'Error al obtener tipos de facturas';
        }
      })
      .addCase(getTiposFacturas.rejected, (state, action) => {
        state.tiposFacturasLoading = false;
        state.tiposFacturas = [];
        state.tiposFacturasError = action.error.message || 'Error al obtener tipos de facturas';
      })
      .addCase(getTiposFacturasCatalog.pending, (state) => {
        state.tiposFacturasLoading = true;
        state.tiposFacturasError = null;
      })
      .addCase(getTiposFacturasCatalog.fulfilled, (state, action) => {
        state.tiposFacturasLoading = false;
        if (action.payload.success) {
          state.tiposFacturas = Array.isArray(action.payload.tiposFacturas) ? action.payload.tiposFacturas : [];
          state.tiposFacturasError = null;
        } else {
          state.tiposFacturasError = action.payload.message || 'Error al obtener tipos de facturas';
        }
      })
      .addCase(getTiposFacturasCatalog.rejected, (state, action) => {
        state.tiposFacturasLoading = false;
        state.tiposFacturasError = action.error.message || 'Error al obtener tipos de facturas';
      })
      .addCase(addTipoFactura.pending, (state) => {
        state.tiposFacturasMutationLoading = true;
        state.tiposFacturasMutationError = null;
      })
      .addCase(editTipoFactura.pending, (state) => {
        state.tiposFacturasMutationLoading = true;
        state.tiposFacturasMutationError = null;
      })
      .addCase(deleteTipoFactura.pending, (state) => {
        state.tiposFacturasMutationLoading = true;
        state.tiposFacturasMutationError = null;
      })
      .addCase(addTipoFactura.fulfilled, (state, action: PayloadAction<TipoFacturaMutationResult>) => {
        state.tiposFacturasMutationLoading = false;
        state.tiposFacturasMutationError = action.payload.success ? null : action.payload.message;
      })
      .addCase(editTipoFactura.fulfilled, (state, action: PayloadAction<TipoFacturaMutationResult>) => {
        state.tiposFacturasMutationLoading = false;
        state.tiposFacturasMutationError = action.payload.success ? null : action.payload.message;
      })
      .addCase(deleteTipoFactura.fulfilled, (state, action: PayloadAction<TipoFacturaMutationResult>) => {
        state.tiposFacturasMutationLoading = false;
        state.tiposFacturasMutationError = action.payload.success ? null : action.payload.message;
      })
      .addCase(addTipoFactura.rejected, (state, action) => {
        state.tiposFacturasMutationLoading = false;
        state.tiposFacturasMutationError = action.error.message || 'Error al añadir el tipo de factura';
      })
      .addCase(editTipoFactura.rejected, (state, action) => {
        state.tiposFacturasMutationLoading = false;
        state.tiposFacturasMutationError = action.error.message || 'Error al editar el tipo de factura';
      })
      .addCase(deleteTipoFactura.rejected, (state, action) => {
        state.tiposFacturasMutationLoading = false;
        state.tiposFacturasMutationError = action.error.message || 'Error al eliminar el tipo de factura';
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

      // Agregar activos a factura
      .addCase(addActivosToFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          // Limpiar error en caso de éxito
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
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

      // Remover activo de factura
      .addCase(removeActivoFromFactura.fulfilled, (state, action) => {
        if (action.payload.success) {
          // Limpiar error en caso de éxito
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
  }
})

export const { setFacturas, updateFacturas } = facturaSlice.actions
export default facturaSlice.reducer;
