import React, { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { getTiposFacturas, updateFactura, getFacturas, getActivosFactura } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';

// Components
import { SiGooglemessages } from 'react-icons/si';
import AsignacionesAF from './AsignacionesAF';

import '@styles/02_Almacenes/AlmacenGeneral/Facturas/AddFactura.css'

import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { getMovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import AddActivosFactura from './AddActivosFactura';
import { ActivoFactura, ActivoAgrupado, MovimientosActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { FacturasAF, ActivoFacturaInput } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { formatDateHorasToBackend } from '@/utils/dateFormat';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useFacturaCalculos } from '@/hooks/useFacturaCalculos';
import { useSeriesAgrupadas } from '@/hooks/useSeriesAgrupadas';
import {
  validateFacturaId,
  validateNumeroFactura,
  validateSeriesRequeridas,
  validateResponsablesRequeridos,
  validateUbicacionesRequeridas,
  validateTiposMovimientoRequeridos,
  validateSeriesActivos,
} from '@/utils/validators';
import FacturaDatosGenerales from './subcomponents/FacturaDatosGenerales';
import FacturaDatosPago from './subcomponents/FacturaDatosPago';
import FacturaTotales from './subcomponents/FacturaTotales';
import TablaActivosFactura from './subcomponents/TablaActivosFactura';

interface EditFacturaProps {
  onClose: () => void;
  onSubmit?: () => void;
  facturaToEdit: FacturasAF | null;
}

const EditFactura: React.FC<EditFacturaProps> = ({ onClose, onSubmit, facturaToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados para los campos del formulario de EditFactura
  const [proveedorFactura, setProveedorFactura] = useState<number>(0);
  const [numeroFactura, setNumeroFactura] = useState<string>('');
  const [añoFactura, setAñoFactura] = useState<number>();

  const [tipoFactura, setTipoFactura] = useState<number>(0);
  const [fechaRecepcion, setFechaRecepcion] = useState<string>('');
  const [formaPago, setFormaPago] = useState<number>(0);
  const [tipoMoneda, setTipoMoneda] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  const [subTotalFactura, setSubTotalFactura] = useState<number>(0);
  const [descuentoFactura, setDescuentoFactura] = useState<number>(0);
  const [fleteFactura, setFleteFactura] = useState<number>(0);
  const [ivaFactura, setIvaFactura] = useState<number>(0.16);
  const [totalFactura, setTotalFactura] = useState<number>(0);

  const [isAsignacionesOpen, setIsAsignacionesOpen] = useState(false);
  const [isModalAddActivosFacturaOpen, setIsModalAddActivosFacturaOpen] = useState(false);

  const [activosEditables, setActivosEditables] = useState<ActivoFactura[]>([]);
  const [activoSerieEnEdicion, setActivoSerieEnEdicion] = useState<ActivoAgrupado | null>(null);

  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const tiposFactura = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);
  const clasificacionActivoFijo = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);

  const [activosFactura, setActivosFactura] = useState<ActivoFactura[]>([]);

  // Extraer año y numero de factura -
  useEffect(() => {
    if (facturaToEdit) {
      const año = facturaToEdit.num_factura.split('-').slice(1, 2)[0];
      setAñoFactura(Number(año));

      const noFactura = facturaToEdit.num_factura.split('-').slice(2, 3)[0];
      setNumeroFactura(noFactura);


    }
  }, [facturaToEdit]);



  // Agrupación solo visual para la tabla de resumen (useSeriesAgrupadas)
  const activosFacturaAgrupados = useSeriesAgrupadas(activosFactura);

  const abrirModalAsignacionSeries = (activoAgrupado: ActivoFactura & { _indices?: number[]; _clave?: string }) => {
    const indices = activoAgrupado._indices || [];
    const activosIndividuales = indices
      .map(indice => activosFactura[indice])
      .filter((activo): activo is ActivoFactura => !!activo);

    setActivoSerieEnEdicion({
      clave: activoAgrupado._clave || `${activoAgrupado.nombre_af}-${Date.now()}`,
      nombre_af: activoAgrupado.nombre_af,

      indices,
    });
    setActivosEditables(activosIndividuales);
    setIsAsignacionesOpen(true);
  };

  const cerrarModalAsignacionSeries = () => {
    setIsAsignacionesOpen(false);
    setActivosEditables([]);
    setActivoSerieEnEdicion(null);
  };

  const guardarSeries = () => {
    if (!activoSerieEnEdicion) {
      return;
    }

    const seriesLimpias = activosEditables.map((activo) => (activo.numero_serie_af || '').trim());

    const errorValidacion = validateSeriesActivos(activosEditables);

    if (errorValidacion) {
      Swal.fire({
        icon: 'warning',
        title: errorValidacion.title,
        text: errorValidacion.text,
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
          numero_serie_af: seriesLimpias[posicionSerie] || '',
          id_responsable_actual: activosEditables[posicionSerie]?.id_responsable_actual || null,
          id_ubicacion_actual: activosEditables[posicionSerie]?.id_ubicacion_actual || null,
          id_tipo_movimiento: activosEditables[posicionSerie]?.id_tipo_movimiento || null,
        };
      });

      return actualizados;
    });

    cerrarModalAsignacionSeries();
  };

  // Cálculo de subtotal, IVA, flete y totales (useFacturaCalculos)
  const {
    subtotal,
    subtotalConDescuento,
    subtotalConFlete,
    baseGravable,
    ivaCalculado,
    totalFinal,
  } = useFacturaCalculos(activosFactura, descuentoFactura, fleteFactura);

  const obtenerUltimoMovimientoPorActivo = (movimientos: MovimientosActivosFijos[]) => {
    const ultimoPorActivo = new Map<number, MovimientosActivosFijos>();

    movimientos.forEach((movimiento) => {
      const idActivo = movimiento.id_activo_fijo;

      if (!idActivo) {
        return;
      }

      const existente = ultimoPorActivo.get(idActivo);
      const idMovimientoActual = movimiento.id_movimientoAF ?? 0;
      const idMovimientoPrevio = existente?.id_movimientoAF ?? 0;

      if (!existente || idMovimientoActual >= idMovimientoPrevio) {
        ultimoPorActivo.set(idActivo, movimiento);
      }
    });

    return ultimoPorActivo;
  };

  // Inicializar datos del formulario con la factura a editar
  useEffect(() => {
    const cargarFacturaConAsignaciones = async () => {
      if (!facturaToEdit?.id_factura) {
        return;
      }

      setProveedorFactura(facturaToEdit.id_proveedor || 0);
      setTipoFactura(facturaToEdit.id_tipo_factura || 0);
      setFechaRecepcion(facturaToEdit.fecha_fac_recepcion || '');
      setFormaPago(facturaToEdit.id_forma_pago || 0);
      setTipoMoneda(facturaToEdit.id_tipo_moneda || 0);
      setObservaciones(facturaToEdit.observaciones_factura || '');
      setSubTotalFactura(facturaToEdit.subtotal_factura || 0);
      setDescuentoFactura(facturaToEdit.descuento_factura || 0);
      setFleteFactura(facturaToEdit.flete_factura || 0);
      setIvaFactura(facturaToEdit.iva_factura || 0);
      setTotalFactura(facturaToEdit.total_factura || 0);

      try {
        const [activosResponse, movimientosResponse] = await Promise.all([
          dispatch(getActivosFactura(facturaToEdit.id_factura)).unwrap(),
          dispatch(getMovimientosActivosFijos()).unwrap(),
        ]);

        const activosDeFactura = activosResponse.activosFactura || [];
        const ultimoMovimientoPorActivo = obtenerUltimoMovimientoPorActivo(movimientosResponse.movimientosAF || []);

        const activosConAsignacion: ActivoFactura[] = activosDeFactura.map((activo) => {
          const activoBase = activo as Partial<ActivoFactura>;
          const ultimoMovimiento = ultimoMovimientoPorActivo.get(activo.id_activo_fijo);

          return {
            ...activo,
            nombre_af: activo.nombre_af,
            descripcion_af: activoBase.descripcion_af || '',
            modelo_af: activoBase.modelo_af || '',
            marca_af: activoBase.marca_af || '',
            numero_serie_af: activo.numero_serie_af || '',
            costo_unitario_af: activo.costo_unitario_af || 0,
            af_propio: activo.af_propio,
            id_estado_af: activoBase.id_estado_af ?? null,
            id_clasificacion: activo.id_clasificacion ?? null,
            fecha_registro_af: activoBase.fecha_registro_af || '',
            depreciacion_aplicada: activoBase.depreciacion_aplicada || false,
            observaciones_af: activoBase.observaciones_af || activo.observaciones || '',
            cantidad: activo.cantidad ?? 1,
            descuento_af: activo.descuento_af || 0,
            descuento_porcentajeaf: activo.descuento_porcentajeaf || 0,
            id_tipo_movimiento: ultimoMovimiento?.id_tipo_movimiento ?? null,
            motivo_movimiento: ultimoMovimiento?.motivo_movimiento || '',
            fecha_movimiento: ultimoMovimiento?.fecha_movimiento || '',
            id_responsable_anterior: ultimoMovimiento?.id_responsable_anterior ?? null,
            id_responsable_actual: ultimoMovimiento?.id_responsable_actual ?? null,
            id_ubicacion_anterior: ultimoMovimiento?.id_ubicacion_anterior ?? null,
            id_ubicacion_actual: ultimoMovimiento?.id_ubicacion_actual ?? null,
          };
        });

        setActivosFactura(activosConAsignacion);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error al cargar factura con asignaciones:', error);
        }
      }
    };

    cargarFacturaConAsignaciones();
  }, [facturaToEdit, dispatch]);


  // Calcular Subtotal, IVA y Total cada vez que cambien los activos, flete o descuento
  useEffect(() => {
    setSubTotalFactura(subtotal);
    setIvaFactura(ivaCalculado);
    setTotalFactura(totalFinal);
  }, [subtotal, ivaCalculado, totalFinal]);

  // Carga de catálogos con patrón "fetch si vacío" (useCatalogData)
  // Sustituye el useEffect anterior con deps [dispatch] que era un riesgo de refetch.
  useCatalogData(proveedores, () => dispatch(getProveedores()));
  useCatalogData(tiposFactura, () => dispatch(getTiposFacturas()));
  useCatalogData(formasPago, () => dispatch(getFormasPago()));
  useCatalogData(tiposMoneda, () => dispatch(getTiposMoneda()));
  useCatalogData(clasificacionActivoFijo, () => dispatch(getClasificaciones()));

  const openModalAddActivosFactura = () => {
    setIsModalAddActivosFacturaOpen(true);

  };

  const closeModalAddActivosFactura = () => {
    setIsModalAddActivosFacturaOpen(false);
  }

  // Manejar activos seleccionados del modal (solo estado local; se persiste al guardar factura)
  const handleActivosCreados = (nuevosActivosCreados: ActivoFactura[]) => {
    setActivosFactura(nuevosActivosCreados);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorId = validateFacturaId(facturaToEdit?.id_factura);
    if (errorId) {
      Swal.fire({
        icon: 'error',
        title: errorId.title,
        text: errorId.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    const errorNumero = validateNumeroFactura(numeroFactura);
    if (errorNumero) {
      Swal.fire({
        icon: 'warning',
        title: errorNumero.title,
        text: errorNumero.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    const errorSerie = validateSeriesRequeridas(activosFactura);
    if (errorSerie) {
      Swal.fire({
        icon: 'warning',
        title: errorSerie.title,
        text: errorSerie.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    const errorResponsables = validateResponsablesRequeridos(activosFactura);
    if (errorResponsables) {
      Swal.fire({
        icon: 'warning',
        title: errorResponsables.title,
        text: errorResponsables.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    const errorUbicaciones = validateUbicacionesRequeridas(activosFactura);
    if (errorUbicaciones) {
      Swal.fire({
        icon: 'warning',
        title: errorUbicaciones.title,
        text: errorUbicaciones.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    const errorTiposMovimiento = validateTiposMovimientoRequeridos(activosFactura);
    if (errorTiposMovimiento) {
      Swal.fire({
        icon: 'warning',
        title: errorTiposMovimiento.title,
        text: errorTiposMovimiento.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    // Concatenar num_factura
    const numFacturaCompleto = `NOF-${añoFactura}-${numeroFactura}`;

    try {
      // Preparar los datos de la factura
      const facturaActualizada: Partial<FacturasAF> = {
        id_proveedor: proveedorFactura,
        num_factura: numFacturaCompleto,
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
        // Procesar activos para enviar al backend
        activos: activosFactura.length > 0 ? activosFactura.map(activo => {
          const esExistente = !!activo.id_activo_fijo && activo.id_activo_fijo > 0;
          if (esExistente) {
            return {
              id_activo_fijo: activo.id_activo_fijo,
              nombre_af: activo.nombre_af,
              marca_af: activo.marca_af,
              modelo_af: activo.modelo_af,
              numero_serie_af: activo.numero_serie_af,
              costo_unitario_af: activo.costo_unitario_af,
              af_propio: activo.af_propio,
              af_menor: activo.af_menor,
              id_estado_af: activo.id_estado_af,
              fecha_registro_af: activo.fecha_registro_af,
              id_clasificacion: activo.id_clasificacion,
              descripcion_af: activo.descripcion_af,
              observaciones_af: activo.observaciones_af,
              cantidad: activo.cantidad || 1, // Asegurar cantidad
              observaciones: activo.observaciones_af,
              // Convertir fecha_movimiento al formato Y-m-d H:i:s
              fecha_movimiento: activo.fecha_movimiento ? formatDateHorasToBackend(activo.fecha_movimiento) : null,
              id_responsable_actual: activo.id_responsable_actual,
              id_ubicacion_actual: activo.id_ubicacion_actual,
              id_tipo_movimiento: activo.id_tipo_movimiento,
              motivo_asignacion: activo.motivo_movimiento
            } as ActivoFacturaInput; // Asegurar tipo
          } else {
            // Lógica para activos nuevos (si aplica en edición)
            // ... (retornar datos completos para creación de activo nuevo)
            // Asegurar la conversión de fecha_registro_af si se maneja aquí
            const fechaRegistroConvertida = activo.fecha_registro_af ? formatDateHorasToBackend(activo.fecha_registro_af) : null;
            return {
              nombre_af: activo.nombre_af,
              marca_af: activo.marca_af,
              modelo_af: activo.modelo_af,
              numero_serie_af: activo.numero_serie_af,
              costo_unitario_af: activo.costo_unitario_af,
              af_propio: activo.af_propio,
              af_menor: activo.af_menor,
              id_estado_af: activo.id_estado_af,
              fecha_registro_af: fechaRegistroConvertida,
              id_clasificacion: activo.id_clasificacion,
              descripcion_af: activo.descripcion_af,
              observaciones_af: activo.observaciones_af,
              cantidad: activo.cantidad || 1,
              observaciones: activo.observaciones_af,
              fecha_movimiento: activo.fecha_movimiento ? formatDateHorasToBackend(activo.fecha_movimiento) : null,
              id_responsable_actual: activo.id_responsable_actual,
              id_ubicacion_actual: activo.id_ubicacion_actual,
              id_tipo_movimiento: activo.id_tipo_movimiento,
              motivo_asignacion: activo.motivo_movimiento
            } as ActivoFacturaInput;
          }
        }) : undefined // Enviar undefined si no hay activos, no array vacío
      };

      const resultAction = await dispatch(updateFactura({
        id: facturaToEdit!.id_factura!,
        factura: facturaActualizada
      })).unwrap();

      if (resultAction.success) {
        // Actualizar la lista de facturas
        const facturasActualizadas = await dispatch(getFacturas()).unwrap();
        if (facturasActualizadas.success) {
          dispatch(setFacturas(facturasActualizadas.facturas || []));
          Swal.fire({
            icon: 'success',
            title: 'Factura Actualizada',
            text: 'La factura ha sido actualizada exitosamente.',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              if (onSubmit) {
                onSubmit();
              }
            }
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Error al actualizar la factura',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al actualizar factura:', error);
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar la factura. Por favor, inténtalo de nuevo.',
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

        <FacturaDatosGenerales
          tituloId="ID de Factura"
          idFacturaValor={facturaToEdit?.id_factura}
          fechaRecepcion={fechaRecepcion}
          setFechaRecepcion={setFechaRecepcion}
          proveedores={proveedores}
          tiposFactura={tiposFactura}
          proveedorFactura={proveedorFactura}
          setProveedorFactura={setProveedorFactura}
          tipoFactura={tipoFactura}
          setTipoFactura={setTipoFactura}
          añoFactura={añoFactura}
          setAñoFactura={setAñoFactura}
          numeroFactura={numeroFactura}
          setNumeroFactura={setNumeroFactura}
          placeholderAño="Año"
        />

        <FacturaDatosPago
          formaPago={formaPago}
          setFormaPago={setFormaPago}
          tipoMoneda={tipoMoneda}
          setTipoMoneda={setTipoMoneda}
          formasPago={formasPago}
          tiposMoneda={tiposMoneda}
        />

        <TablaActivosFactura
          activosFacturaAgrupados={activosFacturaAgrupados}
          clasificaciones={clasificacionActivoFijo}
          textoBotonActivos=" Editar Activos"
          textoLoteVacio="-"
          onAgregarActivos={openModalAddActivosFactura}
          onEditarAsignaciones={abrirModalAsignacionSeries}
        />

        <FacturaTotales
          subTotalFactura={subTotalFactura}
          setSubTotalFactura={setSubTotalFactura}
          fleteFactura={fleteFactura}
          setFleteFactura={setFleteFactura}
          descuentoFactura={descuentoFactura}
          setDescuentoFactura={setDescuentoFactura}
          ivaFactura={ivaFactura}
          setIvaFactura={setIvaFactura}
          subtotalConFlete={subtotalConFlete}
          subtotalConDescuento={subtotalConDescuento}
          baseGravable={baseGravable}
          totalFinal={totalFinal}
        />

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
              text: 'Actualizar',
              type: 'submit',
              className: 'button_addedit',
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
          factura={facturaToEdit || undefined}

        />
      )}

      {/* Modal para manejar las asignaciones de activos fijos según cantidad y el número de serie */}
      {isAsignacionesOpen && (
        <AsignacionesAF
          isOpen={isAsignacionesOpen}
          onClose={() => setIsAsignacionesOpen(false)}
          onGuardar={guardarSeries}
          onActivosCreados={activosEditables}
          onActivosChange={setActivosEditables}
        />
      )
      }
    </div>
  );
};

export default EditFactura;
