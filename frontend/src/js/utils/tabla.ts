import type { OrdenTabla } from '@/@types/paginacionTypes';
import type { FiltroColumna, TipoFiltro, ValorOrdenable } from '@/@types/tablaTypes';

/** Columna mínima que necesitan el filtro y el orden en modo cliente. */
export interface ColumnaFiltrable<T> {
  clave: string;
  valor?: (fila: T) => ValorOrdenable;
  filtro?: FiltroColumna;
}

/** Texto comparable: minúsculas y locale español. */
export function normalizarTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  return String(valor).toLocaleLowerCase('es');
}

function fechaISO(valor: ValorOrdenable): string | null {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return null;
    const anio = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  if (typeof valor === 'string') {
    const coincidencia = valor.match(/^(\d{4}-\d{2}-\d{2})/);
    return coincidencia ? coincidencia[1] : null;
  }

  return null;
}

function parseBooleano(valor: string): boolean | null {
  const normalizado = valor.trim().toLocaleLowerCase('es');

  if (['1', 'true', 'si', 'sí'].includes(normalizado)) return true;
  if (['0', 'false', 'no'].includes(normalizado)) return false;

  return null;
}

/**
 * Compara dos valores para ordenar. Los nulos se manejan aparte en
 * `ordenarFilas` para que siempre queden al final, sin importar la dirección.
 */
export function compararValores(a: ValorOrdenable, b: ValorOrdenable): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;

  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);

  return String(a).localeCompare(String(b), 'es', {
    numeric: true,
    sensitivity: 'base',
  });
}

/** Indica si un valor pasa el filtro de una columna. */
export function coincideFiltro(
  valor: ValorOrdenable,
  filtro: string,
  tipo: TipoFiltro,
): boolean {
  const texto = filtro.trim();

  if (texto === '') return true;

  switch (tipo) {
  case 'booleano': {
    const esperado = parseBooleano(texto);
    if (esperado === null) return true;
    return Boolean(valor) === esperado;
  }

  case 'fecha':
    return fechaISO(valor) === texto;

  case 'seleccion':
    return String(valor ?? '') === texto;

  case 'texto':
  default:
    return normalizarTexto(valor).includes(normalizarTexto(texto));
  }
}

/** Filtra las filas por las columnas que tengan filtro y valor capturado. */
export function filtrarPorColumnas<T>(
  filas: T[],
  filtros: Record<string, string>,
  columnas: ColumnaFiltrable<T>[],
): T[] {
  const activas = columnas.filter(
    (columna) => columna.filtro !== undefined && columna.valor !== undefined,
  );

  if (activas.length === 0) return filas;

  return filas.filter((fila) =>
    activas.every((columna) => {
      const filtro = filtros[columna.clave];
      if (filtro === undefined) return true;
      return coincideFiltro(columna.valor!(fila), filtro, columna.filtro!.tipo);
    }),
  );
}

/**
 * Ordena una copia de las filas. Los nulos quedan al final en ambas
 * direcciones. El orden es estable.
 */
export function ordenarFilas<T>(
  filas: T[],
  orden: OrdenTabla | null,
  columnas: ColumnaFiltrable<T>[],
): T[] {
  if (orden === null) return filas;

  const columna = columnas.find((item) => item.clave === orden.columna);

  if (!columna?.valor) return filas;

  const factor = orden.direccion === 'asc' ? 1 : -1;

  return [...filas].sort((a, b) => {
    const valorA = columna.valor!(a);
    const valorB = columna.valor!(b);

    if (valorA === null || valorA === undefined) {
      return valorB === null || valorB === undefined ? 0 : 1;
    }

    if (valorB === null || valorB === undefined) return -1;

    return compararValores(valorA, valorB) * factor;
  });
}
