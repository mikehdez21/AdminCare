import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, logout, refreshAuthPermissions } from './authActions';
import { User } from '@/@types/mainTypes';

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | undefined;
  user?: User | null;
  permissions: string[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: undefined,
  user: null,
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Accion para establecer el Estado TRUE or FALSE de IsAuth
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload; // Establecer la lista completa de usuarios
    },
    setAuthPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
      localStorage.setItem('userRolPermissions', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.userData;
        state.permissions = action.payload.userRolPermissions;
        state.error = undefined;
        localStorage.setItem('userRolPermissions', JSON.stringify(action.payload.userRolPermissions));
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload?.message;
      })

      .addCase(logout.pending, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.error = undefined;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(refreshAuthPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload.permissions || [];
        localStorage.setItem('userRolPermissions', JSON.stringify(state.permissions));
      })
      .addCase(refreshAuthPermissions.rejected, (state, action) => {
        state.error = action.payload?.message;
      });
  },
});

export const { setAuthState, setAuthPermissions } = authSlice.actions
export default authSlice.reducer;
