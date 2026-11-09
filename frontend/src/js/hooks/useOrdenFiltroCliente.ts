import { useCallback, useState } from 'react';
import type { OrdenTabla } from '@/@types/paginacionTypes';
import {
  filtrarPorColumnas,
  ordenarFilas,
  type ColumnaFiltrable,
} from '@/utils/tabla';

export interface UseOrdenFiltroClienteResult<T> {
  orden: OrdenTabla | null;
  alternarOrden: (columna: string) => void;
  filtros: Record<string, string>;
  cambiarFiltro: (columna: string, valor: string) => void;
  limpiarFiltros: () => void;
  aplicar: (filas: T[]) => T[];
}

/**
 * Orden y filtros locales para listas que ya están completas en el cliente.
 * No pagina: el control conserva su paginación actual.
 */
export function useOrdenFiltroCliente<T>(
  columnas: ColumnaFiltrable<T>[],
): UseOrdenFiltroClienteResult<T> {
  const [orden, setOrden] = useState<OrdenTabla | null>(null);
  const [filtros, setFiltros] = useState<Record<string, string>>({});

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

  const aplicar = useCallback(
    (filas: T[]) =>
      ordenarFilas(
        filtrarPorColumnas(filas, filtros, columnas),
        orden,
        columnas,
      ),
    [columnas, filtros, orden],
  );

  return {
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
    limpiarFiltros,
    aplicar,
  };
}
