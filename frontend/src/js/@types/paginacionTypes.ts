// ---------------------------------------------------------------------------
// Tipos compartidos para la paginación servidor (Fases 3-5 de paginacion-servidor).
//
// Contrato con el backend:
// - Cuando el frontend envía `page` y `per_page`, el backend responde
//   `{ success, message, ...data, meta }` donde `meta` describe la página.
// - Sin `page`/`per_page`, el backend responde la lista completa
//   `{ success, message, ...data }` (sin `meta`).
// ---------------------------------------------------------------------------

export type DireccionOrden = 'asc' | 'desc';

/** Orden activo de una tabla. `null` significa el orden default del endpoint. */
export interface OrdenTabla {
  columna: string;
  direccion: DireccionOrden;
}

export interface PaginacionMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  search: string | null;
  sort?: string | null;
  direction?: DireccionOrden | null;
}

export interface PaginacionResponse<T> {
  data: T[];
  meta?: PaginacionMeta | null;
}

/** Parámetros de consulta paginada enviados por el frontend. */
export interface PaginacionParams {
  page: number;
  per_page: number;
  search: string;
  /** Clave de la whitelist de orden del endpoint. */
  sort?: string;
  direction?: DireccionOrden;
  /** Filtros por columna: clave pública => valor. */
  filtros?: Record<string, string>;
}

/** Parámetros paginados para recursos que dependen de una entidad (id). */
export interface PaginacionConEntidadParams extends PaginacionParams {
  id: number;
}