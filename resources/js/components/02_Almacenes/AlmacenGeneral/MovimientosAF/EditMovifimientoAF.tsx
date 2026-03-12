import { MovimientosActivosFijos, VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { editMovimientoActivoFijo, getMovimientosActivosFijos, getVWmovimientosActivosFijos } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListMovimientosAF } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFReducer';
import { setListvwMovimientosAF } from '@/store/almacenGeneral/Activos/vwMovimientosAFReducer';
import { AppDispatch, RootState } from '@/store/store';
import { formatDateHorasToInputs, getFechaHoraActual } from '@/utils/dateFormat';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/modalMovimientosAF.css';


interface EditMovimientoAFProps {
  isOpen: boolean;
  onClose: () => void;
  movimientoAFToEdit: VwMovimientosAF | null;

}

Modal.setAppElement('#root');

const EditMovimientoAF: React.FC<EditMovimientoAFProps> = ({ isOpen, onClose, movimientoAFToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  // Estados para los campos del formulario
  const [idMovimientoAF, setIdMovimientoAF] = useState<number>(0);
  const [codigoUnico, setCodigoUnico] = useState<string>('');
  const [tipoMovimiento, setTipoMovimiento] = useState<number>(0);
  const [motivoMovimiento, setMotivoMovimiento] = useState<string>('');
  const [fechaMovimientoAF, setFechaMovimientoAF] = useState('');

  const [responsableAnterior, setResponsableAnterior] = useState<number>(0);
  const [responsableActual, setResponsableActual] = useState<number>(0);
  const [ubicacionAnterior, setUbicacionAnterior] = useState<number>(0);
  const [ubicacionActual, setUbicacionActual] = useState<number>(0);

  // Estados para almacenar los valores originales
  const [responsableOriginal, setResponsableOriginal] = useState<number>(0);
  const [ubicacionOriginal, setUbicacionOriginal] = useState<number>(0);


  // Datos desde el store
  const MovimientosAF = useSelector((state: RootState) => state.movimientosAF.movimientosAF);
  const tipoMovimientoAF = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);
  const empleados = useSelector((state: RootState) => state.empleados.empleados);
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);

  useEffect(() => {

    const cargarMovimientosActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getMovimientosActivosFijos()).unwrap();

        if (resultAction.success) {
          dispatch(setListMovimientosAF(resultAction.movimientosAF!));
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar los movimientos de activos fijos:', error);
      }
    };
    cargarMovimientosActivosFijos();

    // Cargar empleados y ubicaciones si no están disponibles
    if (!empleados.length) {
      dispatch(getEmpleados());
    }
    if (!ubicaciones.length) {
      dispatch(getUbicaciones());
    }

  }, [dispatch, empleados.length, ubicaciones.length]);

  useEffect(() => {
    if (movimientoAFToEdit && MovimientosAF?.length && empleados?.length && ubicaciones?.length) {

      const ultimoMovimiento = MovimientosAF
        .filter(mov => mov.id_activo_fijo === movimientoAFToEdit.id_activo_fijo)
        .sort((a, b) => new Date(b.fecha_movimiento || '').getTime() - new Date(a.fecha_movimiento || '').getTime())[0];


      if (ultimoMovimiento) {
        setIdMovimientoAF(ultimoMovimiento.id_movimientoAF || 0);
        setCodigoUnico(movimientoAFToEdit.codigo_unico);
        setTipoMovimiento(ultimoMovimiento.id_tipo_movimiento || 0);
        setMotivoMovimiento(ultimoMovimiento.motivo_movimiento || '');

        const fechaUltimoMovimientoFormatted = formatDateHorasToInputs(movimientoAFToEdit.fecha_ultimo_movimiento);
        setFechaMovimientoAF(fechaUltimoMovimientoFormatted || '');

        setResponsableActual(ultimoMovimiento.id_responsable_actual || 0);
        setUbicacionActual(ultimoMovimiento.id_ubicacion_actual || 0);
        setResponsableAnterior(ultimoMovimiento.id_responsable_anterior || 0);
        setUbicacionAnterior(ultimoMovimiento.id_ubicacion_anterior || 0);

        // Almacenar los valores originales
        setResponsableOriginal(ultimoMovimiento.id_responsable_actual || 0);
        setUbicacionOriginal(ultimoMovimiento.id_ubicacion_actual || 0);

      } else {
        setCodigoUnico(movimientoAFToEdit.codigo_unico);
        const fechaFormateada = formatDateHorasToInputs(movimientoAFToEdit.fecha_ultimo_movimiento);
        setFechaMovimientoAF(fechaFormateada || '');
      }

    } else {
      // Limpiar formulario si no hay datos
      setCodigoUnico('');
      setTipoMovimiento(0);
      setMotivoMovimiento('');
      setFechaMovimientoAF('');
      setResponsableActual(0);
      setUbicacionActual(0);
      setResponsableAnterior(0);
      setUbicacionAnterior(0);
      setResponsableOriginal(0);
      setUbicacionOriginal(0);

    }
  }, [movimientoAFToEdit, MovimientosAF, empleados, ubicaciones]);

  // Handlers para manejar cambios automáticos de valores anteriores
  const handleResponsableActualChange = (newResponsableId: number) => {
    // Si hay un valor original y es diferente al nuevo valor
    if (responsableOriginal && responsableOriginal !== newResponsableId) {
      setResponsableAnterior(responsableOriginal);
    }
    setResponsableActual(newResponsableId);
  };

  const handleUbicacionActualChange = (newUbicacionId: number) => {
    // Si hay un valor original y es diferente al nuevo valor
    if (ubicacionOriginal && ubicacionOriginal !== newUbicacionId) {
      setUbicacionAnterior(ubicacionOriginal);
    }
    setUbicacionActual(newUbicacionId);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const movimientoAFEditado: MovimientosActivosFijos = {
        id_movimientoAF: idMovimientoAF,
        id_activo_fijo: movimientoAFToEdit?.id_activo_fijo,
        id_tipo_movimiento: tipoMovimiento,
        motivo_movimiento: motivoMovimiento,
        fecha_movimiento: getFechaHoraActual(),
        id_responsable_anterior: responsableAnterior,
        id_responsable_actual: responsableActual,
        id_ubicacion_anterior: ubicacionAnterior,
        id_ubicacion_actual: ubicacionActual,

      };

      const formData = new FormData();

      formData.append('id_activo_fijo', movimientoAFEditado.id_activo_fijo ? movimientoAFEditado.id_activo_fijo.toString() : '');
      formData.append('id_tipo_movimiento', movimientoAFEditado.id_tipo_movimiento ? movimientoAFEditado.id_tipo_movimiento.toString() : '');
      formData.append('motivo_movimiento', movimientoAFEditado.motivo_movimiento);
      formData.append('fecha_movimiento', movimientoAFEditado.fecha_movimiento ? movimientoAFEditado.fecha_movimiento.toString() : '');
      formData.append('id_responsable_actual', movimientoAFEditado.id_responsable_actual ? movimientoAFEditado.id_responsable_actual.toString() : '');
      formData.append('id_ubicacion_actual', movimientoAFEditado.id_ubicacion_actual ? movimientoAFEditado.id_ubicacion_actual.toString() : '');

      console.log('dataMovimientoAF_Enviada: ', movimientoAFEditado)

      const resultAction = await dispatch(editMovimientoActivoFijo(movimientoAFEditado)).unwrap();

      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        const movimientosAFActualizados = await dispatch(getMovimientosActivosFijos()).unwrap();
        const vwMovimientosAFActualizados = await dispatch(getVWmovimientosActivosFijos()).unwrap();

        if (movimientosAFActualizados.success) {
          dispatch(setListMovimientosAF(movimientosAFActualizados.movimientosAF!));
          dispatch(setListvwMovimientosAF(vwMovimientosAFActualizados.vwMovimientosAF!));
          setCodigoUnico('');
          setTipoMovimiento(0);
          setMotivoMovimiento('');
          setFechaMovimientoAF('');
          setResponsableActual(0);
          setUbicacionActual(0);
          setResponsableAnterior(0);
          setUbicacionAnterior(0);
          setResponsableOriginal(0);
          setUbicacionOriginal(0);

          console.log('Movimiento de activo fijo editado y lista recargada:', movimientosAFActualizados.movimientosAF);

        }

        Swal.fire({
          icon: 'success',
          title: 'Movimiento de Activo Fijo Editado',
          text: 'El movimiento del activo fijo ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose();
      } else {

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el movimiento del activo fijo.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el movimiento del activo fijo:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el movimiento del activo fijo. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });


    };
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalComponent_AlmacenMovimientoAF"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="modalMovimientosAF">
        <h2>Editar Movimiento del Activo Fijo</h2>
        <h3 className='titleCódigoÚnicoAF'>Código Único Consecutivo: <br /> <p className='textCódigoUnico'> {codigoUnico}</p></h3>

        <div className='divInputs_AddEdit_MovimientosAF'>
          <form onSubmit={handleSubmit} className="form_AddEdit_MovimientosAF">

            <div className='dataInputs_MovimientoAF'>

              <div className='editMovimientoInfo_FirstColumn'>
                <h2> Datos del Movimiento </h2>

                <section className='inputs_InfoAFMovimiento'>

                  <label >
                    *Tipo de Movimiento:
                    <select
                      value={tipoMovimiento || ''}
                      onChange={(e) => setTipoMovimiento(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione un tipo de movimiento</option>
                      {Array.isArray(tipoMovimientoAF) && tipoMovimientoAF.map((tipomovimiento, index) => (
                        <option key={`tipoMovEdit-${tipomovimiento.id_tipomovimientoaf}-${index}`} value={tipomovimiento.id_tipomovimientoaf}>
                          {tipomovimiento.nombre_tipomovimientoaf}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Motivo de asignación:
                    <textarea
                      value={motivoMovimiento}
                      onChange={(e) => setMotivoMovimiento(e.target.value)}
                      className='textarea_motivoMovimientoAF'
                      placeholder="Ej: Asignación inicial, nuevo empleado, etc."
                    />
                  </label>

                  <label>
                    Fecha del Último Movimiento:
                    <input
                      type="datetime-local"
                      disabled
                      value={fechaMovimientoAF}
                      onChange={(e) => setFechaMovimientoAF(e.target.value)}
                    />
                  </label>

                </section>

              </div>

              <div className='editMovimientoInfo_SecondColumn'>
                <h2> Responsables del Activo Fijo </h2>

                <section className='inputs_ResponsableAFMovimiento'>

                  <label>
                    *Responsable Actual:
                    <select
                      value={responsableActual || ''}
                      onChange={(e) => handleResponsableActualChange(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione un responsable</option>
                      {Array.isArray(empleados) && empleados.map((empleado, index) => (
                        <option key={`resp-actual-${empleado.id_empleado}-${index}`} value={empleado.id_empleado}>
                          {empleado.nombre_empleado} {empleado.apellido_paterno} {empleado.apellido_materno}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    *Ubicación Actual:
                    <select
                      value={ubicacionActual || ''}
                      onChange={(e) => handleUbicacionActualChange(Number(e.target.value))}
                    >
                      <option value="" disabled>Seleccione una ubicación</option>
                      {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion, index) => (
                        <option key={`ubic-actual-${ubicacion.id_ubicacion}-${index}`} value={ubicacion.id_ubicacion}>
                          {ubicacion.nombre_ubicacion}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label >
                    *Responsable Anterior
                    <select
                      value={responsableAnterior || ''}
                      onChange={(e) => setResponsableAnterior(Number(e.target.value))}
                      disabled
                    >
                      <option value="" disabled>Seleccione un responsable anterior</option>
                      {Array.isArray(empleados) && empleados.map((empleado, index) => (
                        <option key={`resp-anterior-${empleado.id_empleado}-${index}`} value={empleado.id_empleado}>
                          {empleado.nombre_empleado} {empleado.apellido_paterno} {empleado.apellido_materno}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    *Ubicación Anterior
                    <select
                      value={ubicacionAnterior || ''}
                      onChange={(e) => setUbicacionAnterior(Number(e.target.value))}
                      disabled
                    >
                      <option value="" disabled>Seleccione una ubicación anterior</option>
                      {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion, index) => (
                        <option key={`ubic-anterior-${ubicacion.id_ubicacion}-${index}`} value={ubicacion.id_ubicacion}>
                          {ubicacion.nombre_ubicacion}
                        </option>
                      ))}
                    </select>
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
  )

}

export default EditMovimientoAF;