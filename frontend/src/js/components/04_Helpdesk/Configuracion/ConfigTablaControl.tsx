import React, { useEffect, useState } from 'react';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

/** Una columna de la tabla. `render` devuelve la celda de esa fila. */
export interface Columna<T> {
  encabezado: string;
  /**
   * Ancho de la columna, el mismo criterio que usan las tablas de Almacenes
   * (`.divNombreAF { width: 200px }` y compañía). Es obligatorio a propósito:
   * sin él el ancho lo decide el contenido de cada fila y la tabla cambia de
   * medida según qué haya en los datos.
   */
  ancho: string;
  render: (fila: T) => React.ReactNode;
}

interface Props<T> {
  /** Contenedor: cada control conserva el suyo, que es lo que da ancho y gap. */
  className: string;
  /** Plural para el contador y el mensaje de vacío: "prioridades", "etiquetas". */
  entidad: string;
  /** Singular para las alertas: "prioridad", "etiqueta". */
  singular: string;
  /** Concordancia del mensaje de vacío: los SLA son "registrados", no "registradas". */
  vacias: 'registradas' | 'registrados';
  textoBoton: string;
  placeholder: string;
  /** Aviso de la sección. Se pinta arriba, antes del listado. */
  nota?: string;
  /** Último fallo de lectura del catálogo, si lo hubo. */
  error?: string | null;
  filas: T[];
  /** Clave estable de React para cada fila. */
  clave: (fila: T) => number | string;
  /** Qué filas sobreviven al texto del buscador. */
  coincide: (fila: T, busqueda: string) => boolean;
  columnas: Columna<T>[];
  /** Se llama al pulsar "Nuevo". */
  onNuevo: () => void;
  /** Se llama al pulsar el lápiz de una fila. */
  onEditar: (fila: T) => void;
  /** Se llama al pulsar la papelera de una fila. */
  onEliminar: (fila: T) => void;
}

/**
 * Cromo de los tres catálogos de tabla (Prioridades, SLA y Etiquetas).
 *
 * Antes cada control repetía la barra de búsqueda, los dos `Paginacion`, el
 * `<table>` y el mensaje de vacío: unas noventa líneas idénticas por control, y
 * cualquier arreglo had que repetirse tres veces. Aquí viven una sola.
 *
 * Lo que cambia entre catálogos son las columnas, el filtro y a qué se recarga,
 * y eso lo sigue trayendo cada control en sus props.
 */
const ConfigTablaControl = <T,>({
  className,
  entidad,
  singular,
  vacias,
  textoBoton,
  placeholder,
  nota,
  error,
  filas,
  clave,
  coincide,
  columnas,
  onNuevo,
  onEditar,
  onEliminar,
}: Props<T>) => {
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(5);

  const texto = busqueda.trim().toLowerCase();
  const filtrados = texto === '' ? filas : filas.filter((fila) => coincide(fila, texto));

  const total = filtrados.length;
  const numeroTotalPaginas = Math.max(1, Math.ceil(total / porPagina));

  /**
   * Si el listado se encoge (se borró una fila, o el buscador deja menos
   * resultados) la página actual puede quedar por encima del último folio: el
   * `slice` devolvía entonces cero filas y la tabla salía en blanco, sin mensaje
   * y con el botón de "siguiente" todavía activo. Se corrige la página en vez de
   * silenciar el error.
   */
  useEffect(() => {
    if (paginaActual > numeroTotalPaginas) setPaginaActual(numeroTotalPaginas);
  }, [paginaActual, numeroTotalPaginas]);

  const indiceUlt = paginaActual * porPagina;
  const pageItems = filtrados.slice(indiceUlt - porPagina, indiceUlt);

  const cambiarPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  const cambiarBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const vacio = total === 0;

  return (
    <div className={className}>
      <div className='searchAdd_ButtonDiv'>
        <div className='text_Div'>
          <p>Mostrando {pageItems.length} de {total} {entidad}</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={porPagina} onChange={cambiarPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input type='text' placeholder={placeholder} value={busqueda} onChange={cambiarBusqueda} />

          <button type='button' className='buttonAdd' onClick={onNuevo}>
            <IoAddCircleOutline className='iconAdd' /> {textoBoton}
          </button>
        </div>
      </div>

      {nota && <p className='configNota'>{nota}</p>}

      {error && (
        <p className='configError'>
          <FiAlertTriangle /> {error}
        </p>
      )}

      {vacio ? (
        <div className='noEntities'>
          <FiAlertTriangle />
          <p>
            {texto !== ''
              ? `Ninguna coincidencia para "${busqueda.trim()}"`
              : `No hay ${entidad} ${vacias}`}
          </p>
          <FiAlertTriangle />
        </div>
      ) : (
        <>
          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />

          <div className='list_entitiesDiv_configTabla'>
            <table>
              <thead>
                <tr>
                  {columnas.map((columna) => (
                    <th key={columna.encabezado} style={{ width: columna.ancho }}>{columna.encabezado}</th>
                  ))}
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((fila) => (
                  <tr key={clave(fila)}>
                    {columnas.map((columna) => (
                      <td key={columna.encabezado} style={{ width: columna.ancho }}>{columna.render(fila)}</td>
                    ))}
                    <td>
                      <div className='divActions'>
                        <button className='button_editEntity' title={`Editar ${singular}`} onClick={() => onEditar(fila)}>
                          <MdEdit />
                        </button>
                        <button className='button_deleteEntity' title={`Eliminar ${singular}`} onClick={() => onEliminar(fila)}>
                          <MdDeleteForever />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />
        </>
      )}
    </div>
  );
};

export default ConfigTablaControl;