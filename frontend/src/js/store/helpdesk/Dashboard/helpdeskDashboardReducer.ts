import type { HelpdeskDashboard } from '@/@types/HelpdeskTypes/ticketTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getHelpdeskDashboard, type ResultadoDashboard } from './helpdeskDashboardActions';

export interface HelpdeskDashboardState {
  dashboard: HelpdeskDashboard | null;
  loading: boolean;
  error: string | null;
}

const initialState: HelpdeskDashboardState = {
  dashboard: null,
  loading: false,
  error: null,
}

const helpdeskDashboardSlice = createSlice({
  name: 'helpdeskDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getHelpdeskDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHelpdeskDashboard.fulfilled, (state, action: PayloadAction<ResultadoDashboard>) => {
        state.loading = false;

        if (action.payload.success) {
          state.dashboard = action.payload.dashboard ?? null;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener las métricas';
        }
      })
  }
})

export default helpdeskDashboardSlice.reducer;