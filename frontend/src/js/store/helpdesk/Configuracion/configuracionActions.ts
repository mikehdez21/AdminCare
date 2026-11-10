import { isAxiosError } from 'axios';
import type {
  CategoriaTicket,
  EstatusTicket,
  HelpdeskEtiqueta,
  HelpdeskModuloSIHO,
  HelpdeskProveedorError,
  HelpdeskSistemaProveedor,
  PrioridadTicket,
  SLANivel,
  SubcategoriaTicket,
  TituloTicket,
} from '@/@types/HelpdeskTypes/ticketTypes';
import type {
  CategoriaTicketPayload,
  EstatusTicketPayload,
  HelpdeskEtiquetaPayload,
  ModuloSIHOPayload,
  PrioridadTicketPayload,
  ProveedorErrorPayload,
  SistemaProveedorPayload,
  SLANivelPayload,
  SubcategoriaTicketPayload,
  TituloTicketPayload,
} from '@/@types/HelpdeskTypes/configuracionTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { API_BASE_URL } from '@/variableApi';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';
import { pedirCatalogo, type ResultadoCatalogo } from '@/store/helpdesk/Catalogos/catalogosActions';
import { invalidarCatalogos } from '@/store/helpdesk/Catalogos/catalogosReducer';

const BASE = `${API_BASE_URL}/api/helpdesk`;

/**
 * Solo se necesita para despachar `invalidarCatalogos`, y se declara con el
 * tipo exacto de esa acción en vez de con `AppDispatch` a propósito: importar el
 * store desde aquí cerraría el ciclo store -> reducer -> actions -> store.
 */
type DispatchInvalidar = (accion: ReturnType<typeof invalidarCatalogos>) => unknown;

/**
 * Envoltorio de toda escritura de catálogo: devuelve el mensaje del backend tal
 * cual, porque el 422 trae en `errors` el motivo concreto (por ejemplo "tiene
 * subcategorías asociadas") y es más útil que un "Error inesperado".
 */
export interface ResultadoEscritura {
  success: boolean;
  message: string;
}

function mensajeDeError(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    return getBackendErrorMessage(error.response.data, 'Error inesperado');
  }

  return 'Error inesperado';
}

async function escribir(
  metodo: 'post' | 'put' | 'delete',
  ruta: string,
  invalidar: DispatchInvalidar,
  cuerpo?: object
): Promise<ResultadoEscritura> {
  try {
    const response = await api[metodo](ruta, cuerpo);
    const datos = response.data;
    const success = datos.success !== false;

    // Se invalida la caché del formulario de ticket solo cuando la escritura
    // quedó aceptada. Si el backend rechazó (422 con el motivo concreto), nada
    // cambió y no hay por qué tirar una caché que sigue siendo correcta.
    if (success) invalidar(invalidarCatalogos());

    return { success, message: datos.message ?? 'Operación realizada' };
  } catch (error) {
    return { success: false, message: mensajeDeError(error) };
  }
}

// === LECTURAS ===
//
// Todas piden `incluir_inactivos=1` salvo SLA y etiquetas: la pantalla tiene que
// poder ver y reactivar lo que está dado de baja, cosa que los catálogos del
// formulario de ticket no necesitan y por eso no lo piden.
//
// Reutilizan `pedirCatalogo`, que ya devuelve el envelope y el error resueltos.

const CON_INACTIVOS = { incluir_inactivos: 1 };

export const getConfigCategorias = createAsyncThunk<ResultadoCatalogo<CategoriaTicket>>(
  'helpdeskConfiguracion/getCategorias',
  async () => pedirCatalogo<CategoriaTicket>(`${BASE}/categorias`, CON_INACTIVOS)
);

export const getConfigSubcategorias = createAsyncThunk<ResultadoCatalogo<SubcategoriaTicket>>(
  'helpdeskConfiguracion/getSubcategorias',
  async () => pedirCatalogo<SubcategoriaTicket>(`${BASE}/subcategorias`, CON_INACTIVOS)
);

export const getConfigTitulos = createAsyncThunk<ResultadoCatalogo<TituloTicket>>(
  'helpdeskConfiguracion/getTitulos',
  async () => pedirCatalogo<TituloTicket>(`${BASE}/titulos`, CON_INACTIVOS)
);

export const getConfigPrioridades = createAsyncThunk<ResultadoCatalogo<PrioridadTicket>>(
  'helpdeskConfiguracion/getPrioridades',
  async () => pedirCatalogo<PrioridadTicket>(`${BASE}/prioridades`, CON_INACTIVOS)
);

