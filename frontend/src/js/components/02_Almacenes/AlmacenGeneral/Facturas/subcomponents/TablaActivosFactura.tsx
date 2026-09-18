import React from 'react';
import { FaBoxesPacking } from 'react-icons/fa6';
import { IoAddCircleOutline } from 'react-icons/io5';
import { formatMexicanCurrency, toSafeNumber } from '@/utils/numbersFormat';
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { ActivoFacturaConIndices } from '@/hooks/useSeriesAgrupadas';

interface TablaActivosFacturaProps {
  /** Activos agrupados por clave (useSeriesAgrupadas, conectado en el padre). */
  activosFacturaAgrupados: ActivoFacturaConIndices[];
  clasificaciones: ClasificacionesAF[];
  /** Total de unidades físicas (solo se muestra si mostrarTotalActivos es true). */
  totalActivosFisicos?: number;
  /** true → título con el total entre paréntesis (Add). */
  mostrarTotalActivos?: boolean;
  /** Texto del botón después del icono (Add alterna Editar/Agregar; Edit es " Editar Activos"). */
  textoBotonActivos: string;
  /** Texto mostrado cuando el activo no tiene lote (Add: "Pendiente", Edit: "-"). */
  textoLoteVacio: string;
  onAgregarActivos: () => void;
  onEditarAsignaciones: (activo: ActivoFacturaConIndices) => void;
}

/**
 * Tabla activosFijos_Factura de activos asociados a la factura, compartida por
 * AddFactura y EditFactura. Reproduce el DOM exacto (mismos ids th_/td_ y botón
 * de asignaciones), parametrizando solo las diferencias Add vs Edit.
 */
const TablaActivosFactura: React.FC<TablaActivosFacturaProps> = ({
  activosFacturaAgrupados,
  clasificaciones,
  totalActivosFisicos,
  mostrarTotalActivos = false,
  textoBotonActivos,
  textoLoteVacio,
  onAgregarActivos,
  onEditarAsignaciones,
}) => {
  const tituloActivos = `  Activos Fijos Asociados${mostrarTotalActivos ? ` (${totalActivosFisicos})` : ''} `;

  return (
    <section className='activosFijos_Factura'>
      <div className='title_Container'>
        <h2> <FaBoxesPacking className='activosFactura' />{tituloActivos}</h2>
        <div className='agregarActivos' onClick={onAgregarActivos}>
          <IoAddCircleOutline className='addActivoIcon' />{textoBotonActivos}
        </div>
      </div>

      <div className='inputs_Container'>
        <table>
          <thead>
            <tr>
              <th>Nombre del Activo</th>
              <th>Lote</th>
              <th id='th_Asignaciones'>Asignaciones</th>
              <th id='th_Cantidad'>Cantidad </th>
              <th>Clasificación</th>
              <th id='th_CostoUnitario'>Costo Unitario</th>
              <th>Total  </th>
            </tr>
          </thead>

          <tbody>
            {activosFacturaAgrupados.length > 0 ? (
              activosFacturaAgrupados.map((activo, index) => (
                <tr key={activo.id_activo_fijo || index}>
                  <td>{activo.nombre_af} <strong>{activo.af_propio === false ? ' (Comodato)' : ''}</strong></td>
                  <td>
                    {activo.codigo_lote
                      ? `${activo.codigo_lote}`
                      : textoLoteVacio}
                  </td>

                  <td id='td_Asignaciones'>
                    <button
                      className='buttonAsignaciones'
                      type='button'
                      onClick={() => onEditarAsignaciones(activo)}
                    >
                      Editar ({activo._indices?.length || 0} activos)
                    </button>

                  </td>

                  <td id='td_Cantidad'>{activo.cantidad}</td>

                  <td id='td_ClasificacionAF'>
                    {(() => {
                      const clasificacion = clasificaciones.find(c => c.id_clasificacion === activo.id_clasificacion);
                      return clasificacion ? clasificacion.nombre_clasificacion : '';
                    })()}
                  </td>

                  <td id='td_CostoUnitario'> {formatMexicanCurrency(activo.costo_unitario_af)}</td>
                  <td id='td_Total'>{formatMexicanCurrency(toSafeNumber(activo.cantidad, 0) * toSafeNumber(activo.costo_unitario_af, 0))}</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className='sinActivosSerie'>
                  No hay activos agregados a la factura
                </td>
              </tr>
            )}
          </tbody>

        </table>

      </div>
    </section>
  );
};

export default TablaActivosFactura;