import { Proveedores, TiposProveedores, DescuentosProveedor } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addProveedor, getProveedores, getTiposDescuento, getTiposProveedores, ResultadoProveedores } from './proveedoresActions';


export interface ProveedorState {
  /** Lista completa de proveedores (consultas sin paginación). */
  proveedores: Proveedores[];
  /** Página devuelta por las consultas paginadas (page/per_page). */
  proveedoresPagina: Proveedores[];
  /** Metadatos de la última consulta paginada. */
  meta: PaginacionMeta | null;
  tiposProveedores: TiposProveedores[];
  descuentosProveedor: DescuentosProveedor[];
  error: string | null; // Agregar un campo para manejar errores

}

const initialState: ProveedorState = {
  proveedores: [],
  proveedoresPagina: [],
  meta: null,
  tiposProveedores: [],
  descuentosProveedor: [],
  error: null, // Agregar un campo para manejar errores
}

const proveedorSlice = createSlice({
  name: 'proveedores',
  initialState,
  reducers: {
    setListProveedor: (state, action: PayloadAction<Proveedores[]>) => {
      state.proveedores = action.payload; // Establecer el Proveedor
    },
    updateProveedor: (state, action: PayloadAction<Proveedores>) => {
      const index = state.proveedores.findIndex(proveedor => proveedor.id_proveedor === action.payload.id_proveedor);
      if (index !== -1) {
        // Actualizar el proveedor existente
        state.proveedores[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProveedores.fulfilled, (state, action: PayloadAction<ResultadoProveedores>) => {
        if (action.payload.success && action.payload.proveedores) {
          if (action.payload.meta) {
            state.proveedoresPagina = action.payload.proveedores;
            state.meta = action.payload.meta;
          } else {
            state.proveedores = action.payload.proveedores;
          }
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener proveedores';
        }
      })
      .addCase(addProveedor.fulfilled, (state, action: PayloadAction<{ success: boolean, proveedores?: Proveedores[], message: string }>) => {
        if (action.payload.success && action.payload.proveedores) {
          state.proveedores = [...state.proveedores, ...action.payload.proveedores]; // Mantener proveedores anteriores y añadir nuevos
        } else {
          state.proveedores = []
          state.error = action.payload.message || 'Error al añadir el proveedor'; // Manejo de errores
        }
      })

      // Tipos de proveedores
      .addCase(getTiposProveedores.fulfilled, (state, action: PayloadAction<{ success: boolean, tiposProveedores?: [], message: string }>) => {
        if (action.payload.success && action.payload.tiposProveedores) {
          state.tiposProveedores = action.payload.tiposProveedores
        } else {
          state.tiposProveedores = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de proveedores';
        }
      })


      // Descuentos Proveedores
      .addCase(getTiposDescuento.fulfilled, (state, action: PayloadAction<{ success: boolean, descuentosProveedor?: [], message: string }>) => {
        if (action.payload.success && action.payload.descuentosProveedor) {
          state.descuentosProveedor = action.payload.descuentosProveedor
        } else {
          state.descuentosProveedor = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener tipos de descuento';
        }
      })


  }
})

export const { setListProveedor, updateProveedor } = proveedorSlice.actions
export default proveedorSlice.reducer;