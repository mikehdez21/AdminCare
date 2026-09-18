import { User } from '@/@types/mainTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addUser, getUsers, editUsuario, bajaUsuario, ResultadoUsuarios } from './usersActions';

export interface UsersState{
    users: User[]; // Lista completa de usuarios
    /** Página devuelta por las consultas paginadas (page/per_page). */
    usersPagina: User[];
    /** Metadatos de la última consulta paginada. */
    meta: PaginacionMeta | null;
    currentUser: User | null; // Usuario Logeado en Especifico
    error: string | null; // Agregar un campo para manejar errores

}

const initialState: UsersState = {
  users: [], // Lista completa de usuarios
  usersPagina: [],
  meta: null,
  currentUser: null, // Usuario Logeado en Especifico
  error: null, // Agregar un campo para manejar errores
}

const userSlice = createSlice({
  name: 'Usuarios',
  initialState,
  reducers: {

    // Acciones para la lista completa de usuarios
    setListUsuarios: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload; // Establecer la lista completa de usuarios
    },

    updateUsuario: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id_usuario === action.payload.id_usuario);
      if (index !== -1) {
        state.users[index] = {
          ...state.users[index],
          ...action.payload, // Actualizar todos los datos, incluido el departamento
        };      
      }
    },

    // Acciones para el usuario actual (currentUser)
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload; // Establece el usuario actual LOGEADO en el estado
    },

    clearCurrentUser: (state) => {
      state.currentUser = null;
    },


  },
  extraReducers: (builder) => {
    builder
      // Manejo de la lista completa de usuarios
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<ResultadoUsuarios>) => {
        if (action.payload.success && action.payload.users) {
          if (action.payload.meta) {
            state.usersPagina = action.payload.users; // Carga la página de usuarios obtenida
            state.meta = action.payload.meta;
          } else {
            state.users = action.payload.users; // Carga la lista de usuarios obtenida
          }
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al obtener usuarios'; // Maneja errores al obtener usuarios
        }
      })
      .addCase(addUser.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.users) {
          state.users = [...state.users, ...action.payload.users]; // Añade usuarios nuevos a la lista existente
          state.error = null; // Limpia errores previos
        } else {
          state.error = action.payload.message || 'Error al añadir el usuario'; // Maneja errores al añadir usuarios
        }
      })
  
      // Manejo de usuarios individuales en la lista (actualización/eliminación)
      .addCase(editUsuario.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.message) {
          const updatedUser = action.meta.arg; // Usuario actualizado enviado como argumento
          const index = state.users.findIndex((user) => user.id_usuario === updatedUser.id_usuario);
          if (index !== -1) {
            state.users[index] = updatedUser; // Actualiza el usuario en la lista
          }
        } else {
          state.error = action.payload.message || 'Error al editar el usuario'; // Maneja errores al editar
        }
      })

      // Manejo de eliminación de usuarios (Borrado físico)
      .addCase(bajaUsuario.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.users = state.users.filter(
            (user) => user.id_usuario !== action.meta.arg.id_usuario
          ); // Elimina el usuario de la lista
        } else {
          state.error = action.payload.message || 'Error al eliminar el usuario'; // Maneja errores al eliminar
        }
      });
  },
})

export const {setListUsuarios, updateUsuario, setCurrentUser, clearCurrentUser} = userSlice.actions
export default userSlice.reducer;
