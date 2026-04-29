import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addClasificacion, getClasificaciones } from './clasificacionesActions';


export interface ClasificacionState{
    clasificacionesAF: ClasificacionesAF[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: ClasificacionState = {
  clasificacionesAF: [],
  error: null, // Agregar un campo para manejar errores
}

const clasificacionSlice = createSlice({
  name: 'clasificaciones',
  initialState,
  reducers: {
    setListClasificacion: (state, action: PayloadAction<ClasificacionesAF[]>) => {
      state.clasificacionesAF = action.payload; // Establecer el Proveedor
    },
    updateClasificacion: (state, action: PayloadAction<ClasificacionesAF>) => {
      const index = state.clasificacionesAF.findIndex(clasificacion => clasificacion.id_clasificacion === action.payload.id_clasificacion);
      if (index !== -1) {
        // Actualizar el proveedor existente
        state.clasificacionesAF[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClasificaciones.fulfilled, (state, action: PayloadAction<{success: boolean, clasificacion?: ClasificacionesAF[], message: string}>) => {
        if (action.payload.success && Array.isArray(action.payload.clasificacion)){
          state.clasificacionesAF = action.payload.clasificacion;
          state.error = null;
        } else {
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener clasificacionessss';
        }
      })
      .addCase(getClasificaciones.rejected, (state, action) => {
        state.error = action.error.message || 'Error al obtener clasificaciones';
      })
      .addCase(addClasificacion.fulfilled, (state, action: PayloadAction<{success: boolean, message: string}>) => {
        if (action.payload.success){
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al añadir la clasificación'; // Manejo de errores
        }
      })
      .addCase(addClasificacion.rejected, (state, action) => {
        state.error = action.error.message || 'Error al añadir la clasificación';
      })
  }
})

export const {setListClasificacion, updateClasificacion} = clasificacionSlice.actions
export default clasificacionSlice.reducer;