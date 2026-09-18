import { Roles } from '@/@types/mainTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addRol, getRoles, ResultadoRoles } from './rolesActions';

export interface RolState{
    roles: Roles[];
    /** Página devuelta por las consultas paginadas (page/per_page). */
    rolesPagina: Roles[];
    /** Metadatos de la última consulta paginada. */
    meta: PaginacionMeta | null;
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: RolState = {
  roles: [] as Roles[],
  rolesPagina: [] as Roles[],
  meta: null,
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
      .addCase(getRoles.fulfilled, (state, action: PayloadAction<ResultadoRoles>) => {
        
        if (action.payload.success && action.payload.roles){
          if (action.payload.meta) {
            state.rolesPagina = action.payload.roles;
            state.meta = action.payload.meta;
          } else {
            state.roles = action.payload.roles;
          }
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener roles';
        }
      })
      .addCase(addRol.fulfilled, (state, action: PayloadAction<{success: boolean, roles?: Roles[], message: string}>) => {
        if (action.payload.success && action.payload.roles){
          state.roles = [...state.roles, ...action.payload.roles]; // Mantener roles anteriores y añadir nuevos
        } else {
          state.roles = []
          state.error = action.payload.message || 'Error al añadir el rol'; // Manejo de errores
        }
      })
  }
})

export const {setListRoles, updateRol} = rolSlice.actions
export default rolSlice.reducer;