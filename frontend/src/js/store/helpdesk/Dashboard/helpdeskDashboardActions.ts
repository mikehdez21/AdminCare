import { isAxiosError } from 'axios';
import type { HelpdeskConteoCatalogo, HelpdeskDashboard, TicketFiltros } from '@/@types/HelpdeskTypes/ticketTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

const BASE = `${API_BASE_URL}/api/helpdesk`;

export interface ResultadoDashboard {
  success: boolean;
  dashboard?: HelpdeskDashboard | null;
  message: string;
}

/**
 * Normaliza los listados de conteo a una forma única `{ id, nombre, color, total }`.
 *
 * El backend los arma con `contarCatalogos(...)` o `listarConteos(...)`, donde la clave y el
 * nombre son los de cada catálogo (o los de la tabla que resuelve el nombre). Por eso cada
 * listado llega con claves distintas y el frontend tiene que conocerlas:
 *
 *   por_estatus      -> id_estatus_ticket,      nombre_estatus,       color, total
 *   por_prioridad    -> id_prioridad_ticket,    nombre_prioridad,     color, total
 *   por_departamento -> id_departamento,        nombre_departamento,          total
 *   por_solicitante  -> id_usuario_solicitante, nombre_solicitante,           total
 *
 * Aquí se aplanan a una sola forma, que es lo que los charts y las tarjetas necesitan.
 * Sin esto, leer `.nombre` daba `undefined` en los tres y los graphs salían vacíos.
 *
 * Se hace en el thunk y no en el componente: el store guarda la forma que el resto
 * del código da por cierta y la inconsistencia del backend se resuelve una sola
 * vez, en el borde.
 */
function normalizarConteos(
  bruto: unknown,
  claveId: string,
  claveNombre: string,
): HelpdeskConteoCatalogo[] {
  if (!Array.isArray(bruto)) {
    return [];
  }

  return bruto.map(item => ({
    id: Number(item[claveId]),
    nombre: String(item[claveNombre] ?? ''),
    color: item.color ?? null,
    total: Number(item.total ?? 0),
  }));
}

// Métricas del dashboard. Acepta los mismos filtros que el listado para que las
// tarjetas y la tabla del panel admin cuenten lo mismo que se está viendo.
export const getHelpdeskDashboard = createAsyncThunk<ResultadoDashboard, TicketFiltros | void>(
  'helpdesk/getHelpdeskDashboard',
  async (filtros: TicketFiltros | void) => {
    try {
      const params = Object.fromEntries(
        Object.entries(filtros ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== '')
      );

      const response = await api.get(`${BASE}/dashboard`, { params });

      const datos = response.data.data;

      return {
        success: response.data.success,
        dashboard: datos
          ? {
            ...datos,
            por_estatus: normalizarConteos(datos.por_estatus, 'id_estatus_ticket', 'nombre_estatus'),
            por_prioridad: normalizarConteos(datos.por_prioridad, 'id_prioridad_ticket', 'nombre_prioridad'),
            por_departamento: normalizarConteos(datos.por_departamento, 'id_departamento', 'nombre_departamento'),
            por_solicitante: normalizarConteos(datos.por_solicitante, 'id_usuario_solicitante', 'nombre_solicitante'),
            por_titulo: normalizarConteos(datos.por_titulo, 'id_titulo_ticket', 'nombre_titulo_ticket'),
            por_responsable: normalizarConteos(datos.por_responsable, 'id_responsable', 'nombre_responsable'),
            por_error_proveedor: normalizarConteos(datos.por_error_proveedor, 'id_proveedor_error', 'nombre_proveedor_error'),
          }
          : null,
        message: response.data.message,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {
          success: false,
          message: getBackendErrorMessage(error.response.data, 'Error inesperado'),
        };
      }

      return { success: false, message: 'Error inesperado' };
    }
  }
);