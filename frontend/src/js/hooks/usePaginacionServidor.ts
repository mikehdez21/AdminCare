import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { PaginacionMeta, PaginacionResponse } from '@/@types/paginacionTypes';

// ---------------------------------------------------------------------------
// Hook genérico de paginación serivida (Fases 3-5 de paginacion-servidor).
//
// Encapsula la lógica de búsqueda + paginación contra el servidor:
// - Debounce de la búsqueda (400ms por defecto) antes de consultar.
// - Reseteo a página 1 al cambiar búsqueda o cantidad por página.
// - Manejo de carreras: las respuestas antiguas no sobreescriben el estado.
// - `refetch` para recargar la página actual (p.ej. tras crear/editar).
// - Si la búsqueda reduce el total y la página queda fuera de rango, vuelve
//   automáticamente a la última página disponible.
//
// El componente provee un `fetcher` que llama a su thunk paginado y devuelve
// `{ data, meta }` (una lista plana también está soportada). El hook NO lee
// el estado de Redux: trabaja con su propio estado local.
// ---------------------------------------------------------------------------

/** Parámetros de consulta que recibe el fetcher del componente. */
export interface FetcherPaginacionParams {
  page: number;
  per_page: number;
  search: string;
}

export interface UsePaginacionServidorParams<T> {
  fetcher: (
    params: FetcherPaginacionParams,
  ) => Promise<PaginacionResponse<T> | T[] | { data: T[]; meta?: PaginacionMeta | null }>;
  /** Cantidad de registros por página por defecto (default: 5). */
  perPageDefault?: number;
  /** Retraso del debounce de búsqueda en milisegundos (default: 400). */
  searchDelayMs?: number;
}

export interface UsePaginacionServidorResult<T> {
  /** Registros de la página actual. */
  items: T[];
  /** Metadatos de la última respuesta (null si el backend no devolvió meta). */
  meta: PaginacionMeta | null;
  /** Texto de búsqueda actual (valor del input). */
  busqueda: string;
  setBusqueda: (valor: string) => void;
  /** Página actual (1-indexed). */
  paginaActual: number;
  setPaginaActual: (pagina: number) => void;
  /** Cantidad de registros por página. */
  perPage: number;
  setPerPage: (cantidad: number) => void;
  /** Total de registros (meta.total o longitud de la página). */
  totalItems: number;
  /** Número total de páginas. */
  numeroTotalPaginas: number;
  loading: boolean;
  error: string | null;
  /** Recarga la página actual con los mismos parámetros. */
  refetch: () => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangePerPage: (e: ChangeEvent<HTMLSelectElement>) => void;
}

function normalizarRespuesta<T>(
  respuesta: PaginacionResponse<T> | T[] | { data: T[]; meta?: PaginacionMeta | null },
): { data: T[]; meta: PaginacionMeta | null } {
  if (Array.isArray(respuesta)) {
    return { data: respuesta, meta: null };
  }
  return { data: respuesta?.data ?? [], meta: respuesta?.meta ?? null };
}

export function usePaginacionServidor<T>({
  fetcher,
  perPageDefault = 5,
  searchDelayMs = 400,
}: UsePaginacionServidorParams<T>): UsePaginacionServidorResult<T> {
  const [busqueda, setBusqueda] = useState<string>('');
  const [busquedaAplicada, setBusquedaAplicada] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(perPageDefault);

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // El fetcher puede cambiar en cada render (p.ej. cambia la variante activa).
  // Se conserva en un ref para mantener estable el efecto de carga.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [refetchToken, setRefetchToken] = useState<number>(0);

  // Debounce de la búsqueda: se aplica tras `searchDelayMs` sin escribir.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setPaginaActual(1);
    }, searchDelayMs);
    return () => window.clearTimeout(timer);
  }, [busqueda, searchDelayMs]);

  // Carga paginada. `cancelado` evita sobreescribir el estado con respuestas
  // de peticiones antiguas cuando cambian los parámetros o se dispara `refetch`.
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    fetcherRef
      .current({ page: paginaActual, per_page: perPage, search: busquedaAplicada })
      .then((respuesta) => {
        if (cancelado) return;
        const { data, meta: nuevaMeta } = normalizarRespuesta<T>(respuesta);
        setItems(data);
        setMeta(nuevaMeta);
      })
      .catch((motivo: unknown) => {
        if (cancelado) return;
        setItems([]);
        setMeta(null);
        setError(
          motivo instanceof Error ? motivo.message : 'Error al cargar los datos',
        );
      })
      .finally(() => {
        if (!cancelado) {
          setLoading(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [paginaActual, perPage, busquedaAplicada, refetchToken]);

  // Si la búsqueda reduce el total y la página actual queda fuera de rango,
  // regresar a la última página disponible.
  useEffect(() => {
    if (meta && meta.last_page >= 1 && paginaActual > meta.last_page) {
      setPaginaActual(meta.last_page);
    }
  }, [meta, paginaActual]);

  const totalItems = meta?.total ?? items.length;

  const numeroTotalPaginas = useMemo(() => {
    if (meta && meta.last_page >= 1) {
      return meta.last_page;
    }
    return Math.max(1, Math.ceil(items.length / perPage));
  }, [meta, items.length, perPage]);

  const refetch = useCallback(() => {
    setRefetchToken((prev) => prev + 1);
  }, []);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  }, []);

  const handleChangePerPage = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setPaginaActual(1);
  }, []);

  return {
    items,
    meta,
    busqueda,
    setBusqueda,
    paginaActual,
    setPaginaActual,
    perPage,
    setPerPage,
    totalItems,
    numeroTotalPaginas,
    loading,
    error,
    refetch,
    handleSearch,
    handleChangePerPage,
  };
}