export const getConfigSlas = createAsyncThunk<ResultadoCatalogo<SLANivel>>(
  'helpdeskConfiguracion/getSlas',
  async () => pedirCatalogo<SLANivel>(`${BASE}/slas`)
);

export const getConfigEtiquetas = createAsyncThunk<ResultadoCatalogo<HelpdeskEtiqueta>>(
  'helpdeskConfiguracion/getEtiquetas',
  async () => pedirCatalogo<HelpdeskEtiqueta>(`${BASE}/etiquetas`)
);

/**
 * El estatus no pide `incluir_inactivos=1` a diferencia de los otros cinco: no
 * tiene columna de vigencia, así que la lista completa ya es la lista vigente.
 */
export const getConfigEstatus = createAsyncThunk<ResultadoCatalogo<EstatusTicket>>(
  'helpdeskConfiguracion/getEstatus',
  async () => pedirCatalogo<EstatusTicket>(`${BASE}/estatus`)
);
// === ESCRITURAS ===
//
// No rechazan: devuelven `{ success, message }` aunque fallen, igual que
// `pedirCatalogo`. Así la pantalla lee el resultado sin `unwrap()` ni `try/catch`
// por cada botón, y el 422 conserva su motivo ("tiene subcategorías
// asociadas") en vez de convertirse en un error genérico.
//
// Todas pasan por `escribir`, que además invalida los catálogos del formulario
// de ticket cuando la escritura se acepta. Ese es el punto único de la
// invalidación: añadir una pantalla de Configuración nueva no puede olvidarse
// de hacerlo, porque no tiene su propio thunk de escritura.

type ConId<C> = { id: number; cuerpo: C };

export const crearCategoria = createAsyncThunk<ResultadoEscritura, CategoriaTicketPayload>(
  'helpdeskConfiguracion/crearCategoria',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/categorias`, dispatch, cuerpo)
);

export const actualizarCategoria = createAsyncThunk<ResultadoEscritura, ConId<CategoriaTicketPayload>>(
  'helpdeskConfiguracion/actualizarCategoria',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/categorias/${id}`, dispatch, cuerpo)
);

export const eliminarCategoria = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarCategoria',
  async (id, { dispatch }) => escribir('delete', `${BASE}/categorias/${id}`, dispatch)
);

export const crearSubcategoria = createAsyncThunk<ResultadoEscritura, SubcategoriaTicketPayload>(
  'helpdeskConfiguracion/crearSubcategoria',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/subcategorias`, dispatch, cuerpo)
);

export const actualizarSubcategoria = createAsyncThunk<ResultadoEscritura, ConId<SubcategoriaTicketPayload>>(
  'helpdeskConfiguracion/actualizarSubcategoria',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/subcategorias/${id}`, dispatch, cuerpo)
);

export const eliminarSubcategoria = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarSubcategoria',
  async (id, { dispatch }) => escribir('delete', `${BASE}/subcategorias/${id}`, dispatch)
);

export const crearTitulo = createAsyncThunk<ResultadoEscritura, TituloTicketPayload>(
  'helpdeskConfiguracion/crearTitulo',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/titulos`, dispatch, cuerpo)
);

export const actualizarTitulo = createAsyncThunk<ResultadoEscritura, ConId<TituloTicketPayload>>(
  'helpdeskConfiguracion/actualizarTitulo',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/titulos/${id}`, dispatch, cuerpo)
);

export const eliminarTitulo = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarTitulo',
  async (id, { dispatch }) => escribir('delete', `${BASE}/titulos/${id}`, dispatch)
);

export const crearPrioridad = createAsyncThunk<ResultadoEscritura, PrioridadTicketPayload>(
  'helpdeskConfiguracion/crearPrioridad',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/prioridades`, dispatch, cuerpo)
);

export const actualizarPrioridad = createAsyncThunk<ResultadoEscritura, ConId<PrioridadTicketPayload>>(
  'helpdeskConfiguracion/actualizarPrioridad',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/prioridades/${id}`, dispatch, cuerpo)
);

export const eliminarPrioridad = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarPrioridad',
  async (id, { dispatch }) => escribir('delete', `${BASE}/prioridades/${id}`, dispatch)
);

export const crearSla = createAsyncThunk<ResultadoEscritura, SLANivelPayload>(
  'helpdeskConfiguracion/crearSla',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/slas`, dispatch, cuerpo)
);

export const actualizarSla = createAsyncThunk<ResultadoEscritura, ConId<SLANivelPayload>>(
  'helpdeskConfiguracion/actualizarSla',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/slas/${id}`, dispatch, cuerpo)
);

export const eliminarSla = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarSla',
  async (id, { dispatch }) => escribir('delete', `${BASE}/slas/${id}`, dispatch)
);

