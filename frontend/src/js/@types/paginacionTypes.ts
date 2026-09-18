// ---------------------------------------------------------------------------
// Tipos compartidos para la paginación servidor (Fases 3-5 de paginacion-servidor).
//
// Contrato con el backend:
// - Cuando el frontend envía `page` y `per_page`, el backend responde
//   `{ success, message, ...data, meta }` donde `meta` describe la página.
// - Sin `page`/`per_page`, el backend responde la lista completa
//   `{ success, message, ...data }` (sin `meta`).
// ---------------------------------------------------------------------------

export interface PaginacionMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  search: string | null;
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
}

/** Parámetros paginados para recursos que dependen de una entidad (id). */
export interface PaginacionConEntidadParams extends PaginacionParams {
  id: number;
}