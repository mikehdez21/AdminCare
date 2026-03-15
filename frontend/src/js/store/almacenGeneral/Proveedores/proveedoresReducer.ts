import { Proveedores, TiposProveedores, DescuentosProveedor } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addProveedor, getProveedores, getTiposDescuento, getTiposProveedores } from './proveedoresActions';


export interface ProveedorState{
    proveedores: Proveedores[];
    tiposProveedores: TiposProveedores[];
    descuentosProveedor: DescuentosProveedor[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: ProveedorState = {
  proveedores: [],
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
      .addCase(getProveedores.fulfilled, (state, action: PayloadAction<{success: boolean, proveedores?: Proveedores[], message: string}>) => {
        if (action.payload.success && action.payload.proveedores){
          state.proveedores = action.payload.proveedores
        } else {
          state.proveedores = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener proveedores';
        }
      })
      .addCase(getProveedores.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(addProveedor.fulfilled, (state, action: PayloadAction<{success: boolean, proveedores?: Proveedores[], message: string}>) => {
        if (action.payload.success && action.payload.proveedores){
          state.proveedores = [...state.proveedores, ...action.payload.proveedores]; // Mantener proveedores anteriores y añadir nuevos
        } else {
          state.proveedores = []
          state.error = action.payload.message || 'Error al añadir el proveedor'; // Manejo de errores
        }
      })
      .addCase(addProveedor.rejected, (state, action) => {
        state.error = action.payload as string
      })

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

      
  }
})

export const {setListProveedor, updateProveedor} = proveedorSlice.actions
export default proveedorSlice.reducer;