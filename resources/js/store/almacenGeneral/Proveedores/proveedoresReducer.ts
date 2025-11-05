import { Proveedores } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addProveedor, getProveedores } from './proveedoresActions';


export interface ProveedorState{
    proveedores: Proveedores[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: ProveedorState = {
  proveedores: [],
  error: null, // Agregar un campo para manejar errores
}

const proveedorSlice = createSlice({
  name: 'proveedores',
  initialState,
  reducers: {
    setProveedor: (state, action: PayloadAction<Proveedores[]>) => {
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
  }
})

export const {setProveedor, updateProveedor} = proveedorSlice.actions
export default proveedorSlice.reducer;