export const crearEtiqueta = createAsyncThunk<ResultadoEscritura, HelpdeskEtiquetaPayload>(
  'helpdeskConfiguracion/crearEtiqueta',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/etiquetas`, dispatch, cuerpo)
);

export const actualizarEtiqueta = createAsyncThunk<ResultadoEscritura, ConId<HelpdeskEtiquetaPayload>>(
  'helpdeskConfiguracion/actualizarEtiqueta',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/etiquetas/${id}`, dispatch, cuerpo)
);

export const eliminarEtiqueta = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarEtiqueta',
  async (id, { dispatch }) => escribir('delete', `${BASE}/etiquetas/${id}`, dispatch)
);

export const crearEstatus = createAsyncThunk<ResultadoEscritura, EstatusTicketPayload>(
  'helpdeskConfiguracion/crearEstatus',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/estatus`, dispatch, cuerpo)
);

export const actualizarEstatus = createAsyncThunk<ResultadoEscritura, ConId<EstatusTicketPayload>>(
  'helpdeskConfiguracion/actualizarEstatus',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/estatus/${id}`, dispatch, cuerpo)
);

export const eliminarEstatus = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarEstatus',
  async (id, { dispatch }) => escribir('delete', `${BASE}/estatus/${id}`, dispatch)
);

// === ERRORES DE PROVEEDOR (CORR-030) ===

export const getConfigProveedoresError = createAsyncThunk<ResultadoCatalogo<HelpdeskProveedorError>>(
  'helpdeskConfiguracion/getProveedoresError',
  async () => pedirCatalogo<HelpdeskProveedorError>(`${BASE}/proveedores-error`, CON_INACTIVOS)
);

export const getConfigSistemasProveedor = createAsyncThunk<ResultadoCatalogo<HelpdeskSistemaProveedor>>(
  'helpdeskConfiguracion/getSistemasProveedor',
  async () => pedirCatalogo<HelpdeskSistemaProveedor>(`${BASE}/sistemas-proveedor`, CON_INACTIVOS)
);

export const getConfigModulosSIHO = createAsyncThunk<ResultadoCatalogo<HelpdeskModuloSIHO>>(
  'helpdeskConfiguracion/getModulosSIHO',
  async () => pedirCatalogo<HelpdeskModuloSIHO>(`${BASE}/modulos-siho`, CON_INACTIVOS)
);

export const crearProveedorError = createAsyncThunk<ResultadoEscritura, ProveedorErrorPayload>(
  'helpdeskConfiguracion/crearProveedorError',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/proveedores-error`, dispatch, cuerpo)
);

export const actualizarProveedorError = createAsyncThunk<ResultadoEscritura, ConId<ProveedorErrorPayload>>(
  'helpdeskConfiguracion/actualizarProveedorError',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/proveedores-error/${id}`, dispatch, cuerpo)
);

export const eliminarProveedorError = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarProveedorError',
  async (id, { dispatch }) => escribir('delete', `${BASE}/proveedores-error/${id}`, dispatch)
);

export const crearSistemaProveedor = createAsyncThunk<ResultadoEscritura, SistemaProveedorPayload>(
  'helpdeskConfiguracion/crearSistemaProveedor',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/sistemas-proveedor`, dispatch, cuerpo)
);

export const actualizarSistemaProveedor = createAsyncThunk<ResultadoEscritura, ConId<SistemaProveedorPayload>>(
  'helpdeskConfiguracion/actualizarSistemaProveedor',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/sistemas-proveedor/${id}`, dispatch, cuerpo)
);

export const eliminarSistemaProveedor = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarSistemaProveedor',
  async (id, { dispatch }) => escribir('delete', `${BASE}/sistemas-proveedor/${id}`, dispatch)
);

export const crearModuloSIHO = createAsyncThunk<ResultadoEscritura, ModuloSIHOPayload>(
  'helpdeskConfiguracion/crearModuloSIHO',
  async (cuerpo, { dispatch }) => escribir('post', `${BASE}/modulos-siho`, dispatch, cuerpo)
);

export const actualizarModuloSIHO = createAsyncThunk<ResultadoEscritura, ConId<ModuloSIHOPayload>>(
  'helpdeskConfiguracion/actualizarModuloSIHO',
  async ({ id, cuerpo }, { dispatch }) => escribir('put', `${BASE}/modulos-siho/${id}`, dispatch, cuerpo)
);

export const eliminarModuloSIHO = createAsyncThunk<ResultadoEscritura, number>(
  'helpdeskConfiguracion/eliminarModuloSIHO',
  async (id, { dispatch }) => escribir('delete', `${BASE}/modulos-siho/${id}`, dispatch)
);