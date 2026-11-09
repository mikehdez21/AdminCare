import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type {
  DireccionOrden,
  OrdenTabla,
  PaginacionMeta,
  PaginacionResponse,
} from '@/@types/paginacionTypes';

// ---------------------------------------------------------------------------
// Hook genérico de paginación servida (Fases 3-5 de paginacion-servidor).
//
// Encapsula la lógica de búsqueda + filtros por columna + orden + paginación
// contra el servidor:
// - Debounce de búsqueda y filtros (400ms por defecto) antes de consultar.
// - Reseteo a página 1 al cambiar búsqueda, filtros, orden o cantidad por página.
// - Manejo de carreras: las respuestas antiguas no sobreescriben el estado.
// - `refetch` para recargar la página actual (p.ej. tras crear/editar).
// - Si la búsqueda/filtro reduce el total y la página queda fuera de rango,
//   vuelve automáticamente a la última página disponible.
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
  sort?: string;
  direction?: DireccionOrden;
  filtros?: Record<string, string>;
}

export interface UsePaginacionServidorParams<T> {
  fetcher: (
    params: FetcherPaginacionParams,
  ) => Promise<PaginacionResponse<T> | T[] | { data: T[]; meta?: PaginacionMeta | null }>;
  /** Cantidad de registros por página por defecto (default: 5). */
  perPageDefault?: number;
  /** Retraso del debounce de búsqueda/filtros en milisegundos (default: 400). */
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
  /** Orden activo; null = orden default del endpoint. */
  orden: OrdenTabla | null;
  alternarOrden: (columna: string) => void;
  /** Filtros por columna activos (valor del input/select). */
  filtros: Record<string, string>;
  cambiarFiltro: (columna: string, valor: string) => void;
  limpiarFiltros: () => void;
}

function normalizarRespuesta<T>(
  respuesta: PaginacionResponse<T> | T[] | { data: T[]; meta?: PaginacionMeta | null },
): { data: T[]; meta: PaginacionMeta | null } {
  if (Array.isArray(respuesta)) {
    return { data: respuesta, meta: null };
  }
  return { data: respuesta?.data ?? [], meta: respuesta?.meta ?? null };
}

function mismosFiltros(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const clavesA = Object.keys(a);
  const clavesB = Object.keys(b);

  if (clavesA.length !== clavesB.length) return false;

  return clavesA.every((clave) => a[clave] === b[clave]);
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

  const [orden, setOrden] = useState<OrdenTabla | null>(null);
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<Record<string, string>>({});

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // El fetcher puede cambiar en cada render (p.ej. cambia la variante activa).
  // Se conserva en un ref para mantener estable el efecto de carga.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [refetchToken, setRefetchToken] = useState<number>(0);

  // Debounce de búsqueda y filtros: se aplican tras `searchDelayMs` sin editar.
  // Si los filtros no cambiaron, se conserva el mismo objeto para no repetir
  // la carga inicial.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setFiltrosAplicados((anteriores) =>
        mismosFiltros(anteriores, filtros) ? anteriores : filtros,
      );
      setPaginaActual(1);
    }, searchDelayMs);

    return () => window.clearTimeout(timer);
  }, [busqueda, filtros, searchDelayMs]);

  // Carga paginada. `cancelado` evita sobreescribir el estado con respuestas
  // de peticiones antiguas cuando cambian los parámetros o se dispara `refetch`.
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    const parametros: FetcherPaginacionParams = {
      page: paginaActual,
      per_page: perPage,
      search: busquedaAplicada,
    };

    if (orden !== null) {
      parametros.sort = orden.columna;
      parametros.direction = orden.direccion;
    }

    if (Object.keys(filtrosAplicados).length > 0) {
      parametros.filtros = filtrosAplicados;
    }

    fetcherRef
      .current(parametros)
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
  }, [paginaActual, perPage, busquedaAplicada, filtrosAplicados, orden, refetchToken]);

  // Si la búsqueda o los filtros reducen el total y la página actual queda
  // fuera de rango, regresar a la última página disponible.
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

  const alternarOrden = useCallback((columna: string) => {
    setOrden((anterior) => {
      if (anterior === null || anterior.columna !== columna) {
        return { columna, direccion: 'asc' };
      }

      if (anterior.direccion === 'asc') {
        return { columna, direccion: 'desc' };
      }

      return null;
    });
    setPaginaActual(1);
  }, []);

  const cambiarFiltro = useCallback((columna: string, valor: string) => {
    setFiltros((anteriores) => {
      const siguientes = { ...anteriores };

      if (valor.trim() === '') {
        delete siguientes[columna];
      } else {
        siguientes[columna] = valor;
      }

      return siguientes;
    });
  }, []);

  const limpiarFiltros = useCallback(() => setFiltros({}), []);

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
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
    limpiarFiltros,
  };
}
