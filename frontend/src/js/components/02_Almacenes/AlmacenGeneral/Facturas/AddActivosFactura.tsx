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
import { MdInventory } from 'react-icons/md';

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
  const [isAddActivoFijoOpen, setIsAddActivoFijoOpen] = useState(false);
  const [busquedaSeleccionados, setBusquedaSeleccionados] = useState<string>('');
  const tempSequenceRef = useRef<number>(0);

  // Store
  useEffect(() => {
    if (isOpen) {
      // Inicializar con los activos existentes de la factura
      setActivosSeleccionados(agruparActivos(activosExistentes));
    }
  }, [isOpen, activosExistentes]);

  // Función para agrupar activos 
  const agruparActivos = (activos: ActivoFactura[]): ActivoFactura[] => {
    const mapa = new Map<string, ActivoFactura>();

    activos.forEach((activo) => {
      const clave = [
        activo.nombre_af || '',
        activo.id_clasificacion || 0,
        Number(activo.precio_unitario || 0),
        (activo.observaciones_af || '').trim(),
      ].join('|');

      const existente = mapa.get(clave);

      if (!existente) {
        mapa.set(clave, { ...activo });
        return;
      }

      mapa.set(clave, {
        ...existente,
        cantidad: Number(existente.cantidad || 0) + Number(activo.cantidad || 0),
        codigo_unico: 'MÚLTIPLES',
      });
    });

    return Array.from(mapa.values());
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

  // Filtros de búsqueda
  const activosSeleccionadosFiltrados = activosAgregados.filter(activo => {
    if (!activo || !activo.nombre_af) return false;
    const searchTerm = busquedaSeleccionados.toLowerCase();
    return activo.nombre_af.toLowerCase().includes(searchTerm) ||
      (activo.codigo_unico && activo.codigo_unico.toLowerCase().includes(searchTerm)) ||
      (activo.marca_af && activo.marca_af.toLowerCase().includes(searchTerm)) ||
      (activo.modelo_af && activo.modelo_af.toLowerCase().includes(searchTerm));
  });

  // Remover activo de la lista seleccionada
  const handleRemoverActivo = (codigoUnico: string) => {
    setActivosSeleccionados(
      activosAgregados.filter(activo => activo.codigo_unico !== codigoUnico)
    );
  };

  // Actualizar cantidad o precio de activo seleccionado
  const handleActualizarActivo = (
    codigoUnico: string,
    campo: 'cantidad' | 'precio_unitario',
    valor: number
  ) => {
    setActivosSeleccionados(
      activosAgregados.map(activo =>
        activo.codigo_unico === codigoUnico
          ? { ...activo, [campo]: valor }
          : activo
      )
    );
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
      precio_unitario: ActivoFijoFactura.valor_compra_af || 0,
      descuento_af: 0,
      descuento_porcentajeaf: 0,
      id_tipo_movimiento: 0,
      motivo_movimiento: ActivoFijoFactura.motivo_movimiento || 'Creación desde factura',
      fecha_movimiento: ActivoFijoFactura.fecha_movimiento || '',
      id_responsable_anterior: 0,
      id_responsable_actual: ActivoFijoFactura.id_responsable_actual || 0,
      id_ubicacion_anterior: 0,
      id_ubicacion_actual: ActivoFijoFactura.id_ubicacion_actual || 0,
    };
    setActivosSeleccionados(prev => [...prev, nuevoActivoFactura]);
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

    // Calcular total de unidades físicas
    const totalUnidades = activosAgregados.reduce((total, activo) => total + activo.cantidad, 0);

    // Guardar copia de los activos antes de cerrar el modal
    const activosCopia = [...activosAgregados];
    const cantidadTipos = activosCopia.length;

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
    setActivosSeleccionados(agruparActivos(activosExistentes));
    setBusquedaSeleccionados('');
    onClose();
  };

  // Calcular total
  const totalSeleccionados = activosAgregados.reduce(
    (total, activo) => total + (activo.cantidad * activo.precio_unitario),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="modalComponent_AlmacenAddActivosFactura"
    >
      <div className="modalAddActivosFactura">

        {/* Header */}
        <div className="divHeader">
          <h2><MdInventory className="headerIcon" /> Agregar Activos a la Factura</h2>
          <button className="closeButton" onClick={handleClose}>×</button>
        </div>

        {/* Contenido de las dos columnas */}
        <div className="divColumns">

          {/* COLUMNA 1: Activos Agregados a la Factura */}
          <div className="column columnAFSeleccionados columnWide">

            <div className="columnHeader">
              <h3><FaList className="columnIcon" /> Activos en Factura</h3>
              <span className="contadorBadge">{activosAgregados.length}</span>
            </div>

            <div className="divSearch">
              <input
                type="text"
                placeholder="Buscar en factura..."
                value={busquedaSeleccionados}
                onChange={(e) => setBusquedaSeleccionados(e.target.value)}
                className="inputSearch"
              />
            </div>

            <div className="divActivosList">
              {activosSeleccionadosFiltrados.length > 0 ? (
                activosSeleccionadosFiltrados.map((activo) => {
                  const esActivoTemporal = activo.id_activo_fijo && activo.id_activo_fijo < 0;
                  return (
                    <div key={activo.codigo_unico} className="activoItem seleccionado">
                      <div className="activoInfo">
                        <h4>
                          {activo.nombre_af}
                          <p className="codigo">
                            {esActivoTemporal ? '🆕 Pendiente de crear' : activo.codigo_unico}
                          </p>
                          <p className="codigo">
                            {activo.codigo_lote
                              ? `Lote: ${activo.codigo_lote} (${activo.lote_afconsecutivo || '-'} / ${activo.lote_total || '-'})`
                              : 'Lote: Pendiente'}
                          </p>
                        </h4>

                        <div className="activoControls">
                          <label>
                            Cantidad:
                            <input
                              type="number"
                              min="1"
                              value={activo.cantidad}
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
                              value={activo.precio_unitario}
                              onChange={(e) => handleActualizarActivo(
                                activo.codigo_unico!,
                                'precio_unitario',
                                Number(e.target.value)
                              )}
                              className="precioInput"
                            />
                          </label>
                        </div>

                        <div className="subtotalInfo">
                          <p className="subTotal">
                            <strong>Subtotal: {formatPeso(activo.cantidad * activo.precio_unitario)}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        className="buttonRemover"
                        onClick={() => handleRemoverActivo(activo.codigo_unico!)}
                        title="Remover de factura"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="noItems">
                  <p>No hay activos en la factura</p>
                  <p className="helper">Crea nuevos activos usando el botón de la derecha →</p>
                </div>
              )}
            </div>

            {/* Total */}
            {activosAgregados.length > 0 && (
              <div className="divTotal">
                <div className="totalDetalle">
                  <h4 className="totalFinal">Total: {formatPeso(totalSeleccionados)}</h4>
                  <p className="totalInfo">({activosAgregados.length} activos, {activosAgregados.reduce((t, a) => t + a.cantidad, 0)} unidades totales)</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA 2: Crear Nuevo Activo */}
          <div className="column columnAFNuevo">
            <div className="columnHeader">
              <h3><FaPlus className="columnIcon" /> Crear Nuevo Activo</h3>
            </div>

            <div className="divCrearActivo">

              <div className="ayudaInstrucciones">
                <h4>📋 Instrucciones:</h4>
                <ul>
                  <li>✏️ Crea nuevos activos haciendo clic en el botón</li>
                  <li>📝 Los activos se guardan temporalmente en la factura</li>
                  <li>🔢 Ajusta cantidades y precios según necesites</li>
                  <li>✅ Al confirmar, los activos serán creados en la BD junto con la factura</li>
                </ul>
              </div>

              <p className="descripcion">
                ⚠️ <strong>Importante:</strong> Los activos se crearán en la base de datos cuando guardes la factura completa. Cada cantidad genera unidades físicas independientes con su propio código QR.
              </p>

              <button
                className="buttonCrearActivo"
                onClick={() => setIsAddActivoFijoOpen(true)}
              >
                <FaPlus /> Crear Nuevo Activo Fijo
              </button>

            </div>
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
              disabled: activosAgregados.length === 0
            },
            {
              text: 'Cancelar',
              type: 'button',
              className: 'button_close',
              onClick: handleClose
            }
          ]}
        />
      </div>

      {/* Modal para crear nuevo activo fijo (modo solo datos, sin crear en BD) */}
      {isAddActivoFijoOpen && (
        <AddActivoFijo
          isOpen={isAddActivoFijoOpen}
          onClose={handleAddActivoFijoClose}
          soloDatos={true}
          onAddAFToFactura={handleAFToFactura}
          onAddSinFactura={() => { }}

        />
      )}

    </Modal>
  );
};

export default AddActivosFactura;