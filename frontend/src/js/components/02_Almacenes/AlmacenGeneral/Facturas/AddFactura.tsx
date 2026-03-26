import React, { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

// Facturas
import { addFactura, getFacturas, getTiposFacturas } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';
import AddActivosFactura from './AddActivosFactura';
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { FacturasAF, ActivoFacturaInput } from '@/@types/AlmacenGeneralTypes/facturasTypes';

// SoftComputing
import { analyzeSoftComputing } from '@/store/softcomputing/openAIActions';
import { trainPricingModelFromDb, predictPricingModel } from '@/store/softcomputing/pricingModelActions';

// Icons
import { FaCircleInfo, FaBoxesPacking } from 'react-icons/fa6';
import { FaCalendar, FaCalculator } from 'react-icons/fa';
import { IoIosCard } from 'react-icons/io';
import { SiGooglemessages } from 'react-icons/si';
import { IoAddCircleOutline } from 'react-icons/io5';
import { AiOutlineNumber } from 'react-icons/ai';

// Store
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { getFormasPago, getTiposMoneda } from '@/store/shared/fiscalActions';
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { getFechaHoraActual } from '@/utils/dateFormat';
import { formatCurrency, formatPeso, toSafeNumber, parseInputNumber } from '@/utils/numbersFormat';

// Components
import ModalButtons from '@/components/00_Utils/ModalButtons';

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

  // SoftComputing - Recomendaciones
  const [loadingOpenAIRecommendation, setLoadingOpenAIRecommendation] = useState(false);
  const [loadingMLRecommendation, setLoadingMLRecommendation] = useState(false);

  // No Series - Modal de edición de series
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesEditables, setSeriesEditables] = useState<string[]>([]);
  const [activoSerieEnEdicion, setActivoSerieEnEdicion] = useState<{
    clave: string;
    nombre_af: string;
    indices: number[];
  } | null>(null);


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
    (acc, activo) => acc + toSafeNumber(activo.precio_unitario_af, 0) * toSafeNumber(activo.cantidad, 0),
    0
  );

  const totalActivosFisicos = activosFactura.reduce(
    (acc, activo) => acc + toSafeNumber(activo.cantidad, 0),
    0
  );

  // Agrupación solo visual para la tabla de resumen
  const activosFacturaAgrupados = Array.from(
    activosFactura.reduce((mapa, activo, idx) => {
      const clave = [
        activo.nombre_af || '',
        activo.id_clasificacion || 0,
        toSafeNumber(activo.precio_unitario_af, 0),
        (activo.observaciones_af || '').trim(),
        activo.codigo_lote || '',
      ].join('|');

      const existente = mapa.get(clave);

      if (!existente) {
        mapa.set(clave, {
          ...activo,
          cantidad: toSafeNumber(activo.cantidad, 0) || 1,
          _indices: [idx],
          _clave: clave,
        });
        return mapa;
      }

      mapa.set(clave, {
        ...existente,
        cantidad: toSafeNumber(existente.cantidad, 0) + (toSafeNumber(activo.cantidad, 0) || 1),
        _indices: [...(existente._indices || []), idx],
      });

      return mapa;
    }, new Map<string, (ActivoFactura & { _indices?: number[]; _clave?: string })>()).values()
  );

  const abrirModalSeries = (activoAgrupado: ActivoFactura & { _indices?: number[]; _clave?: string }) => {
    const indices = activoAgrupado._indices || [];
    const seriesActuales = indices.map((idx) => activosFactura[idx]?.numero_serie_af || '');

    setActivoSerieEnEdicion({
      clave: activoAgrupado._clave || `${activoAgrupado.nombre_af}-${Date.now()}`,
      nombre_af: activoAgrupado.nombre_af,
      indices,
    });
    setSeriesEditables(seriesActuales);
    setIsSeriesModalOpen(true);
  };

  const cerrarModalSeries = () => {
    setIsSeriesModalOpen(false);
    setSeriesEditables([]);
    setActivoSerieEnEdicion(null);
  };

  const guardarSeries = () => {
    if (!activoSerieEnEdicion) {
      return;
    }

    const seriesLimpias = seriesEditables.map((serie) => serie.trim());
    const seriesVacias = seriesLimpias.some((serie) => !serie);

    if (seriesVacias) {
      Swal.fire({
        icon: 'warning',
        title: 'Series incompletas',
        text: 'Todos los números de serie son obligatorios.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const seriesUnicas = new Set(seriesLimpias);

    if (seriesUnicas.size !== seriesLimpias.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Series duplicadas',
        text: 'No se permiten números de serie repetidos dentro del mismo activo.',
        confirmButtonText: 'OK'
      });
      return;
    }

    setActivosFactura((prev) => {
      const actualizados = [...prev];

      activoSerieEnEdicion.indices.forEach((indiceActivo, posicionSerie) => {
        if (!actualizados[indiceActivo]) {
          return;
        }

        actualizados[indiceActivo] = {
          ...actualizados[indiceActivo],
          numero_serie_af: seriesLimpias[posicionSerie] || ''
        };
      });

      return actualizados;
    });

    cerrarModalSeries();
  };

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

  const obtenerResumenActivosActuales = () => {
    return activosFactura.map((activo) => ({
      nombre_af: activo.nombre_af,
      marca_af: activo.marca_af,
      modelo_af: activo.modelo_af,
      cantidad: toSafeNumber(activo.cantidad, 0),
      precio_unitario: toSafeNumber(activo.precio_unitario_af, 0),
      total_linea: toSafeNumber(activo.cantidad, 0) * toSafeNumber(activo.precio_unitario_af, 0),
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
      <div class="recommendationPanel recommendationPanel--raw">
        <p class="recommendationPanel__title"><strong>${escapeHtml(title)}</strong></p>
        <pre class="recommendationPanel__pre">${safeText}</pre>
      </div>
    `;
  };

  const renderWebSearchMetaHtml = (
    webSearch?: {
      requested: boolean;
      attempted: boolean;
      used: boolean;
      tool_type?: string | null;
      disabled_reason?: string | null;
      sources?: Array<{ title: string; url: string }>;
    },
    modelUsed?: string
  ) => {
    if (!webSearch) return '';

    const modelLine = modelUsed ? `<p class="recommendationPanel__line"><strong>Modelo:</strong> ${escapeHtml(modelUsed)}</p>` : '';
    const toolLine = webSearch.tool_type
      ? `<p class="recommendationPanel__line"><strong>Tool:</strong> ${escapeHtml(webSearch.tool_type)}</p>`
      : '';

    const statusLine = webSearch.used
      ? '<p class="recommendationPanel__line"><strong>Búsqueda web:</strong> utilizada correctamente.</p>'
      : webSearch.requested
        ? `<p class="recommendationPanel__line"><strong>Búsqueda web:</strong> no confirmada.${webSearch.disabled_reason ? ` Motivo: ${escapeHtml(webSearch.disabled_reason)}` : ''}</p>`
        : '<p class="recommendationPanel__line"><strong>Búsqueda web:</strong> desactivada.</p>';

    const sources = Array.isArray(webSearch.sources) ? webSearch.sources : [];
    const sourcesHtml = sources.length
      ? `
        <hr class="recommendationPanel__divider" />
        <p class="recommendationPanel__title"><strong>Fuentes</strong></p>
        ${sources
    .map((source) => {
      const safeUrl = /^https?:\/\//i.test(source.url) ? source.url : '';
      if (!safeUrl) return '';

      return `<p class="recommendationPanel__line"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title || safeUrl)}</a></p>`;
    })
    .join('')}
      `
      : '';

    return `
      <div class="recommendationPanel recommendationPanel--raw">
        ${modelLine}
        ${toolLine}
        ${statusLine}
        ${sourcesHtml}
      </div>
    `;
  };

  // Extrae y muestra annotations (url_citation) si existen en el JSON de OpenAI
  const renderOpenAIRecommendationHtml = (analysisText: string, rawResponse?: any): string => {
    const normalizedText = unwrapCodeFence(analysisText);

    let annotations: Array<{ url: string; title?: string }> = [];
    // Buscar annotations en el rawResponse si está disponible
    if (rawResponse && Array.isArray(rawResponse.output)) {
      for (const item of rawResponse.output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (Array.isArray(content.annotations)) {
              for (const ann of content.annotations) {
                if (ann.type === 'url_citation' && ann.url) {
                  annotations.push({ url: ann.url, title: ann.title });
                }
              }
            }
          }
        }
      }
    }

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

      const resumenRaw = parsed.resumen_general;
      const resultados = Array.isArray(parsed.resultados) ? parsed.resultados : [];

      const resumenHtml =
        resumenRaw && typeof resumenRaw === 'object'
          ? Object.entries(resumenRaw)
            .map(([key, value]) => {
              const keyLabel = escapeHtml(key.replace(/_/g, ' '));
              const valueLabel = escapeHtml(value === null ? 'N/D' : String(value));
              return `
                  <div class="recommendationSummary__item">
                    <span class="recommendationSummary__key">${keyLabel}</span>
                    <span class="recommendationSummary__value">${valueLabel}</span>
                  </div>
                `;
            })
            .join('')
          : `<p class="recommendationSummary__text">${escapeHtml(String(resumenRaw || 'Sin resumen disponible.'))}</p>`;

      const resultadosHtml = resultados.length
        ? resultados
          .map((item) => {
            const activoRaw = item.activo;
            const activoObj = activoRaw && typeof activoRaw === 'object' ? activoRaw as Record<string, unknown> : null;

            const nombreActivo = activoObj
              ? escapeHtml(String(activoObj.nombre ?? activoObj.nombre_af ?? 'Activo'))
              : escapeHtml(typeof activoRaw === 'string' ? activoRaw : 'Activo');

            const marca = activoObj ? escapeHtml(String(activoObj.marca ?? activoObj.marca_af ?? 'N/D')) : 'N/D';
            const modelo = activoObj ? escapeHtml(String(activoObj.modelo ?? activoObj.modelo_af ?? 'N/D')) : 'N/D';

            const opcion = escapeHtml(item.opcion_mas_barata || 'Sin opción específica');
            const precioActual = toSafeNumber(
              item.precio_actual,
              0);
            const precioRef = toSafeNumber(item.precio_referencia, 0);
            const ahorro = toSafeNumber(item.ahorro_estimado, 0);
            const notas = escapeHtml(item.notas || '');
            const rawUrl = (item.url || '').trim();
            const safeUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : '';
            const urlHtml = safeUrl
              ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Ver opción</a>`
              : '<span>URL no disponible</span>';

            return `
                <div class="recommendationCard">
                  <p class="recommendationCard__title"><strong>${nombreActivo}</strong></p>
                  <p class="recommendationCard__meta">Marca: ${marca} | Modelo: ${modelo}</p>
                  <p class="recommendationCard__line">Precio actual: ${formatPeso(precioActual)}</p>
                  <p class="recommendationCard__line">Opción sugerida: ${opcion}</p>
                  <p class="recommendationCard__line">Precio referencia: ${formatPeso(precioRef)} | Ahorro estimado: ${formatPeso(ahorro)}</p>
                  <p class="recommendationCard__line">${urlHtml}</p>
                  ${notas ? `<p class="recommendationCard__notes">Notas: ${notas}</p>` : ''}
                </div>
              `;
          })
          .join('')
        : '<p class="recommendationPanel__empty">No se recibieron resultados estructurados.</p>';

      const annotationsHtml = annotations.length
        ? `
          <hr class="recommendationPanel__divider" />
          <p class="recommendationPanel__title"><strong>Fuentes citadas</strong></p>
          ${annotations
            .map(
              (ann) =>
                `<p class="recommendationPanel__line"><a href="${escapeHtml(ann.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ann.title || ann.url)}</a></p>`
            )
            .join('')}
        `
        : '';

      return `
        <div class="recommendationPanel">
          <p class="recommendationPanel__title"><strong>Resumen</strong></p>
          <div class="recommendationSummary">${resumenHtml}</div>
          <hr class="recommendationPanel__divider" />
          ${resultadosHtml}
          ${annotationsHtml}
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
          use_web_search: true,
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
          html: `
            ${renderWebSearchMetaHtml(openAITestResult.data.web_search, openAITestResult.data.model_used)}
            ${renderOpenAIRecommendationHtml(analysisText, openAITestResult.data.raw_response)}
          `,
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
        const precioUnitario = toSafeNumber(activo.precio_unitario_af, 0);
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
        const actual = toSafeNumber(activo.precio_unitario_af, 0);
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
            <div class="mlRecommendationItem">
              <strong>#${index + 1}</strong> ${contenido}
            </div>
          `;
        })
        .join('');

      await Swal.fire({
        icon: 'info',
        title: 'Recomendación ML (Random Forest)',
        html: `
          <div class="recommendationPanel">
            <p class="recommendationPanel__line"><strong>Modelo:</strong> ${escapeHtml(modelId)}</p>
            <p class="recommendationPanel__line"><strong>Métricas:</strong> ${escapeHtml(resumenMetricas)}</p>
            <hr class="recommendationPanel__divider" />
            ${comparativoHtml || '<p class="recommendationPanel__empty">No se recibieron predicciones para mostrar.</p>'}
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
          precio_unitario_af: activo.precio_unitario_af,
          af_propio: activo.af_propio,
          fecha_registro_af: activo.fecha_registro_af,
          id_estado_af: activo.id_estado_af,
          id_clasificacion: activo.id_clasificacion!,
          descripcion_af: activo.descripcion_af || null,
          observaciones_af: activo.observaciones_af || null,

          // Datos de la relación factura-activo
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
            <h2> <FaBoxesPacking className='activosFactura' />  Activos Fijos Asociados ({totalActivosFisicos}) </h2>
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
                  <th id='th_NoSerie'>Números de Serie</th>
                  <th id='th_Cantidad'>Cantidad </th>
                  <th>Clasificación</th>
                  <th id='th_PrecioUnitario'>Precio Unitario</th>
                  <th>Total  </th>
                </tr>
              </thead>

              <tbody>
                {activosFacturaAgrupados.length > 0 ? (
                  activosFacturaAgrupados.map((activo, index) => (
                    <tr key={activo.id_activo_fijo || index}>
                      <td>{activo.nombre_af}</td>
                      <td>
                        {activo.codigo_lote
                          ? `${activo.codigo_lote} (${activo.lote_afconsecutivo || '-'} / ${activo.lote_total || '-'})`
                          : 'Pendiente'}
                      </td>
                      <td id='td_NoSerie'>
                        <button
                          type='button'
                          className='btnEditNoSeries'
                          onClick={() => abrirModalSeries(activo)}
                        >
                          Editar ({(activo as { _indices?: number[] })._indices?.length || 0})
                        </button>


                      </td>

                      <td id='td_Cantidad'>{activo.cantidad}</td>

                      <td id='td_ClasificacionAF'>{clasificacionActivoFijo.map((clasificacionAF) => (
                        <div key={clasificacionAF.id_clasificacion} className='divClasificacionAF'>
                          {activo.id_clasificacion === clasificacionAF.id_clasificacion ? clasificacionAF.nombre_clasificacion : ''}
                        </div>
                      ))}</td>

                      <td id='td_PrecioUnitario'> {formatPeso(activo.precio_unitario_af)}</td>
                      <td>{formatPeso(toSafeNumber(activo.cantidad, 0) * toSafeNumber(activo.precio_unitario_af, 0))}</td>

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

        {isSeriesModalOpen && activoSerieEnEdicion && (
          <div className='serieModalOverlay'>
            <div className='serieModal'>
              <h3 className='serieModalTitle'>Números de Serie</h3>
              <p className='serieModalSubTitle'>
                {activoSerieEnEdicion.nombre_af} ({activoSerieEnEdicion.indices.length === 1 ? '1 activo fijo' : `${activoSerieEnEdicion.indices.length} activos fijos`})
              </p>

              <div className='serieModalGrid'>
                {seriesEditables.map((serie, idx) => (
                  <label key={`${activoSerieEnEdicion.clave}-${idx}`} className='serieModalLabel'>
                    Número de Serie #{idx + 1}
                    <input
                      type='text'
                      value={serie}
                      onChange={(e) => {
                        const nuevaLista = [...seriesEditables];
                        nuevaLista[idx] = e.target.value;
                        setSeriesEditables(nuevaLista);
                      }}
                      placeholder={`Número de serie ${idx + 1}`}
                      className='serieModalInput'
                    />
                  </label>
                ))}
              </div>

              <div className='serieModalActions'>
                <ModalButtons
                  buttons={[
                    {
                      text: 'Guardar',
                      type: 'submit',
                      className: 'button_addedit',
                      onClick: guardarSeries
                    },
                    {
                      text: 'Cancelar',
                      type: 'button',
                      className: 'button_close',
                      onClick: cerrarModalSeries
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        )}

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
