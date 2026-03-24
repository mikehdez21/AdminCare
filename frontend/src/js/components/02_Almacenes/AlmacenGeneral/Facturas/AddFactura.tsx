import React, { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { addFactura, getFacturas } from '@/store/almacenGeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacenGeneral/Facturas/facturasReducer';
import { analyzeSoftComputing } from '@/store/softcomputing/openAIActions';
import { trainPricingModelFromDb, predictPricingModel } from '@/store/softcomputing/pricingModelActions';

// Components
import { FaCircleInfo, FaBoxesPacking } from 'react-icons/fa6';
import { FaCalendar, FaCalculator } from 'react-icons/fa';
import { IoIosCard } from 'react-icons/io';
import { SiGooglemessages } from 'react-icons/si';
import { IoAddCircleOutline } from 'react-icons/io5';
import { AiOutlineNumber } from 'react-icons/ai';


import { getFechaHoraActual } from '@/utils/dateFormat';
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
  const [loadingOpenAIRecommendation, setLoadingOpenAIRecommendation] = useState(false);
  const [loadingMLRecommendation, setLoadingMLRecommendation] = useState(false);


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

  const obtenerResumenActivosActuales = () => {
    return activosFactura.map((activo) => ({
      nombre_af: activo.nombre_af,
      marca_af: activo.marca_af,
      modelo_af: activo.modelo_af,
      cantidad: toSafeNumber(activo.cantidad, 0),
      precio_unitario: toSafeNumber(activo.precio_unitario, 0),
      total_linea: toSafeNumber(activo.cantidad, 0) * toSafeNumber(activo.precio_unitario, 0),
      id_clasificacion: toSafeNumber(activo.id_clasificacion, 0),
    }));
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const unwrapCodeFence = (text: string): string => {
    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/i);
    return fencedMatch ? fencedMatch[1].trim() : trimmed;
  };

  const renderRawRecommendationHtml = (rawText: string, title: string) => {
    const safeText = escapeHtml(rawText || 'Sin contenido');

    return `
      <div style="text-align:left; max-height:420px; overflow:auto; padding:6px;">
        <p style="margin: 0 0 10px 0;"><strong>${escapeHtml(title)}</strong></p>
        <pre style="
          margin:0;
          padding:12px;
          border-radius:8px;
          border:1px solid #e1e1e1;
          background:#f7f9fb;
          color:#1f2937;
          font-size:12px;
          line-height:1.45;
          white-space:pre-wrap;
          word-break:break-word;
          font-family:Consolas, 'Courier New', monospace;
        ">${safeText}</pre>
      </div>
    `;
  };

  const renderOpenAIRecommendationHtml = (analysisText: string): string => {
    const normalizedText = unwrapCodeFence(analysisText);

    try {
      const parsed = JSON.parse(normalizedText) as {
        resumen_general?: string;
        resultados?: Array<{
          activo?: string;
          precio_actual?: number;
          opcion_mas_barata?: string;
          precio_referencia?: number;
          ahorro_estimado?: number;
          url?: string;
          notas?: string;
        }>;
      };

      const resumen = escapeHtml(parsed.resumen_general || 'Sin resumen disponible.');
      const resultados = Array.isArray(parsed.resultados) ? parsed.resultados : [];

      const resultadosHtml = resultados.length
        ? resultados
            .map((item) => {
              const activo = escapeHtml(item.activo || 'Activo');
              const opcion = escapeHtml(item.opcion_mas_barata || 'Sin opción específica');
              const precioActual = toSafeNumber(item.precio_actual, 0);
              const precioRef = toSafeNumber(item.precio_referencia, 0);
              const ahorro = toSafeNumber(item.ahorro_estimado, 0);
              const notas = escapeHtml(item.notas || '');
              const rawUrl = (item.url || '').trim();
              const safeUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : '';
              const urlHtml = safeUrl
                ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Ver opción</a>`
                : '<span>URL no disponible</span>';

              return `
                <div style="padding:10px 12px; border:1px solid #e8e8e8; border-radius:8px; margin-bottom:10px; background:#fff;">
                  <p style="margin:0 0 6px 0;"><strong>${activo}</strong></p>
                  <p style="margin:0 0 4px 0;">Precio actual: ${formatPeso(precioActual)}</p>
                  <p style="margin:0 0 4px 0;">Opción sugerida: ${opcion}</p>
                  <p style="margin:0 0 4px 0;">Precio referencia: ${formatPeso(precioRef)} | Ahorro estimado: ${formatPeso(ahorro)}</p>
                  <p style="margin:0 0 4px 0;">${urlHtml}</p>
                  ${notas ? `<p style="margin:0; color:#555;">Notas: ${notas}</p>` : ''}
                </div>
              `;
            })
            .join('')
        : '<p>No se recibieron resultados estructurados.</p>';

      return `
        <div style="text-align:left; max-height:420px; overflow:auto; background:#fafafa; border:1px solid #ececec; border-radius:10px; padding:12px;">
          <p style="margin:0 0 10px 0;"><strong>Resumen:</strong> ${resumen}</p>
          <hr style="border:none; border-top:1px solid #e5e7eb; margin: 10px 0 12px 0;" />
          ${resultadosHtml}
        </div>
      `;
    } catch {
      return renderRawRecommendationHtml(normalizedText, 'Respuesta OpenAI (formato libre)');
    }
  };

  const handleOpenAIRecommendation = async () => {
    if (activosFactura.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Activos requeridos',
        text: 'Agrega activos para obtener una recomendación OpenAI.',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      setLoadingOpenAIRecommendation(true);
      const resumenActivos = obtenerResumenActivosActuales();

      const openAITestResult = await dispatch(
        analyzeSoftComputing({
          mode: 'price_prediction',
          algorithm: 'linear_regression',
          prompt:
            'Con base en nombre, marca, modelo y precio unitario de cada activo, realiza una búsqueda sencilla tipo Google Shopping para identificar la misma opción (o alternativa comparable) más barata. Responde en JSON con llaves: resumen_general y resultados[]. Cada resultado debe incluir: activo, precio_actual, opcion_mas_barata, precio_referencia, ahorro_estimado, url, notas. Si no hay navegación en tiempo real o no puedes validar la URL, indícalo explícitamente en notas y no inventes enlaces.',
          data: {
            numero_factura: numeroFactura.trim() || 'PENDIENTE',
            subtotal_factura: toSafeNumber(subTotalFactura, 0),
            descuento_factura: toSafeNumber(descuentoFactura, 0),
            flete_factura: toSafeNumber(fleteFactura, 0),
            iva_factura: toSafeNumber(ivaFactura, 0),
            total_factura: toSafeNumber(totalFactura, 0),
            activos: resumenActivos,
          },
        })
      ).unwrap();

      if (openAITestResult.success && openAITestResult.data) {
        const analysisText = openAITestResult.data.analysis_text
          || JSON.stringify(openAITestResult.data.raw_response || {}, null, 2);

        if (!analysisText || analysisText.trim() === '') {
          await Swal.fire({
            icon: 'warning',
            title: 'Recomendación OpenAI vacía',
            text: 'OpenAI respondió sin contenido interpretable para mostrar.',
            confirmButtonText: 'OK',
          });
          return;
        }

        await Swal.fire({
          icon: 'info',
          title: 'Recomendación OpenAI',
          html: renderOpenAIRecommendationHtml(analysisText),
          width: 860,
          confirmButtonText: 'OK',
        });
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Recomendación OpenAI no disponible',
          text: openAITestResult.message || 'No se pudo obtener respuesta de OpenAI.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error en recomendación OpenAI:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error OpenAI',
        text: 'No fue posible obtener la recomendación OpenAI.',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoadingOpenAIRecommendation(false);
    }
  };

  const handleMLRecommendation = async () => {
    if (activosFactura.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Activos requeridos',
        text: 'Agrega activos para obtener una recomendación ML.',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      setLoadingMLRecommendation(true);
      const trainResponse = await dispatch(
        trainPricingModelFromDb({
          algorithm: 'random_forest',
          test_size: 0.25,
          random_state: 42,
          n_estimators: 300,
          limit: 1000,
        })
      ).unwrap();

      if (!trainResponse.success || !trainResponse.data?.model_id) {
        await Swal.fire({
          icon: 'error',
          title: 'Entrenamiento ML fallido',
          text: trainResponse.message || 'No fue posible entrenar el modelo ML.',
          confirmButtonText: 'OK',
        });
        return;
      }

      const modelId = String(trainResponse.data.model_id);

      const predictRows = activosFactura.map((activo) => {
        const cantidad = toSafeNumber(activo.cantidad, 0);
        const precioUnitario = toSafeNumber(activo.precio_unitario, 0);
        const totalLinea = cantidad * precioUnitario;

        return {
          features: {
            subtotal_factura: toSafeNumber(subTotalFactura, 0),
            descuento_factura: toSafeNumber(descuentoFactura, 0),
            flete_factura: toSafeNumber(fleteFactura, 0),
            iva_factura: toSafeNumber(ivaFactura, 0),
            total_factura: toSafeNumber(totalFactura, 0),
            total_linea: toSafeNumber(totalLinea, precioUnitario),
          },
        };
      });

      const predictResponse = await dispatch(
        predictPricingModel({
          model_id: modelId,
          rows: predictRows,
        })
      ).unwrap();

      if (!predictResponse.success || !predictResponse.data?.predictions) {
        await Swal.fire({
          icon: 'error',
          title: 'Predicción ML fallida',
          text: predictResponse.message || 'No fue posible predecir precios unitarios.',
          confirmButtonText: 'OK',
        });
        return;
      }

      const predicted = Array.isArray(predictResponse.data.predictions)
        ? (predictResponse.data.predictions as number[])
        : [];

      const comparativo = activosFactura.map((activo, idx) => {
        const actual = toSafeNumber(activo.precio_unitario, 0);
        const estimado = toSafeNumber(predicted[idx], 0);
        const diferenciaPct = estimado > 0 ? ((actual - estimado) / estimado) * 100 : 0;

        let estatus = 'OK';
        if (diferenciaPct > 15) estatus = 'Sobreprecio probable';
        if (diferenciaPct < -15) estatus = 'Debajo de referencia';

        return `${activo.nombre_af}: actual ${formatPeso(actual)} | ML ${formatPeso(estimado)} | ${diferenciaPct.toFixed(2)}% (${estatus})`;
      });

      const metrics = (trainResponse.data.metrics || {}) as { mae?: number; rmse?: number; r2?: number };
      const resumenMetricas = `MAE: ${toSafeNumber(metrics.mae, 0).toFixed(2)} | RMSE: ${toSafeNumber(metrics.rmse, 0).toFixed(2)} | R2: ${toSafeNumber(metrics.r2, 0).toFixed(4)}`;
      const comparativoHtml = comparativo
        .map((linea, index) => {
          const contenido = escapeHtml(linea);
          return `
            <div style="
              border:1px solid #e5e7eb;
              background:#ffffff;
              border-radius:8px;
              padding:8px 10px;
              margin-bottom:8px;
              font-family:Consolas, 'Courier New', monospace;
              font-size:12px;
              line-height:1.4;
            ">
              <strong>#${index + 1}</strong> ${contenido}
            </div>
          `;
        })
        .join('');

      await Swal.fire({
        icon: 'info',
        title: 'Recomendación ML (Random Forest)',
        html: `
          <div style="text-align:left; max-height:380px; overflow:auto; background:#fafafa; border:1px solid #ececec; border-radius:10px; padding:12px;">
            <p style="margin:0 0 8px 0;"><strong>Modelo:</strong> ${escapeHtml(modelId)}</p>
            <p style="margin:0 0 8px 0;"><strong>Métricas:</strong> ${escapeHtml(resumenMetricas)}</p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin: 10px 0 12px 0;" />
            ${comparativoHtml || '<p>No se recibieron predicciones para mostrar.</p>'}
          </div>
        `,
        width: 800,
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error en recomendación ML:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error ML',
        text: 'No fue posible obtener la recomendación ML.',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoadingMLRecommendation(false);
    }
  };

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

          <div className='inputs_Container recommendationButtonsRow'>
            <button
              type='button'
              className='recommendationButton recommendationButton--openai'
              onClick={handleOpenAIRecommendation}
              disabled={loadingOpenAIRecommendation || loadingMLRecommendation || activosFactura.length === 0}
            >
              {loadingOpenAIRecommendation ? 'Generando...' : 'Recomendación OpenAI'}
            </button>

            <button
              type='button'
              className='recommendationButton recommendationButton--ml'
              onClick={handleMLRecommendation}
              disabled={loadingMLRecommendation || loadingOpenAIRecommendation || activosFactura.length === 0}
            >
              {loadingMLRecommendation ? 'Entrenando / Prediciendo...' : 'Recomendación ML'}
            </button>
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
