import React, { useEffect, useMemo } from 'react';

// Types
import type { Empleados } from '@/@types/mainTypes';
import type {
  CategoriaTicket,
  EstatusTicket,
  HelpdeskProveedorError,
  PrioridadTicket,
  SubcategoriaTicket,
  TicketFiltros,
} from '@/@types/HelpdeskTypes/ticketTypes';
import { SIN_ASIGNAR } from '@/@types/HelpdeskTypes/ticketTypes';
import { nombreCompletoEmpleado } from '@/utils/helpdesk';

/**
 * Los filtros del listado de tickets, compartidos por "Mis Tickets" y el panel admin.
 *
 * El select de categoría es opcional (`mostrarCategoria`): en la Mesa de Ayuda la
 * categoría llega fijada por la tarjeta con la que se entró y ofrecerla otra vez
 * dejaba la tentación de cambiar un filtro que el recorrido no acompaña. En "Mis
 * Tickets" sí se muestra, porque ahí no hay recorrido previo y el usuario acota sus
 * propios tickets. El estado de `id_categoria_ticket` existe siempre porque el
 * backend lo acepta.
 *
 * La categoría encadena lo demás: la subcategoría es hija suya, y los técnicos se
 * acotan al departamento que atiende esa categoría. Sin categoría elegida no se
 * acota nada.
 *
 * `empleados` es opcional a propósito: quien no lo pase no tiene selector de técnico.
 */
export type TicketFiltrosValor = Required<Pick<
  TicketFiltros,
  | 'id_estatus_ticket'
  | 'id_prioridad_ticket'
  | 'id_categoria_ticket'
  | 'id_subcategoria_ticket'
  | 'id_responsable'
  | 'error_proveedor'
  | 'id_proveedor_error'
  | 'fecha_desde'
  | 'fecha_hasta'
>>;

interface FiltrosTicketsProps {
  categorias: CategoriaTicket[];
  subcategorias: SubcategoriaTicket[];
  prioridades: PrioridadTicket[];
  estatus: EstatusTicket[];
  valor: TicketFiltrosValor;
  /**
   * Listado para el filtro de técnico, del slice de empleados. Sin él, el filtro
   * no se pinta: quien recibe `undefined` no tiene selector de técnico, y es el
   * caso de "Mis Tickets", que no carga el listado de empleados solo para ocultarlo.
   */
  empleados?: Empleados[];
  /**
   * Muestra el select de categoría. Falso en la Mesa de Ayuda, donde la categoría
   * viene fijada por la tarjeta con la que se entró; verdadero en "Mis Tickets",
   * donde el usuario acota sus propios tickets y necesita elegirla.
   */
  mostrarCategoria?: boolean;
  /**
   * Muestra el filtro de error de proveedor. Va con la misma regla que la sección
   * del detalle: es información de Sistemas, así que solo la ve quien atiende esa
   * área.
   */
  mostrarErrorProveedor?: boolean;
  /**
   * Proveedores para el filtro que cuelga de "Errores de proveedor". Sin la lista
   * ese filtro no se pinta: quien no la pase (Mis Tickets) no necesita el catálogo.
   */
  proveedoresError?: HelpdeskProveedorError[];
  /** Se dispara al soltar el filtro; quien lo usa refresca la tabla. */
  onChange: (valor: TicketFiltrosValor) => void;
  onLimpiar: () => void;
}

const VALOR_VACIO: TicketFiltrosValor = {
  id_estatus_ticket: null,
  id_prioridad_ticket: null,
  id_categoria_ticket: null,
  id_subcategoria_ticket: null,
  id_responsable: null,
  error_proveedor: null,
  id_proveedor_error: null,
  fecha_desde: null,
  fecha_hasta: null,
};

