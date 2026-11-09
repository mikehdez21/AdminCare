import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type {
  OrdenTabla,
  PaginacionMeta,
  PaginacionParams,
} from '@/@types/paginacionTypes';

interface RtkQueryResult<T> {
  data?: { items: T[]; meta?: PaginacionMeta | null } | T[];
  isLoading: boolean;
  error?: unknown;
  refetch: () => void;
}

interface UsePaginacionRtkOptions<T> {
  useQuery: (args: PaginacionParams | void) => RtkQueryResult<T>;
  perPageDefault?: number;
  searchDelayMs?: number;
}

function normalizarRespuesta<T>(
  respuesta: { items: T[]; meta?: PaginacionMeta | null } | T[] | undefined,
): { items: T[]; meta: PaginacionMeta | null } {
  if (Array.isArray(respuesta)) {
    return { items: respuesta, meta: null };
  }
  return { items: respuesta?.items ?? [], meta: respuesta?.meta ?? null };
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

export interface UsePaginacionRtkResult<T> {
  items: T[];
  meta: PaginacionMeta | null;
  busqueda: string;
  setBusqueda: (valor: string) => void;
  paginaActual: number;
  setPaginaActual: (pagina: number) => void;
  perPage: number;
  setPerPage: (cantidad: number) => void;
  totalItems: number;
  numeroTotalPaginas: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangePerPage: (e: ChangeEvent<HTMLSelectElement>) => void;
  orden: OrdenTabla | null;
  alternarOrden: (columna: string) => void;
  filtros: Record<string, string>;
  cambiarFiltro: (columna: string, valor: string) => void;
  limpiarFiltros: () => void;
}

export function usePaginacionRtk<T>({
  useQuery,
  perPageDefault = 5,
  searchDelayMs = 400,
}: UsePaginacionRtkOptions<T>): UsePaginacionRtkResult<T> {
  const [busqueda, setBusqueda] = useState<string>('');
  const [busquedaAplicada, setBusquedaAplicada] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(perPageDefault);

  const [orden, setOrden] = useState<OrdenTabla | null>(null);
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<Record<string, string>>({});

  const args: PaginacionParams = {
    page: paginaActual,
    per_page: perPage,
    search: busquedaAplicada,
  };

  if (orden !== null) {
    args.sort = orden.columna;
    args.direction = orden.direccion;
  }

  if (Object.keys(filtrosAplicados).length > 0) {
    args.filtros = filtrosAplicados;
  }

  const { data, isLoading, error, refetch } = useQuery(args);

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

  const { items, meta } = useMemo(() => normalizarRespuesta(data), [data]);

  useEffect(() => {
    if (meta && meta.last_page >= 1 && paginaActual > meta.last_page) {
      setPaginaActual(meta.last_page);
    }
  }, [meta, paginaActual]);

  const errorMessage = useMemo<string | null>(() => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    const e = error as {
      data?: { message?: string };
      message?: string;
      status?: number | string;
    };
    return e.data?.message ?? e.message ?? 'Error al cargar los datos';
  }, [error]);

  const totalItems = meta?.total ?? items.length;

  const numeroTotalPaginas = useMemo(() => {
    if (meta && meta.last_page >= 1) {
      return meta.last_page;
    }
    return Math.max(1, Math.ceil(items.length / perPage));
  }, [meta, items.length, perPage]);

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
    loading: isLoading,
    error: errorMessage,
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
