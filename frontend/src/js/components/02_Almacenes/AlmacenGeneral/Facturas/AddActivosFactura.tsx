import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

// Components
import AddActivoFijo from '../ActivosFijos/CRUD/AddActivoFijo';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Types
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Utils
import { formatPeso } from '@/utils/numbersFormat';

// Icons
import { FaList, FaPlus, FaTrash } from 'react-icons/fa';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Facturas/modalAddActivosFactura.css';

interface AddActivosFacturaProps {
  isOpen: boolean;
  onClose: () => void;
  onActivosCreados?: (activos: ActivoFactura[]) => void;
  activosExistentes?: ActivoFactura[];
}

Modal.setAppElement('#root');

const AddActivosFactura: React.FC<AddActivosFacturaProps> = ({
  isOpen,
  onClose,
  onActivosCreados,
  activosExistentes = []
}) => {

  console.log('ADDActivosFactura')



  // Estados locales
  const [activosAgregados, setActivosSeleccionados] = useState<ActivoFactura[]>([]);
  const [seriesPorActivo, setSeriesPorActivo] = useState<Record<string, string[]>>({});
  const [isAddActivoFijoOpen, setIsAddActivoFijoOpen] = useState(false);
  const [busquedaSeleccionados, setBusquedaSeleccionados] = useState<string>('');
  const tempSequenceRef = useRef<number>(0);

  const obtenerClaveAgrupacion = (activo: ActivoFactura) => [
    activo.nombre_af || '',
    activo.id_clasificacion || 0,
    Number(activo.precio_unitario_af || 0),
    (activo.observaciones_af || '').trim(),
    activo.codigo_lote || '',
  ].join('|');

  const obtenerClaveActivo = (activo: ActivoFactura) =>
    activo.codigo_unico || `AF-${activo.id_activo_fijo || activo.nombre_af}`;

  type ActivoFacturaAgrupado = ActivoFactura & {
    items?: ActivoFactura[];
  };

  const normalizarCantidad = (valor: number) => {
    if (!Number.isFinite(valor) || valor < 1) {
      return 1;
    }

    return Math.floor(valor);
  };

  const extraerCodigos = (codigo?: string): string[] => {
    const limpio = (codigo || '').trim();

    if (!limpio) {
      return [];
    }

    if (limpio.startsWith('MÚLTIPLES (') && limpio.endsWith(')')) {
      const contenido = limpio.slice('MÚLTIPLES ('.length, -1);
      return contenido
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [limpio];
  };

  const construirCodigoMultiples = (codigoExistente?: string, codigoNuevo?: string) => {
    const codigos = [...extraerCodigos(codigoExistente), ...extraerCodigos(codigoNuevo)];
    const unicos = Array.from(new Set(codigos));

    if (unicos.length === 0) {
      return 'MÚLTIPLES';
    }

    return `MÚLTIPLES (${unicos.join(', ')})`;
  };

  const crearSeriesIniciales = (activo: ActivoFactura, cantidad: number) => {
    const series = Array.from({ length: cantidad }, (_, i) =>
      i === 0 ? (activo.numero_serie_af || '').trim() : ''
    );

    return series;
  };

  const ajustarArregloSeries = (seriesActuales: string[], nuevaCantidad: number) => {
    const seriesAjustadas = [...seriesActuales].slice(0, nuevaCantidad);

    while (seriesAjustadas.length < nuevaCantidad) {
      seriesAjustadas.push('');
    }

    return seriesAjustadas;
  };

  // Store
  useEffect(() => {
    if (isOpen) {
      // Inicializar con los activos existentes de la factura
      const { activosAgrupados, seriesPorGrupo } = agruparActivos(activosExistentes);
      setActivosSeleccionados(activosAgrupados);

      const seriesIniciales: Record<string, string[]> = {};

      activosAgrupados.forEach((activo) => {
        const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
        const claveGrupo = obtenerClaveAgrupacion(activo);
        const seriesDelGrupo = seriesPorGrupo[claveGrupo] || [];
        seriesIniciales[obtenerClaveActivo(activo)] = ajustarArregloSeries(seriesDelGrupo, cantidad);
      });

      setSeriesPorActivo(seriesIniciales);
    }
  }, [isOpen, activosExistentes]);

  // Función para agrupar activos 
  const agruparActivos = (activos: ActivoFactura[]): {
    activosAgrupados: ActivoFacturaAgrupado[];
    seriesPorGrupo: Record<string, string[]>;
  } => {
    const mapa = new Map<string, ActivoFacturaAgrupado>();
    const seriesPorGrupo: Record<string, string[]> = {};

    activos.forEach((activo) => {
      const clave = obtenerClaveAgrupacion(activo);
      const serie = (activo.numero_serie_af || '').trim();

      if (!seriesPorGrupo[clave]) {
        seriesPorGrupo[clave] = [];
      }

      if (serie) {
        seriesPorGrupo[clave].push(serie);
      }

      const existente = mapa.get(clave);

      if (!existente) {
        mapa.set(clave, {
          ...activo,
          cantidad: normalizarCantidad(Number(activo.cantidad || 1)),
          codigo_unico: activo.codigo_unico || `GRP-${mapa.size + 1}`,
          items: [{ ...activo }],
        });
        return;
      }

      mapa.set(clave, {
        ...existente,
        cantidad: Number(existente.cantidad || 0) + Number(activo.cantidad || 0),
        codigo_unico: construirCodigoMultiples(existente.codigo_unico, activo.codigo_unico),
        items: [...(existente.items || []), { ...activo }],
      });
    });

    const activosAgrupados = Array.from(mapa.values());

    activosAgrupados.forEach((activo) => {
      const clave = obtenerClaveAgrupacion(activo);
      const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
      seriesPorGrupo[clave] = ajustarArregloSeries(seriesPorGrupo[clave] || [], cantidad);
    });

    return { activosAgrupados, seriesPorGrupo };
  };

  // Generar identificadores temporales únicos para activos nuevos
  const generarIdentificadoresTemporales = () => {
    let tempId = 0;
    let tempCodigoUnico = '';

    do {
      tempSequenceRef.current += 1;
      const seed = `${Date.now()}-${tempSequenceRef.current}`;
      tempId = -Number(`${Date.now()}${tempSequenceRef.current}`.slice(-12));
      tempCodigoUnico = `TEMP-${seed}`;
    } while (
      activosAgregados.some(
        activo => activo.id_activo_fijo === tempId || activo.codigo_unico === tempCodigoUnico
      )
    );

    return { tempId, tempCodigoUnico };
  };

  // Filtros de búsqueda (memorizado)
  const activosSeleccionadosFiltrados = React.useMemo(() => activosAgregados.filter(activo => {
    if (!activo || !activo.nombre_af) return false;
    const searchTerm = busquedaSeleccionados.toLowerCase();
    return activo.nombre_af.toLowerCase().includes(searchTerm) ||
      (activo.codigo_unico && activo.codigo_unico.toLowerCase().includes(searchTerm)) ||
      (activo.marca_af && activo.marca_af.toLowerCase().includes(searchTerm)) ||
      (activo.modelo_af && activo.modelo_af.toLowerCase().includes(searchTerm));
  }), [activosAgregados, busquedaSeleccionados]);

  // Remover activo de la lista seleccionada
  const handleRemoverActivo = (codigoUnico: string) => {
    const activoARemover = activosAgregados.find(activo => activo.codigo_unico === codigoUnico);

    setActivosSeleccionados(activosAgregados.filter(activo => activo.codigo_unico !== codigoUnico));

    if (activoARemover) {
      const clave = obtenerClaveActivo(activoARemover);
      setSeriesPorActivo((prev) => {
        const actualizado = { ...prev };
        delete actualizado[clave];
        return actualizado;
      });
    }
  };

  // Actualizar cantidad o precio de activo seleccionado
  const handleActualizarActivo = (
    codigoUnico: string,
    campo: 'cantidad' | 'precio_unitario_af',
    valor: number
  ) => {
    const activoAActualizar = activosAgregados.find(activo => activo.codigo_unico === codigoUnico);

    if (!activoAActualizar) {
      return;
    }

    if (campo === 'cantidad') {
      const nuevaCantidad = normalizarCantidad(valor);
      const clave = obtenerClaveActivo(activoAActualizar);

      setSeriesPorActivo((prev) => {
        const seriesActuales = prev[clave] || crearSeriesIniciales(activoAActualizar, 1);

        return {
          ...prev,
          [clave]: ajustarArregloSeries(seriesActuales, nuevaCantidad)
        };
      });
    }

    setActivosSeleccionados(
      activosAgregados.map(activo =>
        activo.codigo_unico === codigoUnico
          ? {
            ...activo,
            [campo]: campo === 'cantidad' ? normalizarCantidad(valor) : Number(valor || 0)
          }
          : activo
      )
    );
  };

  const handleSerieChange = (activo: ActivoFactura, index: number, valor: string) => {
    const clave = obtenerClaveActivo(activo);

    setSeriesPorActivo((prev) => {
      const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
      const base = prev[clave] || crearSeriesIniciales(activo, cantidad);
      const ajustado = ajustarArregloSeries(base, cantidad);
      ajustado[index] = valor;

      return {
        ...prev,
        [clave]: ajustado
      };
    });
  };

  // Manejar cierre del modal AddActivoFijo
  const handleAddActivoFijoClose = () => {
    setIsAddActivoFijoOpen(false);
  };

  // Manejar cuando se recolectan datos de un nuevo activo (sin crear en BD aún)
  const handleAFToFactura = (ActivoFijoFactura: ActivoFactura) => {
    console.log('Datos del nuevo activo recibido en AddActivosFactura:', ActivoFijoFactura);

    // Generar identificadores temporales únicos
    const { tempId, tempCodigoUnico } = generarIdentificadoresTemporales();

    // Agregar los datos temporalmente a la selección
    const nuevoActivoFactura: ActivoFactura = {
      ...ActivoFijoFactura,
      id_activo_fijo: tempId, // ID temporal para manejo en UI
      codigo_unico: tempCodigoUnico, // Código temporal único para manejo en UI
      cantidad: 1,
      precio_unitario_af: ActivoFijoFactura.precio_unitario_af || 0,
      descuento_af: 0,
      descuento_porcentajeaf: 0,
      id_tipo_movimiento: ActivoFijoFactura.id_tipo_movimiento || 0,
      motivo_movimiento: ActivoFijoFactura.motivo_movimiento || 'Creación desde factura',
      fecha_movimiento: ActivoFijoFactura.fecha_movimiento || '',
      id_responsable_anterior: 0,
      id_responsable_actual: ActivoFijoFactura.id_responsable_actual || 0,
      id_ubicacion_anterior: 0,
      id_ubicacion_actual: ActivoFijoFactura.id_ubicacion_actual || 0,
    };

    setActivosSeleccionados(prev => [...prev, nuevoActivoFactura]);
    setSeriesPorActivo((prev) => ({
      ...prev,
      [obtenerClaveActivo(nuevoActivoFactura)]: crearSeriesIniciales(nuevoActivoFactura, 1)
    }));
  };


  // Confirmar selección
  const handleConfirmar = async () => {
    if (activosAgregados.length === 0) {
      // Cerrar modal antes de mostrar alerta

      onClose();
      Swal.fire({
        icon: 'warning',
        title: 'Sin activos en la factura',
        text: 'Debe agregar al menos un activo para continuar.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const erroresSeries: string[] = [];

    // Expandir cada línea por cantidad para crear activos individuales con serie propia
    const activosCopia = activosAgregados.flatMap((activo) => {
      const activoAgrupado = activo as ActivoFacturaAgrupado;
      const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
      const clave = obtenerClaveActivo(activo);
      const seriesCapturadas = ajustarArregloSeries(seriesPorActivo[clave] || [], cantidad)
        .map((serie) => (serie || '').trim());

      const itemsBase = (activoAgrupado.items || []).slice(0, cantidad);
      const itemsNormalizados = [...itemsBase];

      while (itemsNormalizados.length < cantidad) {
        itemsNormalizados.push({
          ...activo,
          cantidad: 1,
        });
      }

      const seriesLlenas = seriesCapturadas.filter((serie) => !!serie);
      const seriesUnicas = new Set(seriesLlenas);

      if (seriesLlenas.length !== cantidad) {
        erroresSeries.push(`Completa ${cantidad} serie(s) para "${activo.nombre_af}".`);
      }

      if (seriesUnicas.size !== seriesLlenas.length) {
        erroresSeries.push(`Las series de "${activo.nombre_af}" no pueden repetirse.`);
      }

      return itemsNormalizados.map((itemBase, index) => ({
        ...itemBase,
        cantidad: 1,
        numero_serie_af: seriesCapturadas[index] || itemBase.numero_serie_af || '',
      }));
    });

    if (erroresSeries.length > 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Series incompletas o duplicadas',
        html: `<div style="text-align: left;">${erroresSeries.map((err) => `<p>• ${err}</p>`).join('')}</div>`,
        confirmButtonText: 'Revisar'
      });
      return;
    }

    // Calcular total de unidades físicas
    const totalUnidades = activosAgregados.reduce((total, activo) => total + activo.cantidad, 0);
    const cantidadTipos = activosAgregados.length;

    console.log('ActivosCopia', activosCopia)


    // Cerrar el modal PRIMERO para que SweetAlert aparezca encima
    onClose();

    // Esperar un tick para que el modal se cierre completamente
    await new Promise(resolve => setTimeout(resolve, 100));


    // Mostrar confirmación antes de proceder
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar activos para la factura?',
      html: `
        <div style="text-align: left; margin: 20px;">
          <p><strong>Se agregarán a la factura:</strong></p>
          <ul style="margin: 10px 0;">
            <li>${cantidadTipos} tipo(s) de activos diferentes</li>
            <li>${totalUnidades} unidades físicas totales</li>
          </ul>
          <p style="margin-top: 15px; color: #666; font-size: 0.9em;">
            <strong>Nota:</strong> Los activos serán creados en la base de datos cuando guardes la factura completa.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      onActivosCreados?.(activosCopia);

      Swal.fire({
        icon: 'success',
        title: 'Activos agregados',
        text: `Se agregaron ${cantidadTipos} activo(s) a la factura.`,
        timer: 2000,
        showConfirmButton: false
      });

      onClose();
    }
  };

  // Limpiar al cerrar sin confirmar
  const handleClose = () => {
    // Restaurar al estado original si se cancela
    const { activosAgrupados, seriesPorGrupo } = agruparActivos(activosExistentes);
    setActivosSeleccionados(activosAgrupados);

    const seriesIniciales: Record<string, string[]> = {};

    activosAgrupados.forEach((activo) => {
      const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
      const claveGrupo = obtenerClaveAgrupacion(activo);
      const seriesDelGrupo = seriesPorGrupo[claveGrupo] || [];
      seriesIniciales[obtenerClaveActivo(activo)] = ajustarArregloSeries(seriesDelGrupo, cantidad);
    });

    setSeriesPorActivo(seriesIniciales);
    setBusquedaSeleccionados('');
    onClose();
  };

  // Calcular total (memorizado)
  const totalSeleccionados = React.useMemo(() => activosAgregados.reduce(
    (total, activo) => total + (activo.cantidad * activo.precio_unitario_af),
    0
  ), [activosAgregados]);

  return (
    <Modal
      isOpen={isOpen}
      className="modalComponent_AddActivosFactura"
    >
      <div className="modalAddActivosFactura">

        <header className="modalHeader">
          <h3><FaList className="columnIcon" /> Activos en Factura  <span className="contadorBadge">{activosAgregados.length}</span> </h3>

          <div className="divSearch">
            <input
              type="text"
              placeholder="Buscar activos de la factura..."
              value={busquedaSeleccionados}
              onChange={(e) => setBusquedaSeleccionados(e.target.value)}
              className="inputSearch"
            />
          </div>

          <button
            className="buttonCrearActivo"
            onClick={() => setIsAddActivoFijoOpen(true)}
            disabled={activosExistentes?.length > 0}
          >
            <FaPlus /> Crear Nuevo Activo Fijo
          </button>

        </header>

        <section className="divActivosFactura">

          <div className="divActivosList">
            {activosSeleccionadosFiltrados.length > 0 ? (
              activosSeleccionadosFiltrados.map((activo) => {
                const esActivoTemporal = activo.id_activo_fijo && activo.id_activo_fijo < 0;
                const esActivoExistente = activo.id_activo_fijo && activo.id_activo_fijo > 0;
                const claveActivo = obtenerClaveActivo(activo);
                const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
                const series = ajustarArregloSeries(seriesPorActivo[claveActivo] || [], cantidad);

                return (
                  <div key={activo.codigo_unico} className="activoItem">

                    <div className="activoInfo">

                      <header className='activoHeader'>

                        <section className='nameActivo'>
                          <p>
                            {activo.nombre_af}
                          </p>

                          <button
                            className="buttonRemover disabled"
                            onClick={() => handleRemoverActivo(activo.codigo_unico!)}
                            title="Remover de factura"
                            disabled={!!esActivoExistente}
                          >
                            <FaTrash />
                          </button>

                        </section>


                        <section className="datosActivo">
                          <p >
                            {esActivoTemporal ? '🆕 Pendiente de crear' : activo.codigo_unico}

                          </p>

                          <p>
                            {activo.codigo_lote
                              ? `Lote: ${activo.codigo_lote}`
                              : 'Lote: Pendiente'}
                          </p>


                        </section>

                      </header>

                      <section className="activoControls">

                        <div className="divCantidadPrecio">
                          <label>
                            Cantidad:
                            <input
                              type="number"
                              min="1"
                              value={activo.cantidad}
                              disabled={!!esActivoExistente}
                              onChange={(e) => handleActualizarActivo(
                                activo.codigo_unico!,
                                'cantidad',
                                Number(e.target.value)
                              )}
                              className="cantidadInput"
                            />
                          </label>

                          <label>
                            Precio Unitario:
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={activo.precio_unitario_af}
                              disabled={!!esActivoExistente}
                              onChange={(e) => handleActualizarActivo(
                                activo.codigo_unico!,
                                'precio_unitario_af',
                                Number(e.target.value)
                              )}
                              className="precioInput"
                            />
                          </label>
                        </div>

                        <div className="divNoSerie">
                          <label>
                            Números de Serie ({cantidad}):
                            <div className="seriesContainer">
                              {series.map((serie, index) => (
                                <input
                                  key={`${claveActivo}-${index}`}
                                  type="text"
                                  placeholder={`Serie #${index + 1}`}
                                  value={serie}
                                  onChange={(e) => handleSerieChange(activo, index, e.target.value)}
                                  className="noSerieInput"
                                  disabled={!!esActivoExistente}
                                />
                              ))}
                            </div>

                          </label>
                        </div>

                      </section>

                      <section className="activoSubTotal">
                        <p className="subTotal">
                          <strong>Subtotal: {formatPeso(activo.cantidad * activo.precio_unitario_af)}</strong>
                        </p>
                      </section>

                    </div>


                  </div>
                );
              })
            ) : (
              <div className="noItems">
                <p>No hay activos en la factura</p>
              </div>
            )}
          </div>

        </section>

        <div className="divTotal">
          <div className="totalDetalle">
            <h4 className="totalFinal">Total: {formatPeso(totalSeleccionados)}</h4>
            <p className="totalInfo">({activosAgregados.length} activos, {activosAgregados.reduce((t, a) => t + a.cantidad, 0)} unidades totales)</p>
          </div>
        </div>

        {/* Footer con botones */}
        <ModalButtons
          buttons={[
            {
              text: `Confirmar (${activosAgregados.length} activos)`,
              type: 'button',
              className: 'button_addedit',
              onClick: handleConfirmar,
              disabled: activosAgregados.length === 0 || activosExistentes?.length > 0
            },
            {
              text: 'Cancelar',
              type: 'button',
              className: 'button_close',
              onClick: handleClose
            }
          ]}
        />
      </div >

      {/* Modal para crear nuevo activo fijo (modo solo datos, sin crear en BD) */}
      {
        isAddActivoFijoOpen && (
          <AddActivoFijo
            isOpen={isAddActivoFijoOpen}
            onClose={handleAddActivoFijoClose}
            soloDatos={true}
            onAddAFToFactura={handleAFToFactura}
            onAddSinFactura={() => { }}

          />
        )
      }



    </Modal >
  );
};

export default AddActivosFactura;