const FiltrosTickets: React.FC<FiltrosTicketsProps> = ({ categorias, subcategorias, prioridades, estatus, valor, empleados, mostrarCategoria = false, mostrarErrorProveedor = false, proveedoresError, onChange, onLimpiar }) => {
  // El alcance no cuenta como filtro para el botón de limpiar: en la Mesa de Ayuda
  // el departamento es con el que se abrió la lista, no algo que el usuario pueda
  // quitar. En "Mis Tickets" la categoría sí es un filtro suyo, así que cuenta.
  const hayFiltros = [
    mostrarCategoria ? valor.id_categoria_ticket : null,
    valor.id_subcategoria_ticket,
    valor.id_prioridad_ticket,
    valor.id_estatus_ticket,
    valor.id_responsable,
    valor.error_proveedor,
    valor.id_proveedor_error,
    valor.fecha_desde,
    valor.fecha_hasta,
  ].some(valor => valor !== null);

  // En "Mis Tickets" la categoría la elige el usuario, y hasta que no la elija no
  // se ofrecen subcategorías. "Todas las categorías" no cuenta: sin acotar serían
  // todas, que se repiten de una categoría a otra y arman una lista larguísima.
  const esperandoCategoria = mostrarCategoria && valor.id_categoria_ticket === null;

  // La subcategoría es hija de una categoría, así que solo se ofrecen las de la
  // categoría elegida. En la Mesa de Ayuda, sin categoría (el admin entrando
  // directo) sí se listan todas, porque ahí no hay un recorrido que la fije.
  //
  // Con categoría elegida pero catálogo sin cargar, no se listan todas como
  // atajo: se espera. Listarlas ahí se leía como "esta categoría tiene todas las
  // subcategorías" cuando en realidad es que aún no se sabe cuáles son.
  const subcategoriasVisibles = useMemo(() => {
    if (esperandoCategoria) {
      return [];
    }

    if (valor.id_categoria_ticket === null) {
      return subcategorias;
    }

    if (categorias.length === 0) {
      return [];
    }

    return subcategorias.filter(s => s.id_categoria_ticket === valor.id_categoria_ticket);
  }, [subcategorias, categorias, valor.id_categoria_ticket, esperandoCategoria]);

  const esperandoCatalogo = valor.id_categoria_ticket !== null && categorias.length === 0;

  // Si el acotado deja fuera la subcategoría que estaba elegida, el filtro se
  // quedaría apuntando a algo que ya no aparece en el desplegable y la consulta
  // saldría vacía sin explicación. Se suelta sola, igual que hace
  // `ClasificacionControl` cuando el padre de la selección desaparece.
  useEffect(() => {
    const elegido = valor.id_subcategoria_ticket;

    if (elegido === null) return;
    if (esperandoCatalogo) return;
    if (subcategoriasVisibles.some(s => s.id_subcategoria_ticket === elegido)) return;

    onChange({ ...valor, id_subcategoria_ticket: null });
  }, [subcategoriasVisibles, esperandoCatalogo, valor, onChange]);

  // Departamento que atiende la categoría en pantalla. El técnico se acota a él:
  // en Helpdesk la categoría y el departamento son la misma cosa, así que ofrecer
  // empleados de otras áreas dejaba filtrar por alguien que no puede atender estos
  // tickets. Sin categoría elegida (el admin viendo todo) no se acota: se listan
  // todos los activos.
  const departamentoDeLaCategoria = useMemo(
    () => categorias.find(c => c.id_categoria_ticket === valor.id_categoria_ticket)?.id_departamento_default ?? null,
    [categorias, valor.id_categoria_ticket],
  );

  // Solo los activos, igual que los desplegables de asignación: un técnico dado de
  // baja no debe aparecer como filtro.
  const tecnicos = (empleados ?? []).filter(e =>
    e.estatus_activo
    && (departamentoDeLaCategoria === null || e.id_departamento === departamentoDeLaCategoria));

  // Proveedores del área que atiende la categoría elegida. Sin categoría no hay
  // forma de acotarlos, así que se listan todos.
  const proveedoresErrorVisibles = (proveedoresError ?? []).filter(p =>
    departamentoDeLaCategoria === null || p.id_departamento === departamentoDeLaCategoria);

  // Igual que con la subcategoría: si el acotado por departamento deja fuera al
  // técnico elegido, el filtro apuntaría a alguien que ya no aparece en el
  // desplegable y la lista saldría vacía sin explicación. Se suelta solo.
  useEffect(() => {
    const elegido = valor.id_responsable;

    if (elegido === null || elegido === SIN_ASIGNAR) return;
    if (departamentoDeLaCategoria === null) return;
    if (tecnicos.some(e => e.id_empleado === elegido)) return;

    onChange({ ...valor, id_responsable: null });
  }, [tecnicos, departamentoDeLaCategoria, valor, onChange]);

  const cambiarTecnico = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bruto = e.target.value;

    onChange({
      ...valor,
      id_responsable: bruto === '' ? null : bruto === SIN_ASIGNAR ? SIN_ASIGNAR : Number(bruto),
    });
  };

  return (
    <div className='filtrosDiv'>
      {/* El select de categoría es opcional. En la Mesa de Ayuda no va: la
          categoría viene fijada por la tarjeta con la que se entró. En "Mis
          Tickets" sí, porque el usuario no entró por una tarjeta y necesita
          acotar sus propios tickets. Al elegirla encadena la subcategoría y, con
          ella, los técnicos del departamento que atiende esa categoría. */}
      {mostrarCategoria && (
        <select
          value={valor.id_categoria_ticket ?? ''}
          onChange={e => onChange({
            ...valor,
            id_categoria_ticket: e.target.value === '' ? null : Number(e.target.value),
            // La subcategoría y el técnico cuelgan de la categoría: al cambiarla se
            // sueltan para no dejar el filtro apuntando a algo de otra categoría.
            id_subcategoria_ticket: null,
            id_responsable: null,
            id_proveedor_error: null,
          })}
        >
          <option value=''>Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id_categoria_ticket} value={c.id_categoria_ticket}>{c.nombre_categoria}</option>
          ))}
        </select>
      )}

      <select
        value={valor.id_subcategoria_ticket ?? ''}
        onChange={e => onChange({ ...valor, id_subcategoria_ticket: e.target.value === '' ? null : Number(e.target.value) })}
        disabled={esperandoCategoria || esperandoCatalogo}
        title={esperandoCategoria ? 'Elija primero una categoría' : undefined}
      >
        <option value=''>
          {esperandoCategoria
            ? 'Elija una categoría'
            : esperandoCatalogo
              ? 'Cargando categorías…'
              : 'Todas las subcategorías'}
        </option>
        {subcategoriasVisibles.map(s => (
          <option key={s.id_subcategoria_ticket} value={s.id_subcategoria_ticket}>{s.nombre_subcategoria}</option>
        ))}
      </select>

      <select
        value={valor.id_prioridad_ticket ?? ''}
        onChange={e => onChange({ ...valor, id_prioridad_ticket: e.target.value === '' ? null : Number(e.target.value) })}
      >
        <option value=''>Todas las prioridades</option>
        {prioridades.map(p => (
          <option key={p.id_prioridad_ticket} value={p.id_prioridad_ticket}>{p.nombre_prioridad}</option>
        ))}
      </select>

      <select
        value={valor.id_estatus_ticket ?? ''}
        onChange={e => onChange({ ...valor, id_estatus_ticket: e.target.value === '' ? null : Number(e.target.value) })}
      >
        <option value=''>Todos los estatus</option>
        {estatus.map(e => (
          <option key={e.id_estatus_ticket} value={e.id_estatus_ticket}>{e.nombre_estatus}</option>
        ))}
      </select>

      {empleados && (
        <select value={valor.id_responsable ?? ''} onChange={cambiarTecnico}>
          <option value=''>Todos los técnicos</option>
          <option value={SIN_ASIGNAR}>Sin asignar</option>
          {tecnicos.map(e => (
            <option key={e.id_empleado} value={e.id_empleado}>{nombreCompletoEmpleado(e)}</option>
          ))}
        </select>
      )}

      {/* Error de proveedor: es el mismo dato que enciende la sección del detalle,
          así que el filtro se ofrece junto al del técnico. */}
      {mostrarErrorProveedor && (
        <select
          value={valor.error_proveedor === null ? '' : valor.error_proveedor ? '1' : '0'}
          onChange={e => onChange({
            ...valor,
            error_proveedor: e.target.value === '' ? null : e.target.value === '1',
            // El proveedor cuelga de "Errores de proveedor": al salir de esa opción
            // su select se oculta y el filtro seguiría activo sin verse.
            id_proveedor_error: e.target.value === '1' ? valor.id_proveedor_error : null,
          })}
        >
          <option value=''>Todos los tickets</option>
          <option value='1'>Errores de proveedor</option>
          <option value='0'>Sin error de proveedor</option>
        </select>
      )}

      {/* Proveedor del error: solo aparece con "Errores de proveedor" elegido,
          porque sin error capturado no hay proveedor por el que filtrar. */}
      {valor.error_proveedor === true && proveedoresErrorVisibles.length > 0 && (
        <select
          value={valor.id_proveedor_error ?? ''}
          onChange={e => onChange({ ...valor, id_proveedor_error: e.target.value === '' ? null : Number(e.target.value) })}
        >
          <option value=''>Todos los proveedores</option>
          {proveedoresErrorVisibles.map(p => (
            <option key={p.id_proveedor_error} value={p.id_proveedor_error}>{p.nombre_proveedor_error}</option>
          ))}
        </select>
      )}

      {/* Segunda fila: fechas y limpiar siempre debajo de los demás filtros. */}
      <div className='filtrosFechaRow'>
        {/* Rango de fechas de captura. Se cruzan: si el "desde" supera al "hasta",
            el otro extremo se suelta para no dejar una consulta vacía. */}
        <label className='filtroFecha'>
          <span>Desde</span>
          <input
            type='date'
            value={valor.fecha_desde ?? ''}
            max={valor.fecha_hasta ?? undefined}
            onChange={e => {
              const fecha = e.target.value || null;
              const hastaFueraDeRango = valor.fecha_hasta !== null && fecha !== null && valor.fecha_hasta < fecha;
              onChange({ ...valor, fecha_desde: fecha, fecha_hasta: hastaFueraDeRango ? null : valor.fecha_hasta });
            }}
          />
        </label>

        <label className='filtroFecha'>
          <span>Hasta</span>
          <input
            type='date'
            value={valor.fecha_hasta ?? ''}
            min={valor.fecha_desde ?? undefined}
            onChange={e => {
              const fecha = e.target.value || null;
              const desdeFueraDeRango = valor.fecha_desde !== null && fecha !== null && valor.fecha_desde > fecha;
              onChange({ ...valor, fecha_hasta: fecha, fecha_desde: desdeFueraDeRango ? null : valor.fecha_desde });
            }}
          />
        </label>

        <button className='buttonLimpiar' onClick={onLimpiar} disabled={!hayFiltros}>Limpiar</button>
      </div>
    </div>
  );
};

export { VALOR_VACIO };
export default FiltrosTickets;