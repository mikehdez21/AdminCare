import React from 'react';
import type { ActivosFijos, ClasificacionesAF, EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { formatMexicanCurrency } from '@/utils/numbersFormat';
import { MdEdit, MdDeleteForever } from 'react-icons/md';

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

interface TablaActivosFijosProps {
  /** Activos de la página actual del listado. */
  activosFijosPaginaActual: ActivosFijos[];
  /** Catálogo de estatus de activos fijos (state.estatusAF). */
  estatusActivoFijo: EstatusActivosFijos[];
  /** Catálogo de clasificaciones de activos fijos (state.clasificacion). */
  clasificacionActivoFijo: ClasificacionesAF[];
  /** Callback al pulsar el botón de editar. */
  onEdit: (activo: ActivosFijos) => void;
  /** Callback al pulsar el botón de eliminar. */
  onDelete: (activo: ActivosFijos) => void;
}

/**
 * Tabla de 18 columnas del listado de Activos Fijos (ListActivoFijo).
 * Reproduce exactamente el DOM/CSS original: ids th_/td_, badges estatus-*,
 * badges depreciacion-aplicada-* y botones editar/eliminar.
 */
const TablaActivosFijos: React.FC<TablaActivosFijosProps> = ({
  activosFijosPaginaActual,
  estatusActivoFijo,
  clasificacionActivoFijo,
  onEdit,
  onDelete,
}) => {
  return (
    <div className='list_entitiesDiv'>
      <table>
        <thead>
          <tr>
            <th id='th_ID'>ID</th>
            <th id='th_CodigoUnico'>Código Único</th>
            <th id='th_CodigoLote'>Lote</th>
            <th id='th_NombreAF'>Nombre ActivoFijo</th>
            <th id='th_Descripcion'>Descripción</th>
            <th id='th_Modelo'>Modelo</th>
            <th id='th_Marca'>Marca</th>
            <th id='th_NumeroSerie'>Número de Serie</th>
            <th id='th_CostoUnitario'>Costo Unitario</th>
            <th id='th_AFPropio'>Activo Propio</th>
            <th id='th_AFMenor'>Activo Menor</th>
            <th id='th_EstadoAF'>Estado del Activo</th>
            <th id='th_ClasificacionAF'>Clasificación</th>
            <th id='th_FechaRegistro'>Fecha Registro</th>
            <th id='th_DepreciacionAplicada'>Depreciación</th>
            <th id='th_Observaciones'>Observaciones</th>
            <th id='th_FechaCreacion'>Fecha Creación</th>
            <th id='th_FechaModificacion'>Fecha Modificación</th>
            <th id='th_Acciones'>ACCIONES</th>
          </tr>
        </thead>

        <tbody>
          {activosFijosPaginaActual.map(activoFijo => (
            <tr key={activoFijo.id_activo_fijo}>
              <td id='td_ID'>{activoFijo.id_activo_fijo}</td>
              <td id='td_CodigoUnico'>{activoFijo.codigo_unico}</td>
              <td id='td_CodigoLote'>
                <p className='CodigoLote'>
                  {activoFijo.codigo_lote
                    ? `${activoFijo.codigo_lote} (${activoFijo.lote_afconsecutivo || '-'} / ${activoFijo.lote_total || '-'})`
                    : '-'}
                </p>
              </td>

              <td id='td_NombreAF'>
                <p className='NombreAF'>
                  {activoFijo.nombre_af} <strong>{activoFijo.af_propio === false ? ' (Comodato)' : ''}</strong>
                </p>
              </td>

              <td id='td_Descripcion'>
                <div className='divDescripcionAF'>
                  {activoFijo.descripcion_af}
                </div>
              </td>

              <td id='td_Modelo'>
                <div className='divModeloAF'>
                  {activoFijo.modelo_af}
                </div>
              </td>
              <td id='td_Marca'>{activoFijo.marca_af}</td>

              <td id='td_NumeroSerie'>
                <div className='divNumeroSerieAF'>
                  {activoFijo.numero_serie_af}
                </div>
              </td>
              <td id='td_CostoUnitario'>{formatMexicanCurrency(activoFijo.costo_unitario_af)}</td>
              <td id='td_AFPropio'>{activoFijo.af_propio ? 'Sí' : 'No'}</td>
              <td id='td_AFMenor'>{activoFijo.af_menor ? 'Sí' : 'No'}</td>

              <td id='td_EstadoAF'>
                {estatusActivoFijo.map((estatusAF) => {
                  if (activoFijo.id_estado_af !== estatusAF.id_estatusaf) return null;

                  return (
                    <div key={estatusAF.id_estatusaf} className={`estatus-badge ${getEstatusClass(estatusAF.descripcion_estatusaf)}`}>
                      {estatusAF.descripcion_estatusaf}
                    </div>
                  );
                })}
              </td>

              <td id='td_ClasificacionAF'>
                {activoFijo.id_clasificacion == null
                  ? <span className='badge badge-menor'>Activos Menores</span>
                  : clasificacionActivoFijo.map((clasificacionAF) => (
                    <div key={clasificacionAF.id_clasificacion} className='divClasificacionAF'>
                      {activoFijo.id_clasificacion === clasificacionAF.id_clasificacion ? clasificacionAF.nombre_clasificacion : ''}
                    </div>
                  ))}
              </td>

              <td id='td_FechaRegistro'>{formatDateHorasToFrontend(activoFijo.fecha_registro_af)}</td>

              <td id='td_DepreciacionAplicada'>
                {activoFijo.af_propio === false ? (
                  <div className='badge depreciacion-aplicada-noaplica'>
                    N/A
                  </div>
                ) : (
                  activoFijo.depreciacion_aplicada ? (
                    <div className='badge depreciacion-aplicada-activa'>
                      Activa
                    </div>
                  ) : (
                    <div className='badge depreciacion-aplicada-inactiva'>
                      Inactiva
                    </div>
                  )
                )}
              </td>

              <td id='td_Observaciones'>
                <div className='divObservacionesAF'>
                  {activoFijo.observaciones_af}
                </div>
              </td>

              <td id='td_FechaCreacion'>{activoFijo.created_at}</td>
              <td id='td_FechaModificacion'>{activoFijo.updated_at}</td>

              <td id='td_Acciones'>
                <div className='divActions'>
                  <button className='button_editEntity' onClick={() => onEdit(activoFijo)}> <MdEdit /> </button>
                  <button className='button_deleteEntity' onClick={() => onDelete(activoFijo)}><MdDeleteForever /> </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaActivosFijos;