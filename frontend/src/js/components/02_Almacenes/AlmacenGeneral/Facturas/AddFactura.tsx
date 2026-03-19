import React, { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { getTiposFacturas, addFactura, getFacturas } from '@/store/almacenGeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacenGeneral/Facturas/facturasReducer';
import { analyzeSoftComputing } from '@/store/softcomputing/openAIActions';

// Components
import { FaCircleInfo, FaBoxesPacking } from 'react-icons/fa6';
import { FaCalendar, FaCalculator } from 'react-icons/fa';
import { IoIosCard } from 'react-icons/io';
import { SiGooglemessages } from 'react-icons/si';
import { IoAddCircleOutline } from 'react-icons/io5';
import { AiOutlineNumber } from 'react-icons/ai';


import { getFechaHoraActual } from '@/utils/dateFormat';
import { getProveedores } from '@/store/almacenGeneral/Proveedores/proveedoresActions';
import { getFormasPago, getTiposMoneda } from '@/store/shared/fiscalActions';
import { getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import AddActivosFactura from './AddActivosFactura';
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { FacturasAF, ActivoFacturaInput } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { formatCurrency, formatPeso, toSafeNumber, parseInputNumber } from '@/utils/numbersFormat';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Facturas/AddFactura.css';


interface AddFacturaProps {
  onClose?: () => void;
  onSubmit?: (facturaId?: number) => void;
}

const AddFactura: React.FC<AddFacturaProps> = ({ onClose, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados para los campos del formulario de AddFactura
  const [proveedorFactura, setProveedorFactura] = useState<number>(0);
  const [numeroFactura, setNumeroFactura] = useState<string>('');
  const [tipoFactura, setTipoFactura] = useState<number>(0);
  const [fechaRecepcion, setFechaRecepcion] = useState<string>(getFechaHoraActual());
  const [formaPago, setFormaPago] = useState<number>(0);
  const [tipoMoneda, setTipoMoneda] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  const [subTotalFactura, setSubTotalFactura] = useState<number>(0);
  const [descuentoFactura, setDescuentoFactura] = useState<number>(0);
  const [fleteFactura, setFleteFactura] = useState<number>(0);
  const [ivaFactura, setIvaFactura] = useState<number>(0.16);
  const [totalFactura, setTotalFactura] = useState<number>(0);


  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const tiposFactura = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);
  const clasificacionActivoFijo = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);

  const [isModalAddActivosFacturaOpen, setIsModalAddActivosFacturaOpen] = useState(false);

  const ultimoId = facturas.length > 0
    ? Math.max(...facturas.map(factura => Number(factura.id_factura)))
    : 0;
  const nuevoId = ultimoId + 1;

  // Activos asociados a la factura
  const [activosFactura, setActivosFactura] = useState<ActivoFactura[]>([]);

  // Subtotal, IVA y totales
  const subtotal = activosFactura.reduce(
    (acc, activo) => acc + toSafeNumber(activo.precio_unitario, 0) * toSafeNumber(activo.cantidad, 0),
    0
  );

  const subtotalConDescuento = subtotal - toSafeNumber(descuentoFactura, 0);
  const subtotalConFlete = subtotal + toSafeNumber(fleteFactura, 0);
  const baseGravable = subtotalConDescuento + toSafeNumber(fleteFactura, 0);
  const ivaCalculado = baseGravable * 0.16;
  const subtotalConIVA = baseGravable + ivaCalculado;
  const totalFinal = subtotalConIVA;

  // Calcular Subtotal, IVA y Total cada vez que cambien los activos, flete o descuento
  useEffect(() => {
    setSubTotalFactura(subtotal);
    setIvaFactura(ivaCalculado);
    setTotalFactura(totalFinal);
  }, [subtotal, ivaCalculado, totalFinal]);

  useEffect(() => {
    if (!proveedores?.length) dispatch(getProveedores());
    if (!tiposFactura?.length) dispatch(getTiposFacturas());
    if (!formasPago?.length) dispatch(getFormasPago());
    if (!tiposMoneda?.length) dispatch(getTiposMoneda());
    if (!clasificacionActivoFijo?.length) dispatch(getClasificaciones());
  }, [dispatch]);

  const openModalAddActivosFactura = () => {
    setIsModalAddActivosFacturaOpen(true);
  };

  const closeModalAddActivosFactura = () => {
    setIsModalAddActivosFacturaOpen(false);
  }

  // Manejar activos seleccionados del modal
  const handleActivosCreados = (activosCreadosFactura: ActivoFactura[]) => {
    console.log('AddFactura', activosCreadosFactura)
    // Mantener activos existentes que no fueron modificados/removidos en el modal
    // Los nuevosActivosSeleccionados ya incluyen tanto los existentes como los nuevos
    setActivosFactura(activosCreadosFactura);
  };





  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AddFactura Submit')

    if (activosFactura.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Activos requeridos',
        text: 'Debes agregar al menos un activo fijo antes de guardar la factura.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const numeroFacturaTrim = numeroFactura.trim();

    if (!numeroFacturaTrim) {
      Swal.fire({
        icon: 'warning',
        title: 'Número de factura requerido',
        text: 'Ingresa un número de factura válido.',
        confirmButtonText: 'OK',
      });
      return;
    }



    try {
      // Preparar los datos de la factura
      const nuevaFactura: FacturasAF = {
        id_proveedor: proveedorFactura,
        num_factura: numeroFacturaTrim,
        id_tipo_factura: tipoFactura,
        fecha_fac_recepcion: fechaRecepcion,
        id_forma_pago: formaPago,
        id_tipo_moneda: tipoMoneda,
        observaciones_factura: observaciones,
        subtotal_factura: subTotalFactura,
        descuento_factura: descuentoFactura || 0,
        flete_factura: fleteFactura || 0,
        iva_factura: ivaFactura,
        total_factura: totalFactura,

        // Incluir activos en el objeto de factura con todos los datos necesarios
        activos: activosFactura.length > 0 ? activosFactura.map(activo => ({
          // Datos del activo fijo completos
          nombre_af: activo.nombre_af,
          marca_af: activo.marca_af,
          modelo_af: activo.modelo_af,
          numero_serie_af: activo.numero_serie_af,
          valor_compra_af: activo.valor_compra_af,
          fecha_compra_af: activo.fecha_compra_af,
          af_propio: activo.af_propio,
          fecha_registro_af: activo.fecha_registro_af,
          id_estado_af: activo.id_estado_af,
          id_clasificacion: activo.id_clasificacion!,
          descripcion_af: activo.descripcion_af || null,
          observaciones_af: activo.observaciones_af || null,

          // Datos de la relación factura-activo
          precio_unitario: activo.precio_unitario,
          cantidad: activo.cantidad,
          observaciones: activo.observaciones_af || null,

          // Datos opcionales de asignación inicial (si están presentes en el activo)
          fecha_movimiento: activo.fecha_movimiento || '',
          id_responsable_actual: activo.id_responsable_actual || null,
          id_ubicacion_actual: activo.id_ubicacion_actual || null,
          id_tipo_movimiento: activo.id_tipo_movimiento || null,
          motivo_asignacion: activo.motivo_movimiento || null
        } as ActivoFacturaInput)) : undefined
      };

      console.log('FacturaADD: ', nuevaFactura)
      const resultAction = await dispatch(addFactura(nuevaFactura)).unwrap();
      console.log('Resultado de addFactura:', resultAction);

      if (resultAction.success) {

        // Prueba básica de OpenAI: analizar precios unitarios y total de la factura.
        const resumenActivos = activosFactura.map((activo) => ({
          nombre_af: activo.nombre_af,
          cantidad: toSafeNumber(activo.cantidad, 0),
          precio_unitario: toSafeNumber(activo.precio_unitario, 0),
          total_linea: toSafeNumber(activo.cantidad, 0) * toSafeNumber(activo.precio_unitario, 0),
        }));

        const openAITestResult = await dispatch(
          analyzeSoftComputing({
            mode: 'price_prediction',
            algorithm: 'linear_regression',
            prompt:
              'Analiza si los precios unitarios de los activos y el total de la factura son coherentes con una estimación básica de predicción de precios. Identifica posibles sobreprecios y genera recomendaciones.',
            data: {
              numero_factura: numeroFacturaTrim,
              subtotal_factura: toSafeNumber(subTotalFactura, 0),
              iva_factura: toSafeNumber(ivaFactura, 0),
              total_factura: toSafeNumber(totalFactura, 0),
              activos: resumenActivos,
            },
          })
        ).unwrap();

        if (openAITestResult.success && openAITestResult.data?.analysis_text) {
          const analysisText = openAITestResult.data.analysis_text;

          await Swal.fire({
            icon: 'info',
            title: 'Prueba OpenAI - Análisis de Precios',
            text: analysisText.length > 1000 ? `${analysisText.slice(0, 1000)}...` : analysisText,
            confirmButtonText: 'Continuar',
          });
        } else {
          await Swal.fire({
            icon: 'warning',
            title: 'Prueba OpenAI no disponible',
            text: openAITestResult.message || 'No se pudo obtener análisis de OpenAI para esta factura.',
            confirmButtonText: 'Continuar',
          });
        }

        // Actualizar la lista de facturas
        const facturasActualizadas = await dispatch(getFacturas()).unwrap();

        if (facturasActualizadas.success) {
          dispatch(setFacturas(facturasActualizadas.facturas || []));

          // Limpiar el formulario
          setProveedorFactura(0);
          setNumeroFactura('');
          setTipoFactura(0);
          setFechaRecepcion(getFechaHoraActual());
          setFormaPago(0);
          setTipoMoneda(0);
          setObservaciones('');
          setSubTotalFactura(0);
          setDescuentoFactura(0);
          setFleteFactura(0);
          setIvaFactura(0.16);
          setTotalFactura(0);
          setActivosFactura([]);

          Swal.fire({
            icon: 'success',
            title: 'Factura Añadida',
            text: 'La factura ha sido añadida exitosamente. Activos Fijos Creados y Asignados',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              if (onSubmit) {
                const idFacturaCreada =
                  resultAction.id_factura ??
                  facturasActualizadas.facturas?.find((factura) =>
                    factura.num_factura === numeroFacturaTrim ||
                    factura.num_factura?.endsWith(`-${numeroFacturaTrim}`)
                  )?.id_factura;

                onSubmit(idFacturaCreada);
              }
            }
          });


        } else {
          console.log('Error al actualizar las facturas!');
        }
      } else {

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Error al añadir la factura',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al añadir factura:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir la factura. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  // Manejar cancelar
  const handleCancelar = () => {
    if (onClose) {
      onClose();
    }
  };


  return (
    <div className='AddEditFactura'>

      <form onSubmit={handleSubmit}>

        <section className='id_FechaFactura'>

          <div className='idFactura'>
            <h2>   ID de Factura </h2>
            <p> <AiOutlineNumber className='idIcon' /> {nuevoId} </p>
          </div>

          <div className='fechaRecepcion'>

            <label>
              <h2><FaCalendar className='icon_FechaRecepcion' /> Fecha de Recepción*</h2>

              <input
                type="datetime-local"
                name="fechaRecepcion"
                required
                value={fechaRecepcion}
                onChange={e => setFechaRecepcion(e.target.value)}
              />
            </label>

          </div>

        </section>

        <section className='datosFactura'>

          <div className='title_Container'>
            <h2> <FaCircleInfo className='infoIcon' />  Información de la Factura </h2>
          </div>

          <div className='inputs_Container'>

            <label>
              Proveedor*
              <select
                required
                value={proveedorFactura || ''}
                onChange={e => setProveedorFactura(Number(e.target.value))}
              >
                <option value="">Seleccionar Proveedor</option>
                {Array.isArray(proveedores) && proveedores.map((proveedor) => (
                  <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                    {proveedor.nombre_proveedor}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tipo de Factura*
              <select
                required
                value={tipoFactura || ''}
                onChange={e => setTipoFactura(Number(e.target.value))}
              >
                <option value="">Seleccionar Tipo de Factura</option>
                {Array.isArray(tiposFactura) && tiposFactura.map((tipoFactura) => (
                  <option key={tipoFactura.id_tipofacturaaf} value={tipoFactura.id_tipofacturaaf}>
                    {tipoFactura.nombre_tipofactura}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Número de Factura (SIGHA, otros)*
              <input
                type="text"
                placeholder="Número de Factura"
                value={numeroFactura}
                onChange={e => setNumeroFactura(e.target.value)}
                required
              />
            </label>
          </div>

        </section>

        <section className='datosPago'>

          <div className='title_Container'>
            <h2> <IoIosCard className='infoPago' />  Información de Pago </h2>
          </div>

          <div className='inputs_Container'>
            <label> Forma de Pago*
              <select
                required
                value={formaPago || ''}
                onChange={e => setFormaPago(Number(e.target.value))}
              >
                <option value="">Seleccionar Forma de Pago</option>
                {Array.isArray(formasPago) && formasPago.map((formaPago) => (
                  <option key={formaPago.id_formapago} value={formaPago.id_formapago}>
                    {formaPago.descripcion_formaspago}
                  </option>
                ))}

              </select>
            </label>

            <label> Moneda de Pago de la Factura*
              <select
                required
                value={tipoMoneda || ''}
                onChange={e => setTipoMoneda(Number(e.target.value))}
              >
                <option value="">Seleccionar Tipo de Moneda</option>
                {Array.isArray(tiposMoneda) && tiposMoneda.map(moneda => (
                  <option key={moneda.id_tipomoneda} value={moneda.id_tipomoneda}>
                    {moneda.descripcion_tipomoneda}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className='activosFijos_Factura'>
          <div className='title_Container'>
            <h2> <FaBoxesPacking className='activosFactura' />  Activos Fijos Asociados </h2>
            <div className='agregarActivos' onClick={openModalAddActivosFactura}>
              <IoAddCircleOutline className='addActivoIcon' /> Agregar Activos
            </div>
          </div>


          <div className='inputs_Container'>
            <table>
              <thead>
                <tr>
                  <th>Nombre del Activo</th>
                  <th>Lote</th>
                  <th>Cantidad </th>
                  <th>Clasificación</th>
                  <th>Precio Unitario</th>
                  <th>Total  </th>
                </tr>
              </thead>
              <tbody>
                {activosFactura.length > 0 ? (
                  activosFactura.map((activo, index) => (
                    <tr key={activo.id_activo_fijo || index}>
                      <td>{activo.nombre_af}</td>
                      <td>
                        {activo.codigo_lote
                          ? `${activo.codigo_lote} (${activo.lote_afconsecutivo || '-'} / ${activo.lote_total || '-'})`
                          : 'Pendiente'}
                      </td>
                      <td>{activo.cantidad}</td>

                      <td id='td_ClasificacionAF'>{clasificacionActivoFijo.map((clasificacionAF) => (
                        <div key={clasificacionAF.id_clasificacion} className='divClasificacionAF'>
                          {activo.id_clasificacion === clasificacionAF.id_clasificacion ? clasificacionAF.nombre_clasificacion : ''}
                        </div>
                      ))}</td>

                      <td>{formatPeso(activo.precio_unitario)}</td>
                      <td>{formatPeso(toSafeNumber(activo.cantidad, 0) * toSafeNumber(activo.precio_unitario, 0))}</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      No hay activos agregados a la factura
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className='valoresFactura'>
          <div className='title_Container'>
            <h2> <FaCalculator className='valoresIcon' />  Valores Monetarios de la Factura </h2>
          </div>

          <div className='inputs_Container'>
            <label> Subtotal*
              <input
                type="number"
                step="0.01"
                name="subtotal"
                value={formatCurrency(subTotalFactura)}
                onChange={e => setSubTotalFactura(parseInputNumber(e.target.value))}
                disabled
              />
            </label>

            <label> IVA (16%)
              <input
                type="number"
                step="0.01"
                name="IVA"
                value={formatCurrency(ivaFactura)}
                onChange={e => setIvaFactura(parseInputNumber(e.target.value))}
                disabled
              />
            </label>

            <label> Flete (Valor numérico)
              <input
                type="number"
                step="0.01"
                name="flete"
                placeholder="0.00"
                value={fleteFactura || ''}
                onChange={e => setFleteFactura(parseInputNumber(e.target.value))}
              />
            </label>

            <label> Descuento Aplicado (Valor numérico)
              <input
                type="number"
                step="0.01"
                name="descuento"
                placeholder="0.00"
                value={descuentoFactura || ''}
                onChange={e => setDescuentoFactura(parseInputNumber(e.target.value))}
              />
            </label>

          </div>

          <div className='totalFactura'>
            <div className='totalFacturaLabel'>
              <p id='subTotalFacturaConFlete'> Subtotal (Con Flete): </p>
              <p id='subTotalFacturaConDescuento'> Subtotal (Con Descuento): </p>
              <p id='subTotalSinIVA'> Subtotal (Subtotal Sin IVA): </p>


              <p id='totalFacturaFinal'> Total Final: </p>

            </div>

            <div className='totalFacturaCalculado'>

              <p id='subTotalFacturaConFleteValue'>
                {formatPeso(subtotalConFlete)}
              </p>

              <p id='subTotalFacturaConDescuentoValue'>
                {formatPeso(subtotalConDescuento)}
              </p>

              <p id='subTotalSinIVAValue'>
                {formatPeso(baseGravable)}
              </p>

              <p id='totalFacturaFinalValue'>
                {formatPeso(totalFinal)}
              </p>
            </div>
          </div>

        </section>

        <section className='observacionesFactura'>
          <div className='title_Container'>
            <h2> <SiGooglemessages className='observacionIcon' />  Observaciones </h2>
          </div>

          <div className='inputs_Container'>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales sobre la factura..."
            />
          </div>
        </section>

        <ModalButtons
          buttons={[
            {
              text: 'Guardar',
              type: 'submit',
              className: 'button_addedit'
            },
            {
              text: 'Cancelar',
              type: 'button',
              className: 'button_close',
              onClick: handleCancelar
            }
          ]}
        />

      </form>

      {isModalAddActivosFacturaOpen && (
        <AddActivosFactura
          isOpen={isModalAddActivosFacturaOpen}
          onClose={closeModalAddActivosFactura}
          onActivosCreados={handleActivosCreados}
          activosExistentes={activosFactura}
        />
      )}

    </div>
  );
};

export default AddFactura;
