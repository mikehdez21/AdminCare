import { Roles } from '@/@types/mainTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addRol, getRoles } from './rolesActions';

export interface RolState{
    roles: Roles[];
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: RolState = {
  roles: [] as Roles[],
  error: null, // Agregar un campo para manejar errores
}

const rolSlice = createSlice({
  name: 'Roles',
  initialState,
  reducers: {
    setListRoles: (state, action: PayloadAction<Roles[]>) => {
      state.roles = action.payload; // Establecer el Rol
    },
    updateRol: (state, action: PayloadAction<Roles>) => {
      const index = state.roles.findIndex(rol => rol.id === action.payload.id);
      if (index !== -1) {
        // Actualizar el rol existente
        state.roles[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.fulfilled, (state, action: PayloadAction<{success: boolean, roles?: Roles[], message: string}>) => {
        
        if (action.payload.success && action.payload.roles){
          state.roles = action.payload.roles
        } else {
          state.roles = []
          state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener roles';
        }
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(addRol.fulfilled, (state, action: PayloadAction<{success: boolean, roles?: Roles[], message: string}>) => {
        if (action.payload.success && action.payload.roles){
          state.roles = [...state.roles, ...action.payload.roles]; // Mantener roles anteriores y añadir nuevos
        } else {
          state.roles = []
          state.error = action.payload.message || 'Error al añadir el rol'; // Manejo de errores
        }
      })
      .addCase(addRol.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const {setListRoles, updateRol} = rolSlice.actions
export default rolSlice.reducer;