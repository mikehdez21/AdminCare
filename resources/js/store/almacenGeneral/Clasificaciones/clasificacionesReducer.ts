import { Clasificaciones } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addClasificacion, getClasificaciones } from './clasificacionesActions';


export interface ClasificacionState{
    clasificaciones: Clasificaciones[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: ClasificacionState = {
  clasificaciones: [],
  error: null, // Agregar un campo para manejar errores
}

const clasificacionSlice = createSlice({
  name: 'clasificaciones',
  initialState,
  reducers: {
    setClasificacion: (state, action: PayloadAction<Clasificaciones[]>) => {
      state.clasificaciones = action.payload; // Establecer el Proveedor
    },
    updateClasificacion: (state, action: PayloadAction<Clasificaciones>) => {
      const index = state.clasificaciones.findIndex(clasificacion => clasificacion.id_clasificacion === action.payload.id_clasificacion);
      if (index !== -1) {
        // Actualizar el proveedor existente
        state.clasificaciones[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClasificaciones.fulfilled, (state, action: PayloadAction<{success: boolean, clasificaciones?: Clasificaciones[], message: string}>) => {
        if (action.payload.success && action.payload.clasificaciones){
          state.clasificaciones = action.payload.clasificaciones
        } else {
          state.clasificaciones = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener clasificacionessss';
        }
      })
      .addCase(getClasificaciones.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(addClasificacion.fulfilled, (state, action: PayloadAction<{success: boolean, clasificaciones?: Clasificaciones[], message: string}>) => {
        if (action.payload.success && action.payload.clasificaciones){
          state.clasificaciones = [...state.clasificaciones, ...action.payload.clasificaciones]; // Mantener proveedores anteriores y añadir nuevos
        } else {
          state.clasificaciones = []
          state.error = action.payload.message || 'Error al añadir la clasificación'; // Manejo de errores
        }
      })
      .addCase(addClasificacion.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const {setClasificacion, updateClasificacion} = clasificacionSlice.actions
export default clasificacionSlice.reducer;