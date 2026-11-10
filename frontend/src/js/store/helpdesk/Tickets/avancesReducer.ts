import type { RootState } from '@/store/store';
import type { AvanceTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { administraHelpdesk, atiendeLaCategoria } from '@/utils/helpdesk';
import { crearAvance, eliminarAvance, getAvances, type ResultadoAvance, type ResultadoAvances } from './avancesActions';

export interface AvancesState {
  /** Bitácora del ticket abierto, tal como la devolvió el backend. */
  avances: AvanceTicket[];
  loading: boolean;
  error: string | null;
}

const initialState: AvancesState = {
  avances: [],
  loading: false,
  error: null,
}

const avancesSlice = createSlice({
  name: 'helpdeskAvances',
  initialState,
  reducers: {
    limpiarAvances: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAvances.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAvances.fulfilled, (state, action: PayloadAction<ResultadoAvances>) => {
        state.loading = false;

        if (action.payload.success && action.payload.avances) {
          state.avances = action.payload.avances;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los avances';
        }
      })

      .addCase(crearAvance.fulfilled, (state, action: PayloadAction<ResultadoAvance>) => {
        if (!action.payload.success) {
          state.error = action.payload.message || 'Error al registrar el avance';
          return;
        }

        // El backend los devuelve del más reciente al más antiguo.
        if (action.payload.avance) {
          state.avances = [action.payload.avance, ...state.avances];
        }

        state.error = null;
      })

      .addCase(eliminarAvance.fulfilled, (state, action) => {
        if (!action.payload.success) {
          state.error = action.payload.message || 'Error al eliminar el avance';
          return;
        }

        // El id borrado no viaja en la respuesta (`data: null`): se toma del
        // thunk vía `meta.arg` para quitar la fila sin recargar la bitácora.
        const idEliminado = action.meta.arg;

        state.avances = state.avances.filter(avance => avance.id_avance_ticket !== idEliminado);
        state.error = null;
      })
  }
})

export const { limpiarAvances } = avancesSlice.actions
export default avancesSlice.reducer;

/**
 * Avances que el usuario en sesión puede ver.
 *
 * El backend ya aplica el mismo recorte, pero el estado guarda la respuesta
 * completa: si una respuesta llega inconsistente, filtrar aquí evita que una
 * nota interna llegue a pintarse. Las ven el técnico con el ticket asignado, el
 * técnico del área que atiende la categoría y quien tiene la gestión interna del
 * Helpdesk (`helpdesk.internas.lectura`).
 */
export const selectAvancesVisibles = (state: RootState, idTicket?: number): AvanceTicket[] => {
  const ticket = idTicket === undefined
    ? state.helpdeskTickets.ticketSeleccionado
    : state.helpdeskTickets.tickets.find(t => t.id_ticket === idTicket);

  const esTecnicoDelTicket = ticket?.id_responsable != null
    && state.auth.user?.id_empleado != null
    && ticket.id_responsable === state.auth.user.id_empleado;

  if (esTecnicoDelTicket
    || atiendeLaCategoria(ticket, state.auth.user)
    || administraHelpdesk(state.auth.permissions)) {
    return state.helpdeskAvances.avances;
  }

  return state.helpdeskAvances.avances.filter(avance => !avance.es_interno);
};

/**
 * El usuario puede escribir en la bitácora: atiende el ticket, es del área que atiende
 * su categoría o administra el módulo.
 */
export const selectPuedeEscribirAvances = (state: RootState): boolean => {
  const ticket = state.helpdeskTickets.ticketSeleccionado;

  const esTecnicoDelTicket = ticket?.id_responsable != null
    && state.auth.user?.id_empleado != null
    && ticket.id_responsable === state.auth.user.id_empleado;

  return esTecnicoDelTicket
    || atiendeLaCategoria(ticket, state.auth.user)
    || administraHelpdesk(state.auth.permissions);
};