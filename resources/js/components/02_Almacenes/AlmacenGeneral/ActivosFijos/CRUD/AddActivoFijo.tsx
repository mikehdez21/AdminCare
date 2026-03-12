import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { addActivoFijo, getActivosFijos, getEstatusActivosFijos } from '@/store/almacenGeneral/Activos/activosActions';
import { setListActivosFijos } from '@/store/almacenGeneral/Activos/activosReducer';

import { ActivoFactura, ActivosFijos, MovimientosActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

import { getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { addMovimientoActivoFijo, getMovimientosActivosFijos, getTipoMovimientosActivosFijos } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListMovimientosAF } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFReducer';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { getFechaHoraActual } from '@/utils/dateFormat';

import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/modalActivosFijos.css';

interface AddActivoFijoProps {
  isOpen: boolean;
  onClose: () => void;
  onActivoCreado?: (activo: ActivosFijos) => void;
  soloDatos?: boolean;
  onAddAFToFactura?: (activoFijo: ActivoFactura) => void;
  onAddSinFactura: () => void;

}

Modal.setAppElement('#root');

const AddActivoFijo: React.FC<AddActivoFijoProps> = ({
  isOpen,
  onClose,
  onActivoCreado,
  soloDatos = false,
  onAddAFToFactura,
  onAddSinFactura
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados para los campos del formulario de Activo Fijo
  const [nombreAF, setNombreAF] = useState<string>('');
  const [descripcionAF, setDescripcionAF] = useState<string>('');
  const [modeloAF, setModeloAF] = useState<string>('');
  const [marcaAF, setMarcaAF] = useState<string>('');
  const [noSerieAF, setNoSerieAF] = useState<string>('');
  const [valorCompraAF, setValorCompraAF] = useState<number>(0.00);
  const [fechaCompraAF, setFechaCompraAF] = useState<string>(getFechaHoraActual());
  const [afPropio, setAFPropio] = useState<boolean>(true);
  const [tipoEstatusAF, setTipoEstatusAF] = useState<number>(0);
  const [tipoClasificacionAF, setTipoClasificacionAF] = useState<number>(0);
  const [fechaRegistroAF, setFechaRegistroAF] = useState<string>(getFechaHoraActual);
  const [observacionesAF, setObservacionesAF] = useState<string>('');

  // Estados para los campos del formulario de Asignación del Activo Fijo
  const [tipoMovimiento, setTipoMovimiento] = useState<number>(0);
  const [responsableActual, setResponsableActual] = useState<number>(0);
  const [ubicacionActual, setUbicacionActual] = useState<number>(0);
  const [motivoMovimiento, setMotivoMovimiento] = useState<string>('');

  // Datos de empleados y ubicaciones desde el store
  const empleados = useSelector((state: RootState) => state.empleados.empleados);
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);
  const tiposClasificacionAF = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);
  const tiposEstatusAF = useSelector((state: RootState) => state.activos.estatusActivoFijo);
  const tipoMovimientoAF = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);

  useEffect(() => {
    // Solo se hace fetch si los arrays están vacíos
    if (!tiposEstatusAF?.length) dispatch(getEstatusActivosFijos());
    if (!tiposClasificacionAF?.length) dispatch(getClasificaciones());
    if (!empleados?.length) dispatch(getEmpleados());
    if (!ubicaciones?.length) dispatch(getUbicaciones());
    if (!tipoMovimientoAF?.length) dispatch(getTipoMovimientosActivosFijos());
  }, [dispatch]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

      const nuevoActivoFijo: ActivosFijos = {
        nombre_af: nombreAF,
        descripcion_af: descripcionAF,
        modelo_af: modeloAF,
        marca_af: marcaAF,
        numero_serie_af: noSerieAF,
        valor_compra_af: valorCompraAF,
        fecha_compra_af: fechaCompraAF,
        af_propio: afPropio,
        id_estado_af: tipoEstatusAF,
        id_clasificacion: tipoClasificacionAF,
        fecha_registro_af: fechaRegistroAF,
        observaciones_af: observacionesAF,

      };

      console.log('AddActivoFijo', nuevoActivoFijo)

      const nuevoActivoFactura: ActivoFactura = {
        ...nuevoActivoFijo,
        cantidad: 1,
        precio_unitario: valorCompraAF,
        descuento_af: 0,
        descuento_porcentajeaf: 0,
        id_tipo_movimiento: tipoMovimiento,
        motivo_movimiento: motivoMovimiento,
        fecha_movimiento: getFechaHoraActual(),
        id_responsable_anterior: 0,
        id_responsable_actual: responsableActual,
        id_ubicacion_anterior: 0,
        id_ubicacion_actual: ubicacionActual,
      };

      // Si solo se requieren los datos sin crear en BD
      if (soloDatos && onAddAFToFactura) {
        onAddAFToFactura(nuevoActivoFactura);

        // Limpiar formulario
        setNombreAF('');
        setDescripcionAF('');
        setModeloAF('');
        setMarcaAF('');
        setNoSerieAF('');
        setValorCompraAF(0.00);
        setFechaCompraAF(getFechaHoraActual());
        setAFPropio(true);
        setFechaRegistroAF(getFechaHoraActual());
        setTipoEstatusAF(0);
        setTipoClasificacionAF(0);
        setObservacionesAF('');
        setTipoMovimiento(0);
        setResponsableActual(0);
        setUbicacionActual(0);
        setMotivoMovimiento('');

        Swal.fire({
          icon: 'success',
          title: 'Activo agregado',
          text: 'El activo se ha agregado a la factura. Será creado al confirmar.',
          timer: 1500,
          showConfirmButton: false
        });

        onClose();
        return;
      }

      console.log('Nuevo Activo Fijo a crear:', nuevoActivoFijo);
      // Flujo normal: crear en BD inmediatamente
      const resultAction = await dispatch(addActivoFijo(nuevoActivoFijo)).unwrap();

      console.log('Resultado de crear activo fijo:', resultAction);

      if (resultAction.success) {

        const asignacionActivoFijo: MovimientosActivosFijos = {
          id_activo_fijo: resultAction.activofijo!.id_activo_fijo, // Asegurar que se pasa el ID correcto del activo creado
          id_tipo_movimiento: tipoMovimiento,
          motivo_movimiento: motivoMovimiento,
          fecha_movimiento: getFechaHoraActual(),
          id_responsable_anterior: 0,
          id_responsable_actual: responsableActual,
          id_ubicacion_anterior: 0,
          id_ubicacion_actual: ubicacionActual,
        };

        console.log('Asignación:', asignacionActivoFijo);

        const resultActionAsignacion = await dispatch(addMovimientoActivoFijo(asignacionActivoFijo)).unwrap();


        if (resultActionAsignacion.success) {
          const activosFijosActualizados = await dispatch(getActivosFijos()).unwrap();
          const movimientosAFActualizados = await dispatch(getMovimientosActivosFijos()).unwrap();

          if (activosFijosActualizados.success && movimientosAFActualizados.success) {
            dispatch(setListActivosFijos(activosFijosActualizados.activosFijos || []));
            dispatch(setListMovimientosAF(movimientosAFActualizados.movimientosAF || []));
            setNombreAF('');
            setDescripcionAF('');
            setModeloAF('');
            setMarcaAF('');
            setNoSerieAF('');
            setValorCompraAF(0.00);
            setFechaCompraAF(getFechaHoraActual());
            setAFPropio(true);
            setTipoEstatusAF(0);
            setTipoClasificacionAF(0);
            setFechaRegistroAF(getFechaHoraActual());
            setObservacionesAF('');

            setTipoMovimiento(0);
            setResponsableActual(0);
            setUbicacionActual(0);
            setMotivoMovimiento('');

            // Llamar callback si existe - PASAR EL ACTIVO CREADO
            if (onActivoCreado) {
              onActivoCreado({
                ...nuevoActivoFijo,
                id_activo_fijo: resultAction.activofijo!.id_activo_fijo, // Asegurar que se pasa el ID correcto del activo creado
              });
            }

            Swal.fire({
              icon: 'success',
              title: 'Activo Fijo Añadido',
              text: 'El activo fijo y su asignación han sido añadidos exitosamente.',
              confirmButtonText: 'OK',
            });

            onAddSinFactura()
            onClose();


          } else {
            console.log('Error al actualizar los datos!');
          }

        } else {
          console.log('Error al añadir la asignación del activo fijo:', resultActionAsignacion.message);

        }

      } else {
        console.log('Error al añadir el activo fijo:', resultAction.message);
      }

    } catch (error) {
      console.error('Error al añadir activo fijo:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el activo fijo. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalComponent_AlmacenAF"
    >
      <div className="modalActivosFijos">
        <h2>Añadir ActivoFijo</h2>

        <div className='divInputs_AddEdit_ActivoFijo'>
          <form onSubmit={handleSubmit} className="form_AddEdit_ActivoFijo">

            <div className='dataInputs_ActivoFijo'>

              <div className='addActivoFijo_FirstColumn'>

                <h2> Datos del Activo Fijo </h2>

                <section className='inputs_addActivoFijo'>

                  <label>
                    *Nombre del Activo Fijo:
                    <input
                      type="text"
                      value={nombreAF}
                      placeholder='Nombre del AF'
                      onChange={(e) => setNombreAF(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Descripción:
                    <input
                      value={descripcionAF}
                      placeholder='Descripción física del AF'
                      onChange={(e) => setDescripcionAF(e.target.value)}
                      type="text"
                    />
                  </label>

                  <label>
                    *Modelo:
                    <input
                      type="text"
                      value={modeloAF}
                      placeholder='Modelo del AF'
                      onChange={(e) => setModeloAF(e.target.value)}
                    />
                  </label>

                  <label>
                    *Marca:
                    <input
                      type="text"
                      value={marcaAF}
                      placeholder='Marca del AF'
                      onChange={(e) => setMarcaAF(e.target.value)}
                    />
                  </label>

                  <label>
                    *No. de Serie:
                    <input
                      type="text"
                      value={noSerieAF}
                      placeholder='Número de Serie del AF'
                      onChange={(e) => setNoSerieAF(e.target.value)}
                    />
                  </label>

                  <label>
                    *Valor de Compra:
                    <input
                      type="number"
                      min={'0'}
                      placeholder='0.00'
                      value={valorCompraAF}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === '' || valor === '0') {
                          setValorCompraAF(0);
                        } else {
                          setValorCompraAF(parseFloat(valor) || 0);
                        }
                      }}
                      onFocus={(e) => {
                        if (valorCompraAF === 0) {
                          e.target.select();
                        }
                      }} />
                  </label>

                  <label>
                    *Fecha de Compra:
                    <input
                      type="datetime-local"
                      value={fechaCompraAF}
                      onChange={(e) => setFechaCompraAF(e.target.value)}
                    />
                  </label>

                  <label htmlFor="">
                    *Activo Propio:
                    <select
                      required
                      value={afPropio ? '1' : '0'}
                      onChange={(e) => setAFPropio(e.target.value === '1')}
                    >
                      <option value="" disabled>Seleccione una opción</option>
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                  </label>

                  <label>
                    *Estatus del Activo Fijo:
                    <select
                      required
                      value={tipoEstatusAF || ''}
                      onChange={(e) => setTipoEstatusAF(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione una opción</option>
                      {Array.isArray(tiposEstatusAF) && tiposEstatusAF.map((tipoEstatusAF) => (
                        <option key={tipoEstatusAF.id_estatusaf} value={tipoEstatusAF.id_estatusaf}>
                          {tipoEstatusAF.descripcion_estatusaf}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    *Clasificación del Activo Fijo:
                    <select
                      required
                      value={tipoClasificacionAF || ''}
                      onChange={(e) => setTipoClasificacionAF(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione una opción</option>
                      {Array.isArray(tiposClasificacionAF) && tiposClasificacionAF.map((tipoClasificacionAF) => (
                        <option key={tipoClasificacionAF.id_clasificacion} value={tipoClasificacionAF.id_clasificacion}>
                          {tipoClasificacionAF.nombre_clasificacion}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    *Fecha de Registro:
                    <input
                      type="datetime-local"
                      value={fechaRegistroAF}
                      onChange={(e) => setFechaRegistroAF(e.target.value)}
                    />
                  </label>

                  <label>
                    Observaciones:
                    <input
                      type="text"
                      className='observacionesAF'
                      value={observacionesAF}
                      placeholder='Observaciones sobre el AF'
                      onChange={(e) => setObservacionesAF(e.target.value)}
                    />
                  </label>

                </section>

              </div>

              <div className='asignacionAF_SecondColumn'>
                <h2> Asignación del Activo Fijo </h2>

                <section className='inputs_asignacionAF'>

                  <label>
                    *Tipo de Movimiento:
                    <select
                      value={tipoMovimiento || ''}
                      onChange={(e) => setTipoMovimiento(Number(e.target.value))}
                      required
                    >
                      <option value="" disabled>Seleccione un tipo de movimiento</option>
                      {Array.isArray(tipoMovimientoAF) && tipoMovimientoAF.map((tipomovimiento) => (
                        <option key={tipomovimiento.id_tipomovimientoaf} value={tipomovimiento.id_tipomovimientoaf}>
                          {tipomovimiento.nombre_tipomovimientoaf}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    *Responsable Actual:
                    <select
                      value={responsableActual || ''}
                      onChange={(e) => setResponsableActual(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione un responsable</option>
                      {Array.isArray(empleados) && empleados.map((empleado) => (
                        <option key={empleado.id_empleado} value={empleado.id_empleado}>
                          {empleado.nombre_empleado} {empleado.apellido_paterno} {empleado.apellido_materno}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    *Ubicación Actual:
                    <select
                      value={ubicacionActual || ''}
                      onChange={(e) => setUbicacionActual(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione una ubicación</option>
                      {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion) => (
                        <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                          {ubicacion.nombre_ubicacion}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Motivo de movimiento:
                    <textarea
                      value={motivoMovimiento}
                      className='textarea_motivoMovimientoAF'
                      onChange={(e) => setMotivoMovimiento(e.target.value)}
                      placeholder="Ej: Movimiento de ubicación, reasignación, etc."
                    />
                  </label>
                </section>

              </div>

            </div>

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
                  onClick: onClose
                }
              ]}
            />

          </form>
        </div>

      </div>


    </Modal>
  );
};

export default AddActivoFijo;

