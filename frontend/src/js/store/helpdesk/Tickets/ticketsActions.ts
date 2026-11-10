import { isAxiosError } from 'axios';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import type { EncuestaSatisfaccion, ErrorProveedorPayload, TecnicosPayload, Ticket, TicketFiltros, TicketFormData } from '@/@types/HelpdeskTypes/ticketTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

const BASE = `${API_BASE_URL}/api/helpdesk`;

// ---------------------------------------------------------------------------
// Resultados de las consultas de tickets. `meta` solo viene cuando la consulta
// se hizo paginada (page/per_page).
// ---------------------------------------------------------------------------
export interface ResultadoTickets {
  success: boolean;
  tickets?: Ticket[];
  meta?: PaginacionMeta | null;
  message: string;
}

export interface ResultadoTicket {
  success: boolean;
  ticket?: Ticket | null;
  message: string;
}

/** Parámetros del listado: paginación + filtros combinables del backend. */
export type TicketsQueryParams = PaginacionParams & TicketFiltros;

function mensajeDeError(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    return getBackendErrorMessage(error.response.data, 'Error inesperado');
  }

  return 'Error inesperado';
}

function formatearTicket(ticket: Ticket): Ticket {
  return {
    ...ticket,
    created_at: ticket.created_at ? formatDateHorasToFrontend(ticket.created_at) : ticket.created_at,
    updated_at: ticket.updated_at ? formatDateHorasToFrontend(ticket.updated_at) : ticket.updated_at,
  };
}

/**
 * Acciones que responden con el ticket ya recargado con su detalle
 * (`cambiar-estado`, `tecnicos`, `cerrar`, `reabrir`, `PUT tickets/{id}`).
 */
async function accionSobreTicket(metodo: 'put' | 'post', url: string, data?: unknown): Promise<ResultadoTicket> {
  try {
    const response = await api.request({ method: metodo, url, data });

    return { success: response.data.success, ticket: response.data.data ?? null, message: response.data.message };
  } catch (error) {
    return { success: false, message: mensajeDeError(error) };
  }
}

// Listado paginado con filtros combinados. El alcance por rol lo acota el
// backend (`TicketService::scopeVisibleA`): "mis tickets" es el mismo endpoint
// filtrando por `id_usuario_solicitante`.
export const getTickets = createAsyncThunk<ResultadoTickets, TicketsQueryParams | void>(
  'helpdesk/getTickets',
  async (params: TicketsQueryParams | void) => {
    try {
      // Los filtros sin fijar no se envían: el backend restringe con `isset`, pero
      // mandar `id_prioridad_ticket=` acortaría los logs sin ganar nada.
      const query = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== ''));

      const response = await api.get(`${BASE}/tickets`, { params: query });

      const tickets = (response.data.data ?? []).map((ticket: Ticket) => formatearTicket(ticket));

      return { success: response.data.success, tickets, meta: response.data.meta ?? null, message: response.data.message };
    } catch (error) {
      return { success: false, message: mensajeDeError(error) };
    }
  }
);

// Detalle del ticket: catalogos, avances visibles, actividades y encuesta.
export const getTicketById = createAsyncThunk<ResultadoTicket, number>(
  'helpdesk/getTicketById',
  async (id: number) => {
    try {
      const response = await api.get(`${BASE}/tickets/${id}`);

      return { success: response.data.success, ticket: response.data.data ?? null, message: response.data.message };
    } catch (error) {
      return { success: false, message: mensajeDeError(error) };
    }
  }
);

// Alta del ticket. El folio y la clasificación completa los resuelve el servidor
// a partir de `id_categoria_ticket` + `id_titulo_ticket`.
export const crearTicket = createAsyncThunk<ResultadoTicket, TicketFormData>(
  'helpdesk/crearTicket',
  async (data: TicketFormData) => accionSobreTicket('post', `${BASE}/tickets`, data)
);

export const cambiarEstado = createAsyncThunk<ResultadoTicket, { id: number; id_estatus_ticket: number; comentario?: string | null }>(
  'helpdesk/cambiarEstado',
  async ({ id, ...data }) => accionSobreTicket('put', `${BASE}/tickets/${id}/cambiar-estado`, data)
);

export const establecerTecnicos = createAsyncThunk<ResultadoTicket, { id: number; cuerpo: TecnicosPayload }>(
  'helpdesk/establecerTecnicos',
  async ({ id, cuerpo }) => accionSobreTicket('put', `${BASE}/tickets/${id}/tecnicos`, cuerpo)
);

export const marcarErrorProveedor = createAsyncThunk<ResultadoTicket, { id: number; cuerpo: ErrorProveedorPayload }>(
  'helpdesk/marcarErrorProveedor',
  async ({ id, cuerpo }) => accionSobreTicket('put', `${BASE}/tickets/${id}/error-proveedor`, cuerpo)
);

export const cerrarTicket = createAsyncThunk<ResultadoTicket, number>(
  'helpdesk/cerrarTicket',
  async (id: number) => accionSobreTicket('put', `${BASE}/tickets/${id}/cerrar`)
);

// Reapertura del solicitante con motivo obligatorio.
export const reabrirTicket = createAsyncThunk<ResultadoTicket, { id: number; motivo: string }>(
  'helpdesk/reabrirTicket',
  async ({ id, motivo }) => accionSobreTicket('put', `${BASE}/tickets/${id}/reabrir`, { motivo })
);

/**
 * Etiqueta un ticket. Reusa `PUT helpdesk/tickets/{id}` con solo la clave
 * `etiquetas`: las reglas del controller son `sometimes` para descripción y
 * prioridad, así que enviar únicamente esa clave no toca nada más y el
 * `array_key_exists('etiquetas', ...)` del service ejecuta el `sync`.
 *
 * Lo etiqueta quien atiende el ticket, no el solicitante: la misma acción pasa por
 * `TicketService::autorizarGestion`. Etiquetar es opcional, y `[]` las quita todas.
 */
export const actualizarEtiquetas = createAsyncThunk<ResultadoTicket, { id: number; etiquetas: number[] }>(
  'helpdesk/actualizarEtiquetas',
  async ({ id, etiquetas }) => accionSobreTicket('put', `${BASE}/tickets/${id}`, { etiquetas })
);

export interface ResultadoEncuesta {
  success: boolean;
  encuesta?: EncuestaSatisfaccion | null;
  message: string;
}

// Encuesta de satisfacción del cierre. Solo aplica a ticket cerrado y sin calificar:
// el backend responde 422 en ambos casos con mensaje legible.
export const responderEncuesta = createAsyncThunk<ResultadoEncuesta, { id: number; calificacion: number; comentario_satisfaccion?: string | null }>(
  'helpdesk/responderEncuesta',
  async ({ id, calificacion, comentario_satisfaccion }) => {
    try {
      const response = await api.post(`${BASE}/tickets/${id}/encuesta`, { calificacion, comentario_satisfaccion });

      return { success: response.data.success, encuesta: response.data.data ?? null, message: response.data.message };
    } catch (error) {
      return { success: false, message: mensajeDeError(error) };
    }
  }
);