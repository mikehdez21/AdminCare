import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, logout, refreshAuthPermissions, checkAuthSession } from './authActions';
import { User } from '@/@types/mainTypes';

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  checking: boolean;
  error: string | undefined;
  user?: User | null;
  permissions: string[];
  rol: string | null;
  departamento: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  checking: true,
  error: undefined,
  user: null,
  permissions: [],
  rol: null,
  departamento: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setAuthPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    clearAuth: () => {
      return { ...initialState, checking: false };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.checking = false;

        if (action.payload.success) {
          state.isAuthenticated = true;
          state.user = action.payload.userData;
          state.permissions = action.payload.userRolPermissions;
          state.rol = action.payload.userRol;
          state.departamento = action.payload.userDepartamento;
          state.error = undefined;
        } else {
          state.isAuthenticated = false;
          state.error = action.payload.message;
        }
      })

      .addCase(logout.pending, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(logout.fulfilled, (state, action) => {
        if (action.payload.success || action.payload.sessionInvalid === true) {
          // Logout confirmado por el backend: limpiar el estado de sesión.
          state.isAuthenticated = false;
          state.user = null;
          state.permissions = [];
          state.rol = null;
          state.departamento = null;
          state.checking = false;
          state.error = undefined;
        } else {
          // Un logout fallido debe conservar la sesión: el backend mantiene la
          // cookie/sesión, así que desloguear aquí dejaría el frontend y el
          // backend en estados divergentes. Solo informar el error y dejar que
          // LogoutModal muestre el Swal sin redirigir.
          state.error = action.payload.message;
        }
      })

      .addCase(checkAuthSession.pending, (state) => {
        state.checking = true;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.checking = false;

        if (action.payload.success && action.payload.userData) {
          state.isAuthenticated = true;
          state.user = action.payload.userData;
          state.permissions = action.payload.userRolPermissions;
          state.rol = action.payload.userRol;
          state.departamento = action.payload.userDepartamento;
          state.error = undefined;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.permissions = [];
          state.rol = null;
          state.departamento = null;
          state.error = action.payload.message;
        }
      })

      .addCase(refreshAuthPermissions.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.permissions = action.payload.permissions || [];
          state.error = undefined;
        } else {
          state.error = action.payload.message;
        }
      });
  },
});

export const { setAuthState, setAuthPermissions, clearAuth } = authSlice.actions
export default authSlice.reducer;
