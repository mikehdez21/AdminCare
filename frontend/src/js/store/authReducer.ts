import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, logout } from './authActions';

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | undefined;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Accion para establecer el Estado TRUE or FALSE de IsAuth
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload; // Establecer la lista completa de usuarios
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.error = undefined;
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
        state.isAuthenticated = true;
        state.error = undefined;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const {setAuthState} = authSlice.actions
export default authSlice.reducer;
