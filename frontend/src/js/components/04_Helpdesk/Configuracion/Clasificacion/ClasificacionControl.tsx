import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { HelpdeskDepartamento } from '@/@types/HelpdeskTypes/ticketTypes';
import type { NivelClasificacion } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch, RootState } from '@/store/store';
import { getDepartamentosActivos } from '@/store/administrador/Departamentos/departamentosActions';
import { getConfigCategorias, getConfigSubcategorias, getConfigTitulos } from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import SearchInput from '@/components/00_Utils/ui/SearchInput';
import AddClasificacion from './AddClasificacion';
import EditClasificacion from './EditClasificacion';
import DeleteClasificacion from './DeleteClasificacion';

// Icons
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/04_Helpdesk/Configuracion/Clasificacion/clasificacionControl.css';

/** Filtro por texto de una columna. No toca el padre: eso se hace aparte. */
function porTexto<T>(lista: T[], texto: string, nombre: (item: T) => string): T[] {
  const busqueda = texto.trim().toLowerCase();

  return busqueda === '' ? lista : lista.filter((item) => nombre(item).toLowerCase().includes(busqueda));
}

/**
 * Cadena de la clasificación: Categoría → Subcategoría → Título.
 *
 * Los tres paneles se leen de una sola llamada cada uno (con
 * `incluir_inactivos=1`) y se filtran en cliente: son catálogos de referencia
 * con pocas filas, así que buscar y seleccionar no dispara peticiones.
 *
 * Cada columna tiene su propio buscador: en una cadena, buscar "sistemas" tiene
 * que poder escribirse en la columna de títulos sin borrar lo que se escribió en
 * la de categorías.
 */
const ClasificacionControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const categorias = useSelector((s: RootState) => s.helpdeskConfiguracion.categorias);
  const subcategorias = useSelector((s: RootState) => s.helpdeskConfiguracion.subcategorias);
  const titulos = useSelector((s: RootState) => s.helpdeskConfiguracion.titulos);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);
  const departamentos = useSelector((s: RootState) => s.departamentos.departamentos) as HelpdeskDepartamento[];

  useCatalogData(categorias, () => dispatch(getConfigCategorias()));
  useCatalogData(subcategorias, () => dispatch(getConfigSubcategorias()));
  useCatalogData(titulos, () => dispatch(getConfigTitulos()));
  useCatalogData(departamentos, () => dispatch(getDepartamentosActivos()));

  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [idSubcategoria, setIdSubcategoria] = useState<number | null>(null);

  // Buscadores independientes: tres cadenas distintas, no un filtro compartido.
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [busquedaSubcategoria, setBusquedaSubcategoria] = useState('');
  const [busquedaTitulo, setBusquedaTitulo] = useState('');

  const [agregando, setAgregando] = useState<NivelClasificacion | null>(null);
  const [editando, setEditando] = useState<{ nivel: NivelClasificacion; entidad: Record<string, unknown> } | null>(null);
  const [eliminando, setEliminando] = useState<{ nivel: NivelClasificacion; entidad: Record<string, unknown> } | null>(null);

  const categoriasVisibles = useMemo(
    () => porTexto(categorias, busquedaCategoria, (c) => c.nombre_categoria),
    [categorias, busquedaCategoria]
  );

  // Sin padre elegido no hay hijos que mostrar: la cadena arranca en categorías.
  const subcategoriasVisibles = useMemo(
    () => (idCategoria === null
      ? []
      : porTexto(subcategorias.filter((s) => s.id_categoria_ticket === idCategoria), busquedaSubcategoria, (s) => s.nombre_subcategoria)),
    [subcategorias, idCategoria, busquedaSubcategoria]
  );

  const titulosVisibles = useMemo(
    () => (idSubcategoria === null
      ? []
      : porTexto(titulos.filter((t) => t.id_subcategoria_ticket === idSubcategoria), busquedaTitulo, (t) => t.nombre_titulo_ticket)),
    [titulos, idSubcategoria, busquedaTitulo]
  );

  /**
 * Padre al que pertenece lo nuevo. La categoría es la raíz de la cadena y no
 * tiene, así que devuelve `undefined` en vez de `null`: la diferencia importa,
 * porque el modal de alta solo se bloquea cuando el padre está pendiente, no
 * cuando el nivel no lo tiene. Con `null` para los tres, el botón "Nueva" de
 * categorías no abría nada.
 */
  const idPadreDe = (nivel: NivelClasificacion): number | undefined => {
    if (nivel === 'subcategoria') return idCategoria ?? undefined;
    if (nivel === 'titulo') return idSubcategoria ?? undefined;

    return undefined;
  };

  // Si el padre desaparece (se borró o se desactivó y se recargó), la selección
  // del hijo apuntaría a un id que ya no está en la lista.
  useEffect(() => {
    if (idCategoria !== null && !categorias.some((c) => c.id_categoria_ticket === idCategoria)) {
      setIdCategoria(null);
      setIdSubcategoria(null);
    }
  }, [categorias, idCategoria]);

  useEffect(() => {
    if (idSubcategoria !== null && !subcategorias.some((s) => s.id_subcategoria_ticket === idSubcategoria)) {
      setIdSubcategoria(null);
    }
  }, [subcategorias, idSubcategoria]);

  /** Tras escribir, se recarga solo el nivel tocado. */
  const trasEscribir = (nivel: NivelClasificacion) => {
    // Se despacha por ramas y no con un ternario: la unión de los tres thunks no
    // es asignable a `UnknownAction`.
    if (nivel === 'categoria') {
      dispatch(getConfigCategorias());
    } else if (nivel === 'subcategoria') {
      dispatch(getConfigSubcategorias());
    } else {
      dispatch(getConfigTitulos());
    }
  };

  const trasEliminar = (nivel: NivelClasificacion) => {
    if (nivel === 'categoria') {
      setIdCategoria(null);
      setIdSubcategoria(null);
    } else if (nivel === 'subcategoria') {
      setIdSubcategoria(null);
    }
    // La fila borrada seguiría en el store hasta recargar la página.
    trasEscribir(nivel);
  };

  const mensaje = (texto: string) => (
    <div className='noEntities'>
      <FiAlertTriangle /> <p>{texto}</p> <FiAlertTriangle />
    </div>
  );

  const acciones = (nivel: NivelClasificacion, fila: Record<string, unknown>) => (
    <div className='divActions'>
      <button type='button' className='button_editEntity' title='Editar' onClick={() => setEditando({ nivel, entidad: fila })}>
        <MdEdit />
      </button>
      <button type='button' className='button_deleteEntity' title='Eliminar' onClick={() => setEliminando({ nivel, entidad: fila })}>
        <MdDeleteForever />
      </button>
    </div>
  );

  return (
    <div className='mainDiv_ClasificacionControl'>

      {error && (
        <p className='configError'>
          <FiAlertTriangle /> {error}
        </p>
      )}

      <div className='clasificacionCadena'>
        {/* --- CATEGORÍAS --- */}
        <div className='clasificacionPanel'>
          <div className='clasificacionPanelHeader'>
            <h2>
              Categorías <span className='clasificacionConteo'>{categoriasVisibles.length}</span>
            </h2>
            <button type='button' className='buttonAdd' onClick={() => setAgregando('categoria')}>Nueva</button>
          </div>

          <SearchInput
            className='clasificacionBuscador'
            placeholder='Buscar categoría…'
            value={busquedaCategoria}
            onChange={(e) => setBusquedaCategoria(e.target.value)}
          />

          <div className='clasificacionLista'>
            {categoriasVisibles.length === 0
              ? mensaje(busquedaCategoria ? 'Ninguna categoría coincide.' : 'No hay categorías registradas.')
              : categoriasVisibles.map((c) => (
                <div key={c.id_categoria_ticket} className={`clasificacionFila ${c.id_categoria_ticket === idCategoria ? 'filaSeleccionada' : ''}`}>
                  <button
                    type='button'
                    className='clasificacionEnlace'
                    title={c.nombre_categoria}
                    onClick={() => {
                      setIdCategoria(c.id_categoria_ticket ?? null);
                      // La subcategoría y los títulos cuelgan de la categoría: al cambiar
                      // de categoría hay que soltar la subcategoría o el título queda
                      // huérfano de la lista visible.
                      setIdSubcategoria(null);
                    }}
                  >
                    <span className={c.estatus_activo ? '' : 'clasificacionInactivo'}>{c.nombre_categoria}</span>
                    {c.departamento_default && <small>{c.departamento_default.nombre_departamento}</small>}
                  </button>
                  {acciones('categoria', c as unknown as Record<string, unknown>)}
                </div>
              ))}
          </div>
        </div>

        {/* --- SUBCATEGORÍAS --- */}
        <div className='clasificacionPanel'>
          <div className='clasificacionPanelHeader'>
            <h2>
              Subcategorías <span className='clasificacionConteo'>{subcategoriasVisibles.length}</span>
            </h2>
            <button type='button' className='buttonAdd' disabled={idCategoria === null} onClick={() => setAgregando('subcategoria')}>Nueva</button>
          </div>

          <SearchInput
            className='clasificacionBuscador'
            placeholder='Buscar subcategoría…'
            value={busquedaSubcategoria}
            onChange={(e) => setBusquedaSubcategoria(e.target.value)}
            disabled={idCategoria === null}
          />

          <div className='clasificacionLista'>
            {idCategoria === null
              ? mensaje('Seleccione una categoría.')
              : subcategoriasVisibles.length === 0
                ? mensaje(busquedaSubcategoria ? 'Ninguna subcategoría coincide.' : 'Esta categoría no tiene subcategorías.')
                : subcategoriasVisibles.map((s) => (
                  <div key={s.id_subcategoria_ticket} className={`clasificacionFila ${s.id_subcategoria_ticket === idSubcategoria ? 'filaSeleccionada' : ''}`}>
                    <button
                      type='button'
                      className='clasificacionEnlace'
                      title={s.nombre_subcategoria}
                      onClick={() => setIdSubcategoria(s.id_subcategoria_ticket ?? null)}
                    >
                      <span className={s.estatus_activo ? '' : 'clasificacionInactivo'}>{s.nombre_subcategoria}</span>
                      {s.es_publico === false && <small className='clasificacionInterna'>Interna</small>}
                    </button>
                    {acciones('subcategoria', s as unknown as Record<string, unknown>)}
                  </div>
                ))}
          </div>
        </div>

        {/* --- TÍTULOS --- */}
        <div className='clasificacionPanel'>
          <div className='clasificacionPanelHeader'>
            <h2>
              Títulos <span className='clasificacionConteo'>{titulosVisibles.length}</span>
            </h2>
            <button type='button' className='buttonAdd' disabled={idSubcategoria === null} onClick={() => setAgregando('titulo')}>Nuevo</button>
          </div>

          <SearchInput
            className='clasificacionBuscador'
            placeholder='Buscar título…'
            value={busquedaTitulo}
            onChange={(e) => setBusquedaTitulo(e.target.value)}
            disabled={idSubcategoria === null}
          />

          <div className='clasificacionLista'>
            {idSubcategoria === null
              ? mensaje('Seleccione una subcategoría.')
              : titulosVisibles.length === 0
                ? mensaje(busquedaTitulo ? 'Ningún título coincide.' : 'Esta subcategoría no tiene títulos.')
                : titulosVisibles.map((t) => (
                  <div key={t.id_titulo_ticket} className='clasificacionFila'>
                    {/* El título es el nodo final de la cadena: no abre nada. Antes
                      este botón llamaba a `setEditando`, o sea que pulsar el
                      nombre abría el formulario mientras en las otras dos columnas
                      el nombre solo selecciona. Editar va por el lápiz. */}
                    <span className='clasificacionEnlaceTitulo' title={t.nombre_titulo_ticket}>
                      <span className={t.estatus_activo ? '' : 'clasificacionInactivo'}>{t.nombre_titulo_ticket}</span>
                    </span>
                    {acciones('titulo', t as unknown as Record<string, unknown>)}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {agregando && (agregando === 'categoria' || idPadreDe(agregando) !== undefined) && (
        <AddClasificacion
          isOpen
          onClose={() => setAgregando(null)}
          nivel={agregando}
          idPadre={idPadreDe(agregando)}
          departamentos={departamentos}
          onCreado={() => trasEscribir(agregando)}
        />
      )}

      {editando && (
        <EditClasificacion
          isOpen
          onClose={() => setEditando(null)}
          nivel={editando.nivel}
          entidad={editando.entidad}
          departamentos={departamentos}
          onEditado={() => trasEscribir(editando.nivel)}
        />
      )}

      {eliminando && (
        <DeleteClasificacion
          isOpen
          onClose={() => setEliminando(null)}
          nivel={eliminando.nivel}
          entidad={eliminando.entidad}
          onEliminado={trasEliminar}
        />
      )}
    </div>
  );
};

export default ClasificacionControl;