import { isAxiosError } from 'axios';
import type {
  CategoriaTicket,
  EstatusTicket,
  HelpdeskEmpleado,
  HelpdeskEtiqueta,
  HelpdeskModuloSIHO,
  HelpdeskProveedorError,
  HelpdeskSistemaProveedor,
  PrioridadTicket,
  SubcategoriaTicket,
  TituloTicket,
} from '@/@types/HelpdeskTypes/ticketTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';
import type { CatalogosState } from './catalogosReducer';

const BASE = `${API_BASE_URL}/api/helpdesk`;

export interface ResultadoCatalogo<T> {
  success: boolean;
  items?: T[];
  message: string;
}

function mensajeDeError(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    return getBackendErrorMessage(error.response.data, 'Error inesperado');
  }

  return 'Error inesperado';
}

/**
 * Todos los catálogos responden el mismo envelope `{ success, message, data }`.
 *
 * El error se devuelve dentro del resultado en vez de rechazarse, para que cada
 * thunk no repita el `try/catch` ni tenga que declarar el tipo de `rejectValue`.
 * Lo consume también la pantalla de Configuración.
 */
export async function pedirCatalogo<T>(url: string, params?: Record<string, number>): Promise<ResultadoCatalogo<T>> {
  try {
    const response = await api.get(url, params ? { params } : undefined);

    return { success: response.data.success, items: response.data.data ?? [], message: response.data.message };
  } catch (error) {
    return { success: false, message: mensajeDeError(error) };
  }
}

// Categorías: departamento responsable que atiende el ticket.
export const getCategorias = createAsyncThunk<ResultadoCatalogo<CategoriaTicket>>(
  'helpdesk/getCategorias',
  async () => pedirCatalogo<CategoriaTicket>(`${BASE}/categorias`)
);

/**
 * Títulos que puede elegir el solicitante dentro de una categoría.
 *
 * El backend aplana las subcategorías para que el solicitante nunca las vea.
 * `condition` evita repetir el fetch al cambiar de paso en el formulario: la
 * caché por `id_categoria_ticket` la lleva el reducer.
 */
export const getTitulos = createAsyncThunk<ResultadoCatalogo<TituloTicket>, number, { state: { helpdeskCatalogos: CatalogosState } }>(
  'helpdesk/getTitulos',
  async (idCategoria: number) => pedirCatalogo<TituloTicket>(`${BASE}/categorias/${idCategoria}/titulos`),
  {
    condition: (idCategoria, { getState }) => {
      const yaCargados = getState().helpdeskCatalogos.titulosPorCategoria[idCategoria];

      return yaCargados === undefined;
    },
  }
);

// Subcategorías: solo para administración y filtrado, el solicitante no las elige.
export const getSubcategorias = createAsyncThunk<ResultadoCatalogo<SubcategoriaTicket>, number | undefined>(
  'helpdesk/getSubcategorias',
  async (idCategoria?: number) => pedirCatalogo<SubcategoriaTicket>(
    idCategoria === undefined ? `${BASE}/subcategorias` : `${BASE}/subcategorias?id_categoria_ticket=${idCategoria}`
  )
);

export const getPrioridades = createAsyncThunk<ResultadoCatalogo<PrioridadTicket>>(
  'helpdesk/getPrioridades',
  async () => pedirCatalogo<PrioridadTicket>(`${BASE}/prioridades`)
);

export const getEstatus = createAsyncThunk<ResultadoCatalogo<EstatusTicket>>(
  'helpdesk/getEstatus',
  async () => pedirCatalogo<EstatusTicket>(`${BASE}/estatus`)
);

export const getEtiquetas = createAsyncThunk<ResultadoCatalogo<HelpdeskEtiqueta>>(
  'helpdesk/getEtiquetas',
  async () => pedirCatalogo<HelpdeskEtiqueta>(`${BASE}/etiquetas`)
);

// Empleados del departamento del usuario en sesión: la cuenta compartida elige
// uno al crear el ticket y la cuenta normal usa el suyo.
export const getEmpleadosHelpdesk = createAsyncThunk<ResultadoCatalogo<HelpdeskEmpleado>>(
  'helpdesk/getEmpleadosHelpdesk',
  async () => pedirCatalogo<HelpdeskEmpleado>(`${BASE}/empleados`)
);

// Catálogos de errores de proveedor (CORR-030). Los tres se piden completos —son
// listas cortas— y el detalle filtra en cliente: los sistemas por proveedor y los
// módulos por nada, porque son de SIHO.
export const getProveedoresError = createAsyncThunk<ResultadoCatalogo<HelpdeskProveedorError>>(
  'helpdesk/getProveedoresError',
  async () => pedirCatalogo<HelpdeskProveedorError>(`${BASE}/proveedores-error`)
);

export const getSistemasProveedor = createAsyncThunk<ResultadoCatalogo<HelpdeskSistemaProveedor>>(
  'helpdesk/getSistemasProveedor',
  async () => pedirCatalogo<HelpdeskSistemaProveedor>(`${BASE}/sistemas-proveedor`)
);

export const getModulosSIHO = createAsyncThunk<ResultadoCatalogo<HelpdeskModuloSIHO>>(
  'helpdesk/getModulosSIHO',
  async () => pedirCatalogo<HelpdeskModuloSIHO>(`${BASE}/modulos-siho`)
);

