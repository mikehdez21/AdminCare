import { createSlice } from '@reduxjs/toolkit';
import { checkApiStatus } from './statusActions';

export interface ApiStatusState {
  success: boolean | null;
  message: string;
  statusCode: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApiStatusState = {
  success: null,
  message: '',
  statusCode: null,
  loading: false,
  error: null,
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkApiStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkApiStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.statusCode = action.payload.statusCode;
        state.error = null;
      })
      .addCase(checkApiStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'No se pudo obtener el estado de la API.';
      });
  },
});

export default statusSlice.reducer;
