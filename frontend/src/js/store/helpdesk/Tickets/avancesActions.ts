import { isAxiosError } from 'axios';
import type { AvanceTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

const BASE = `${API_BASE_URL}/api/helpdesk`;

export interface ResultadoAvances {
  success: boolean;
  avances?: AvanceTicket[];
  message: string;
}

export interface ResultadoAvance {
  success: boolean;
  avance?: AvanceTicket | null;
  message: string;
}

function mensajeDeError(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    return getBackendErrorMessage(error.response.data, 'Error inesperado');
  }

  return 'Error inesperado';
}

function formatearAvance(avance: AvanceTicket): AvanceTicket {
  return {
    ...avance,
    created_at: avance.created_at ? formatDateHorasToFrontend(avance.created_at) : avance.created_at,
    updated_at: avance.updated_at ? formatDateHorasToFrontend(avance.updated_at) : avance.updated_at,
  };
}

/**
 * Bitácora del ticket.
 *
 * El backend ya recorta las notas internas según el rol (`AvanceService::listarAvances`),
 * pero el listado se guarda tal cual y el filtrado por rol se hace en el selector para
 * que una respuesta inconsistente tampoco llegue a pintar una nota interna.
 */
export const getAvances = createAsyncThunk<ResultadoAvances, number>(
  'helpdesk/getAvances',
  async (ticketId: number) => {
    try {
      const response = await api.get(`${BASE}/tickets/${ticketId}/avances`);

      const avances = (response.data.data ?? []).map((avance: AvanceTicket) => formatearAvance(avance));

      return { success: response.data.success, avances, message: response.data.message };
    } catch (error) {
      return { success: false, message: mensajeDeError(error) };
    }
  }
);

// Registro de avance. Solo el técnico que atiende el ticket puede escribir
// (403 del backend aun con permiso global de escritura).
export const crearAvance = createAsyncThunk<ResultadoAvance, { ticketId: number; contenido_avance: string; es_interno: boolean }>(
  'helpdesk/crearAvance',
  async ({ ticketId, ...data }) => {
    try {
      const response = await api.post(`${BASE}/tickets/${ticketId}/avances`, data);

      return { success: response.data.success, avance: response.data.data ?? null, message: response.data.message };
    } catch (error) {
      return { success: false, message: mensajeDeError(error) };
    }
  }
);

// Baja lógica. El ticket se infiere del avance en el backend, así que solo viaja el id.
export const eliminarAvance = createAsyncThunk<ResultadoAvance, number>(
  'helpdesk/eliminarAvance',
  async (idAvance: number) => {
    try {
      const response = await api.delete(`${BASE}/avances/${idAvance}`);

      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return { success: false, message: mensajeDeError(error) };
    }
  }
);