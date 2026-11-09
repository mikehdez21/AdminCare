import React from 'react';
import { FiChevronDown, FiChevronUp, FiChevronsUp } from 'react-icons/fi';

import type { OrdenTabla } from '@/@types/paginacionTypes';
import type { FiltroColumna, ValorOrdenable } from '@/@types/tablaTypes';

import '@styles/00_Utils/TablaEntidades.css';

/** Una columna de la tabla. `valor` solo es necesario en modo cliente. */
export interface ColumnaTabla<T> {
  clave: string;
  encabezado: React.ReactNode;
  ancho?: string;
  thId?: string;
  tdId?: string;
  render: (fila: T) => React.ReactNode;
  /** false en acciones o columnas calculadas. Default: true. */
  ordenable?: boolean;
  /** undefined = sin filtro. */
  filtro?: FiltroColumna;
  /** Accessor para orden/filtro local. */
  valor?: (fila: T) => ValorOrdenable;
  /**
   * Fija la columna horizontalmente en encabezado, fila de filtros y celdas.
   * Debe coincidir con el `left`/`right` que ya usa el CSS del módulo.
   */
  fija?: 'izquierda' | 'derecha';
  /** Desplazamiento de la columna fija; default `0`. */
  desplazamientoFijo?: string;
}

interface TablaEntidadesProps<T> {
  /** Contenedor existente de cada control (ancho, scroll, etc.). */
  className: string;
  tableClassName?: string;
  filas: T[];
  columnas: ColumnaTabla<T>[];
  clave: (fila: T) => React.Key;
  orden: OrdenTabla | null;
  onOrden: (clave: string) => void;
  filtros: Record<string, string>;
  onFiltro: (clave: string, valor: string) => void;
  mensajeVacio?: React.ReactNode;
  filaClassName?: (fila: T) => string | undefined;
}

function etiquetaColumna<T>(columna: ColumnaTabla<T>): string {
  return typeof columna.encabezado === 'string' ? columna.encabezado : columna.clave;
}

function estiloColumna<T>(
  columna: ColumnaTabla<T>,
  fondo: string,
  zIndex: number,
): React.CSSProperties {
  const estilo: React.CSSProperties = {};

  if (columna.ancho) {
    estilo.width = columna.ancho;
  }

  if (columna.fija) {
    estilo.position = 'sticky';
    estilo.zIndex = zIndex;
    estilo.background = fondo;

    if (columna.fija === 'izquierda') {
      estilo.left = columna.desplazamientoFijo ?? '0';
    } else {
      estilo.right = columna.desplazamientoFijo ?? '0';
    }
  }

  return estilo;
}

function claseColumnaFija<T>(columna: ColumnaTabla<T>): string | undefined {
  return columna.fija
    ? `tablaEntidades__celdaFija tablaEntidades__celdaFija--${columna.fija}`
    : undefined;
}

function renderFiltro<T>(
  columna: ColumnaTabla<T>,
  filtros: Record<string, string>,
  onFiltro: (clave: string, valor: string) => void,
): React.ReactNode {
  const filtro = columna.filtro;

  if (!filtro) return null;

  const valor = filtros[columna.clave] ?? '';
  const etiqueta = etiquetaColumna(columna);

  const cambiar = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => onFiltro(columna.clave, evento.target.value);

  if (filtro.tipo === 'seleccion') {
    return (
      <select
        className='tablaEntidades__filtro'
        value={valor}
        onChange={cambiar}
        aria-label={`Filtrar ${etiqueta}`}
      >
        <option value=''>Todos</option>
        {(filtro.opciones ?? []).map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    );
  }

  if (filtro.tipo === 'booleano') {
    const opciones = filtro.opciones ?? [
      { valor: '1', etiqueta: 'Sí' },
      { valor: '0', etiqueta: 'No' },
    ];

    return (
      <select
        className='tablaEntidades__filtro'
        value={valor}
        onChange={cambiar}
        aria-label={`Filtrar ${etiqueta}`}
      >
        <option value=''>Todos</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className='tablaEntidades__filtro'
      type={filtro.tipo === 'fecha' ? 'date' : 'search'}
      value={valor}
      onChange={cambiar}
      placeholder={filtro.placeholder ?? 'Filtrar'}
      aria-label={`Filtrar ${etiqueta}`}
    />
  );
}

/**
 * Tabla compartida de entidades.
 *
 * No guarda estado: el padre decide si el orden/filtro viene del servidor
 * (`usePaginacionServidor`/`usePaginacionRtk`) o del cliente
 * (`useOrdenFiltroCliente`). Conserva los ids/clases que usa el CSS de cada
 * módulo y solo agrega la fila de filtros cuando alguna columna la declara.
 */
const TablaEntidades = <T,>({
  className,
  tableClassName,
  filas,
  columnas,
  clave,
  orden,
  onOrden,
  filtros,
  onFiltro,
  mensajeVacio,
  filaClassName,
}: TablaEntidadesProps<T>) => {
  const hayFiltros = columnas.some((columna) => columna.filtro !== undefined);

  return (
    <div className={className}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {columnas.map((columna) => {
              const ordenable = columna.ordenable !== false;
              const activa = orden?.columna === columna.clave;
              const ariaSort = !ordenable
                ? undefined
                : activa
                  ? orden?.direccion === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none';

              return (
                <th
                  key={columna.clave}
                  id={columna.thId}
                  className={claseColumnaFija(columna)}
                  style={estiloColumna(columna, '#fff', 3)}
                  aria-sort={ariaSort}
                >
                  {ordenable ? (
                    <button
                      type='button'
                      className='tablaEntidades__thBoton'
                      onClick={() => onOrden(columna.clave)}
                      title={`Ordenar por ${etiquetaColumna(columna)}`}
                    >
                      <span>{columna.encabezado}</span>
                      <span
                        className={`tablaEntidades__indicador${activa ? ' tablaEntidades__indicador--activo' : ''}`}
                        aria-hidden='true'
                      >
                        {!activa ? (
                          <FiChevronsUp />
                        ) : orden?.direccion === 'asc' ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </span>
                    </button>
                  ) : (
                    columna.encabezado
                  )}
                </th>
              );
            })}
          </tr>

          {hayFiltros && (
            <tr className='tablaEntidades__filaFiltros'>
              {columnas.map((columna) => (
                <th
                  key={`filtro-${columna.clave}`}
                  className={claseColumnaFija(columna)}
                  style={estiloColumna(columna, '#f6f6f6', 3)}
                >
                  {renderFiltro(columna, filtros, onFiltro)}
                </th>
              ))}
            </tr>
          )}
        </thead>

        <tbody>
          {filas.length === 0 && mensajeVacio !== undefined ? (
            <tr>
              <td className='tablaEntidades__vacio' colSpan={columnas.length}>
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            filas.map((fila) => (
              <tr key={clave(fila)} className={filaClassName?.(fila)}>
                {columnas.map((columna) => (
                  <td
                    key={columna.clave}
                    id={columna.tdId}
                    className={claseColumnaFija(columna)}
                    style={estiloColumna(columna, '#fff', 1)}
                  >
                    {columna.render(fila)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaEntidades;
