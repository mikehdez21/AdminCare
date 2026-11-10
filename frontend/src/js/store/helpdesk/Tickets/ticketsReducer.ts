import type { PaginacionMeta } from '@/@types/paginacionTypes';
import type { Ticket } from '@/@types/HelpdeskTypes/ticketTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  actualizarEtiquetas,
  cambiarEstado,
  cerrarTicket,
  crearTicket,
  establecerTecnicos,
  getTicketById,
  getTickets,
  marcarErrorProveedor,
  reabrirTicket,
  responderEncuesta,
  type ResultadoEncuesta,
  type ResultadoTicket,
  type ResultadoTickets,
} from './ticketsActions';

export interface TicketState {
  /** Página actual del listado paginado. */
  tickets: Ticket[];
  /** Metadatos de la última consulta paginada. */
  meta: PaginacionMeta | null;
  /** Detalle del ticket abierto, con avances y encuesta. */
  ticketSeleccionado: Ticket | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  meta: null,
  ticketSeleccionado: null,
  loading: false,
  error: null,
}

/** Sustituye el ticket en cualquier lista donde ya estuviera cargado. */
function reemplazarTicket(state: TicketState, ticket: Ticket | null | undefined): void {
  if (!ticket?.id_ticket) {
    return;
  }

  const enPagina = state.tickets.findIndex(t => t.id_ticket === ticket.id_ticket);

  if (enPagina !== -1) {
    state.tickets[enPagina] = ticket;
  }

  if (state.ticketSeleccionado?.id_ticket === ticket.id_ticket) {
    state.ticketSeleccionado = ticket;
  }
}

const ticketSlice = createSlice({
  name: 'helpdeskTickets',
  initialState,
  reducers: {
    limpiarTicketSeleccionado: (state) => {
      state.ticketSeleccionado = null;
      state.error = null;
    },
    limpiarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTickets.fulfilled, (state, action: PayloadAction<ResultadoTickets>) => {
        state.loading = false;

        if (action.payload.success && action.payload.tickets) {
          state.tickets = action.payload.tickets;
          state.meta = action.payload.meta ?? null;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los tickets';
        }
      })

      .addCase(getTicketById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketById.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        state.loading = false;

        if (action.payload.success) {
          state.ticketSeleccionado = action.payload.ticket ?? null;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener el ticket';
        }
      })

      // Toda acción de escritura devuelve el ticket ya con detalle: se parchea en
      // la lista y en el detalle abierto para no depender de un `refetch`.
      .addCase(crearTicket.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (!action.payload.success) {
          state.error = action.payload.message || 'Error al crear el ticket';
          return;
        }

        if (action.payload.ticket) {
          state.tickets = [action.payload.ticket, ...state.tickets];
          state.ticketSeleccionado = action.payload.ticket;
        }

        state.error = null;
      })

      .addCase(cambiarEstado.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (action.payload.success) {
          reemplazarTicket(state, action.payload.ticket);
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al cambiar el estatus';
        }
      })

      .addCase(establecerTecnicos.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (action.payload.success) {
          reemplazarTicket(state, action.payload.ticket);
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al asignar los técnicos';
        }
      })

      .addCase(cerrarTicket.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (action.payload.success) {
          reemplazarTicket(state, action.payload.ticket);
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al cerrar el ticket';
        }
      })

      .addCase(reabrirTicket.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (action.payload.success) {
          reemplazarTicket(state, action.payload.ticket);
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al reabrir el ticket';
        }
      })

      // La encuesta no cambia el ticket: solo habilita (o bloquea) el formulario
      // de calificación en el detalle.
      .addCase(responderEncuesta.fulfilled, (state, action: PayloadAction<ResultadoEncuesta>) => {
        if (action.payload.success && state.ticketSeleccionado) {
          state.ticketSeleccionado.encuesta = action.payload.encuesta ?? null;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al registrar la encuesta';
        }
      })

      .addCase(marcarErrorProveedor.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (action.payload.success) {
          reemplazarTicket(state, action.payload.ticket);
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al actualizar el ticket';
        }
      })

      .addCase(actualizarEtiquetas.fulfilled, (state, action: PayloadAction<ResultadoTicket>) => {
        if (action.payload.success) {
          // La respuesta trae el ticket con `conDetalle`, así que las etiquetas ya
          // vienen resueltas: se parchea igual que en el resto de escrituras.
          reemplazarTicket(state, action.payload.ticket);
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al actualizar las etiquetas';
        }
      })
  }
})

export const { limpiarTicketSeleccionado, limpiarError } = ticketSlice.actions
export default ticketSlice.reducer;