import React, { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

// Facturas
import { getTiposFacturas, addFactura, getFacturas } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';
import AddActivosFactura from './AddActivosFactura';
import AsignacionesAF from './AsignacionesAF';
import { ActivoFactura, ActivoAgrupado } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { FacturasAF, ActivoFacturaInput } from '@/@types/AlmacenGeneralTypes/facturasTypes';

// Icons
import { SiGooglemessages } from 'react-icons/si';

// Components
import { getFechaHoraActual, getAñoActual } from '@/utils/dateFormat';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useFacturaCalculos } from '@/hooks/useFacturaCalculos';
import { useSeriesAgrupadas } from '@/hooks/useSeriesAgrupadas';
import {
  validateFacturaCompleta,
  validateSeriesActivos,
} from '@/utils/validators';
import FacturaDatosGenerales from './subcomponents/FacturaDatosGenerales';
import FacturaDatosPago from './subcomponents/FacturaDatosPago';
import FacturaTotales from './subcomponents/FacturaTotales';
import TablaActivosFactura from './subcomponents/TablaActivosFactura';

// Store
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';



import '@styles/02_Almacenes/AlmacenGeneral/Facturas/AddFactura.css'

interface AddFacturaProps {
  onClose?: () => void;
  onSubmit?: (facturaId?: number) => void;
}

const AddFactura: React.FC<AddFacturaProps> = ({ onClose, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados para los campos del formulario de AddFactura
  const [proveedorFactura, setProveedorFactura] = useState<number>(0);
  const [numeroFactura, setNumeroFactura] = useState<string>('');
  const [añoFactura, setAñoFactura] = useState<number>(getAñoActual());
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

  //
  //    SoftComputing - OpenAI
  //


  const [isAsignacionesOpen, setIsAsignacionesOpen] = useState(false);
  const [isModalAddActivosFacturaOpen, setIsModalAddActivosFacturaOpen] = useState(false);

  const [activosEditables, setActivosEditables] = useState<ActivoFactura[]>([]);
  const [activoSerieEnEdicion, setActivoSerieEnEdicion] = useState<ActivoAgrupado | null>(null);

  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);

  const proveedoresOrderby = React.useMemo(() => {
    if (!proveedores) return [];
    return [...proveedores].sort((a, b) => a.nombre_proveedor.localeCompare(b.nombre_proveedor));
  }, [proveedores]);

  const tiposFactura = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);
  const clasificacionActivoFijo = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);



  const ultimoId = React.useMemo(() => (
    facturas.length > 0
      ? Math.max(...facturas.map(factura => Number(factura.id_factura)))
      : 0
  ), [facturas]);

  const getUltimoID = () => {
    const nuevoId = ultimoId + 1;
    return nuevoId;
  }

  // Activos asociados a la factura
  const [activosFactura, setActivosFactura] = useState<ActivoFactura[]>([]);

  // Cálculo de subtotal, IVA, flete y totales (useFacturaCalculos)
  const {
    subtotal,
    totalActivosFisicos,
    subtotalConDescuento,
    subtotalConFlete,
    baseGravable,
    ivaCalculado,
    totalFinal,
  } = useFacturaCalculos(activosFactura, descuentoFactura, fleteFactura);

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

  // Calcular Subtotal, IVA y Total cada vez que cambien los activos, flete o descuento
  useEffect(() => {
    setSubTotalFactura(subtotal);
    setIvaFactura(ivaCalculado);
    setTotalFactura(totalFinal);
  }, [subtotal, ivaCalculado, totalFinal]);

  // Carga de catálogos con patrón "fetch si vacío" (useCatalogData)
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

    const errorValidacion = validateFacturaCompleta(activosFactura, numeroFactura);

    if (errorValidacion) {
      Swal.fire({
        icon: 'warning',
        title: errorValidacion.title,
        text: errorValidacion.text,
        confirmButtonText: 'OK',
      });
      return;
    }

    const numeroFacturaTrim = numeroFactura.trim();

    // Concatenar num_factura
    const numFacturaCompleto = `NOF-${añoFactura}-${numeroFactura}`;

    try {
      // Preparar los datos de la factura
      const nuevaFactura: FacturasAF = {
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

        // Incluir activos en el objeto de factura con todos los datos necesarios
        activos: activosFactura.length > 0 ? activosFactura.map(activo => ({
          // Datos del activo fijo completos
          nombre_af: activo.nombre_af,
          marca_af: activo.marca_af,
          modelo_af: activo.modelo_af,
          numero_serie_af: activo.numero_serie_af,
          costo_unitario_af: activo.costo_unitario_af,
          af_propio: activo.af_propio,
          af_menor: activo.af_menor,
          fecha_registro_af: activo.fecha_registro_af,
          id_estado_af: activo.id_estado_af,
          id_clasificacion: activo.id_clasificacion!,
          descripcion_af: activo.descripcion_af || null,
          observaciones_af: activo.observaciones_af || null,

          // Datos de la relación factura-activo
          costo_unitario: activo.costo_unitario_af,
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
        // En caso de error volver a datos de factura para no ingresar todo de nuevo

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

        <FacturaDatosGenerales
          tituloId='   ID de Factura '
          idFacturaValor={getUltimoID()}
          fechaRecepcion={fechaRecepcion}
          setFechaRecepcion={setFechaRecepcion}
          proveedores={proveedoresOrderby}
          tiposFactura={tiposFactura}
          proveedorFactura={proveedorFactura}
          setProveedorFactura={setProveedorFactura}
          tipoFactura={tipoFactura}
          setTipoFactura={setTipoFactura}
          añoFactura={añoFactura}
          setAñoFactura={setAñoFactura}
          numeroFactura={numeroFactura}
          setNumeroFactura={setNumeroFactura}
          placeholderAño="Año de Factura"
          uppercaseNumero
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
          totalActivosFisicos={totalActivosFisicos}
          mostrarTotalActivos
          textoBotonActivos={activosFacturaAgrupados.length > 0 ? 'Editar Activos' : 'Agregar Activos'}
          textoLoteVacio="Pendiente"
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

      {/* Modal para manejar las asignaciones de activos fijos según cantidad y el número de serie */}
      {isAsignacionesOpen && (
        <AsignacionesAF
          isOpen={isAsignacionesOpen}
          onClose={cerrarModalAsignacionSeries}
          onGuardar={guardarSeries}
          onActivosCreados={activosEditables}
          onActivosChange={setActivosEditables}
        />
      )
      }

    </div>
  );
};

export default AddFactura;
