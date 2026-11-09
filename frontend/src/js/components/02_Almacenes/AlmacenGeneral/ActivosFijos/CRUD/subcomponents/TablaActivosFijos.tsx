import React from 'react';
import type { ActivosFijos, ClasificacionesAF, EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import type { OrdenTabla } from '@/@types/paginacionTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { formatMexicanCurrency } from '@/utils/numbersFormat';
import { MdEdit, MdDeleteForever } from 'react-icons/md';

import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';

/**
 * Devuelve la clase CSS del badge del estatus según la descripción.
 * Replica getEstatusClass que estaba definida dentro de la tabla original.
 */
const getEstatusClass = (descripcion: string): string => {
  const estatus = descripcion.toLowerCase().trim();
  if (estatus === 'activo') return 'estatus-activo';
  if (estatus.includes('mantenimiento') || estatus.includes('revisión')) return 'estatus-mantenimiento-revision';
  if (estatus.includes('baja') || estatus === 'perdido') return 'estatus-baja-perdido';
  if (estatus === 'prestado') return 'estatus-prestado';
  return 'estatus-default';
};

function opcionesCatalogo<T>(
  items: T[],
  id: (item: T) => number | undefined,
  etiqueta: (item: T) => string,
): Array<{ valor: string; etiqueta: string }> {
  return items.reduce<Array<{ valor: string; etiqueta: string }>>((opciones, item) => {
    const valor = id(item);

    if (typeof valor === 'number') {
      opciones.push({ valor: String(valor), etiqueta: etiqueta(item) });
    }

    return opciones;
  }, []);
}

interface TablaActivosFijosProps {
  /** Activos de la página actual del listado. */
  activosFijosPaginaActual: ActivosFijos[];
  /** Catálogo de estatus de activos fijos (state.estatusAF). */
  estatusActivoFijo: EstatusActivosFijos[];
  /** Catálogo de clasificaciones de activos fijos (state.clasificacion). */
  clasificacionActivoFijo: ClasificacionesAF[];
  orden: OrdenTabla | null;
  onOrden: (clave: string) => void;
  filtros: Record<string, string>;
  onFiltro: (clave: string, valor: string) => void;
  /** Callback al pulsar el botón de editar. */
  onEdit: (activo: ActivosFijos) => void;
  /** Callback al pulsar el botón de eliminar. */
  onDelete: (activo: ActivosFijos) => void;
}

/**
 * Tabla de 18 columnas del listado de Activos Fijos (ListActivoFijo).
 * Reproduce el DOM/CSS original: ids th_/td_, badges estatus-*,
 * badges depreciacion-aplicada-* y botones editar/eliminar.
 */
const TablaActivosFijos: React.FC<TablaActivosFijosProps> = ({
  activosFijosPaginaActual,
  estatusActivoFijo,
  clasificacionActivoFijo,
  orden,
  onOrden,
  filtros,
  onFiltro,
  onEdit,
  onDelete,
}) => {
  const columnas: ColumnaTabla<ActivosFijos>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'activosFijos_th_ID',
      tdId: 'activosFijos_td_ID',
      fija: 'izquierda',
      render: (activoFijo) => <div className='divIDAF'>{activoFijo.id_activo_fijo}</div>,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'codigo_unico',
      encabezado: 'Código Único',
      thId: 'activosFijos_th_CodigoUnico',
      tdId: 'activosFijos_td_CodigoUnico',
      fija: 'izquierda',
      desplazamientoFijo: '80px',
      render: (activoFijo) => activoFijo.codigo_unico,
      filtro: { tipo: 'texto', placeholder: 'Código' },
    },
    {
      clave: 'lote',
      encabezado: 'Lote',
      thId: 'activosFijos_th_CodigoLote',
      tdId: 'activosFijos_td_CodigoLote',
      render: (activoFijo) => (
        <p className='CodigoLote'>
          {activoFijo.codigo_lote
            ? `${activoFijo.codigo_lote} (${activoFijo.lote_afconsecutivo || '-'} / ${activoFijo.lote_total || '-'})`
            : '-'}
        </p>
      ),
      filtro: { tipo: 'texto', placeholder: 'Lote' },
    },
    {
      clave: 'nombre',
      encabezado: 'Nombre ActivoFijo',
      thId: 'activosFijos_th_NombreAF',
      tdId: 'activosFijos_td_NombreAF',
      render: (activoFijo) => (
        <p className='NombreAF'>
          {activoFijo.nombre_af}{' '}
          <strong>{activoFijo.af_propio === false ? ' (Comodato)' : ''}</strong>
        </p>
      ),
      filtro: { tipo: 'texto', placeholder: 'Nombre' },
    },
    {
      clave: 'descripcion',
      encabezado: 'Descripción',
      thId: 'activosFijos_th_Descripcion',
      tdId: 'activosFijos_td_Descripcion',
      render: (activoFijo) => (
        <div className='divDescripcionAF'>{activoFijo.descripcion_af}</div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Descripción' },
    },
    {
      clave: 'modelo',
      encabezado: 'Modelo',
      thId: 'activosFijos_th_Modelo',
      tdId: 'activosFijos_td_Modelo',
      render: (activoFijo) => <div className='divModeloAF'>{activoFijo.modelo_af}</div>,
      filtro: { tipo: 'texto', placeholder: 'Modelo' },
    },
    {
      clave: 'marca',
      encabezado: 'Marca',
      thId: 'activosFijos_th_Marca',
      tdId: 'activosFijos_td_Marca',
      render: (activoFijo) => activoFijo.marca_af,
      filtro: { tipo: 'texto', placeholder: 'Marca' },
    },
    {
      clave: 'serie',
      encabezado: 'Número de Serie',
      thId: 'activosFijos_th_NumeroSerie',
      tdId: 'activosFijos_td_NumeroSerie',
      render: (activoFijo) => (
        <div className='divNumeroSerieAF'>{activoFijo.numero_serie_af}</div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Serie' },
    },
    {
      clave: 'costo',
      encabezado: 'Costo Unitario',
      thId: 'activosFijos_th_CostoUnitario',
      tdId: 'activosFijos_td_CostoUnitario',
      render: (activoFijo) => formatMexicanCurrency(activoFijo.costo_unitario_af),
    },
    {
      clave: 'propio',
      encabezado: 'Activo Propio',
      thId: 'activosFijos_th_AFPropio',
      tdId: 'activosFijos_td_AFPropio',
      render: (activoFijo) => (activoFijo.af_propio ? 'Sí' : 'No'),
      filtro: {
        tipo: 'booleano',
        opciones: [
          { valor: '1', etiqueta: 'Sí' },
          { valor: '0', etiqueta: 'No' },
        ],
      },
    },
    {
      clave: 'menor',
      encabezado: 'Activo Menor',
      thId: 'activosFijos_th_AFMenor',
      tdId: 'activosFijos_td_AFMenor',
      render: (activoFijo) => (activoFijo.af_menor ? 'Sí' : 'No'),
      filtro: {
        tipo: 'booleano',
        opciones: [
          { valor: '1', etiqueta: 'Sí' },
          { valor: '0', etiqueta: 'No' },
        ],
      },
    },
    {
      clave: 'estado',
      encabezado: 'Estado del Activo',
      thId: 'activosFijos_th_EstadoAF',
      tdId: 'activosFijos_td_EstadoAF',
      render: (activoFijo) => {
        const estatus = estatusActivoFijo.find(
          (item) => item.id_estatusaf === activoFijo.id_estado_af,
        );

        if (!estatus) return null;

        return (
          <div className={`estatus-badge ${getEstatusClass(estatus.descripcion_estatusaf)}`}>
            {estatus.descripcion_estatusaf}
          </div>
        );
      },
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          estatusActivoFijo,
          (estatus) => estatus.id_estatusaf,
          (estatus) => estatus.descripcion_estatusaf,
        ),
      },
    },
    {
      clave: 'clasificacion',
      encabezado: 'Clasificación',
      thId: 'activosFijos_th_ClasificacionAF',
      tdId: 'activosFijos_td_ClasificacionAF',
      render: (activoFijo) =>
        activoFijo.id_clasificacion == null ? (
          <span className='badge badge-menor'>Activos Menores</span>
        ) : (
          <div className='divClasificacionAF'>
            {clasificacionActivoFijo.find(
              (clasificacion) => clasificacion.id_clasificacion === activoFijo.id_clasificacion,
            )?.nombre_clasificacion ?? ''}
          </div>
        ),
      filtro: {
        tipo: 'seleccion',
        opciones: [
          ...opcionesCatalogo(
            clasificacionActivoFijo,
            (clasificacion) => clasificacion.id_clasificacion,
            (clasificacion) => clasificacion.nombre_clasificacion,
          ),
          { valor: 'sin_clasificacion', etiqueta: 'Activos Menores' },
        ],
      },
    },
    {
      clave: 'fecha_registro',
      encabezado: 'Fecha Registro',
      thId: 'activosFijos_th_FechaRegistro',
      tdId: 'activosFijos_td_FechaRegistro',
      render: (activoFijo) => formatDateHorasToFrontend(activoFijo.fecha_registro_af),
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'depreciacion',
      encabezado: 'Depreciación',
      thId: 'activosFijos_th_DepreciacionAplicada',
      tdId: 'activosFijos_td_DepreciacionAplicada',
      render: (activoFijo) => {
        if (activoFijo.af_propio === false) {
          return <div className='badge depreciacion-aplicada-noaplica'>N/A</div>;
        }

        return activoFijo.depreciacion_aplicada ? (
          <div className='badge depreciacion-aplicada-activa'>Activa</div>
        ) : (
          <div className='badge depreciacion-aplicada-inactiva'>Inactiva</div>
        );
      },
      filtro: {
        tipo: 'seleccion',
        opciones: [
          { valor: 'activa', etiqueta: 'Activa' },
          { valor: 'inactiva', etiqueta: 'Inactiva' },
          { valor: 'na', etiqueta: 'N/A' },
        ],
      },
    },
    {
      clave: 'observaciones',
      encabezado: 'Observaciones',
      thId: 'activosFijos_th_Observaciones',
      tdId: 'activosFijos_td_Observaciones',
      render: (activoFijo) => (
        <div className='divObservacionesAF'>{activoFijo.observaciones_af}</div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Observaciones' },
    },
    {
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'activosFijos_th_FechaCreacion',
      tdId: 'activosFijos_td_FechaCreacion',
      render: (activoFijo) => activoFijo.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'activosFijos_th_FechaModificacion',
      tdId: 'activosFijos_td_FechaModificacion',
      render: (activoFijo) => activoFijo.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'activosFijos_th_Acciones',
      tdId: 'activosFijos_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (activoFijo) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => onEdit(activoFijo)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => onDelete(activoFijo)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  return (
    <TablaEntidades
      className='list_entitiesDiv_activosFijos'
      filas={activosFijosPaginaActual}
      columnas={columnas}
      clave={(activoFijo) => activoFijo.id_activo_fijo ?? ''}
      orden={orden}
      onOrden={onOrden}
      filtros={filtros}
      onFiltro={onFiltro}
      mensajeVacio={<p>No hay coincidencias con los filtros seleccionados.</p>}
    />
  );
};

export default TablaActivosFijos;
