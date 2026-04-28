import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getEstatusActivosFijos, editActivoFijo, getActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';
import Swal from 'sweetalert2';
import { getMovimientosActivosFijos, getTipoMovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListMovimientosAF } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFReducer';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { formatDateHorasToInputs } from '@/utils/dateFormat';

import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/modalActivosFijos.css';


interface EditActivoFijoProps {
  isOpen: boolean;
  onClose: () => void;
  activoFijoToEdit: ActivosFijos | null;
  onEdit: () => void;

}


Modal.setAppElement('#root');

const EditActivoFijo: React.FC<EditActivoFijoProps> = ({ isOpen, onClose, activoFijoToEdit, onEdit }) => {

  const dispatch = useDispatch<AppDispatch>();
  const MovimientosAF = useSelector((state: RootState) => state.movimientosAF.movimientosAF);


  // Estados para los campos del formulario
  const [codigoUnico, setCodigoUnico] = useState<string>('');
  const [nombreAF, setNombreAF] = useState<string>('');
  const [descripcionAF, setDescripcionAF] = useState<string>('');
  const [modeloAF, setModeloAF] = useState<string>('');
  const [marcaAF, setMarcaAF] = useState<string>('');
  const [noSerieAF, setNoSerieAF] = useState<string>('');
  const [precioUnitarioAF, setPrecioUnitarioAF] = useState<number>(0.00);
  const [afPropio, setAFPropio] = useState<boolean>(true);
  const [tipoEstatusAF, setTipoEstatusAF] = useState<number>(0);
  const [tipoClasificacionAF, setTipoClasificacionAF] = useState<number>(0);
  const [fechaRegistroAF, setFechaRegistroAF] = useState('');
  const [observacionesAF, setObservacionesAF] = useState('');

  // Estados para los campos del formulario de Asignación del Activo Fijo
  const [tipoMovimiento, setTipoMovimiento] = useState<number | null>(null);
  const [responsableActual, setResponsableActual] = useState<number | null>(null);
  const [ubicacionActual, setUbicacionActual] = useState<number | null>(null);
  const [motivoMovimiento, setMotivoMovimiento] = useState<string>('');

  // Datos de empleados y ubicaciones desde el store
  const empleados = useSelector((state: RootState) => state.empleados.empleados);
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);
  const tiposClasificacionAF = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);
  const tiposEstatusAF = useSelector((state: RootState) => state.activos.estatusActivoFijo);
  const tipoMovimientoAF = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);


  useEffect(() => {

    if (!tiposEstatusAF?.length) dispatch(getEstatusActivosFijos());
    if (!tiposClasificacionAF?.length) dispatch(getClasificaciones());

    if (!tipoMovimientoAF?.length) dispatch(getTipoMovimientosActivosFijos());
    if (!empleados?.length) dispatch(getEmpleados());
    if (!ubicaciones?.length) dispatch(getUbicaciones());

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

  }, [dispatch, tiposEstatusAF, tiposClasificacionAF, tipoMovimientoAF, empleados, ubicaciones]);



  useEffect(() => {
    if (activoFijoToEdit) {
      setCodigoUnico(activoFijoToEdit.codigo_unico!);
      setNombreAF(activoFijoToEdit.nombre_af);
      setDescripcionAF(activoFijoToEdit.descripcion_af);
      setModeloAF(activoFijoToEdit.modelo_af);
      setMarcaAF(activoFijoToEdit.marca_af);
      setNoSerieAF(activoFijoToEdit.numero_serie_af);
      setPrecioUnitarioAF(activoFijoToEdit.precio_unitario_af);


      setAFPropio(activoFijoToEdit.af_propio);
      setTipoEstatusAF(activoFijoToEdit.id_estado_af || 0);
      setTipoClasificacionAF(activoFijoToEdit.id_clasificacion || 0);

      setFechaRegistroAF(formatDateHorasToInputs(activoFijoToEdit.fecha_registro_af) || '');

      setObservacionesAF(activoFijoToEdit.observaciones_af);

      // Buscar el último movimiento de este activo fijo para cargar los datos de asignación
      const ultimoMovimiento = MovimientosAF
        .filter(am => am.id_activo_fijo === activoFijoToEdit.id_activo_fijo)
        .sort((a, b) => new Date(b.fecha_movimiento || '').getTime() - new Date(a.fecha_movimiento || '').getTime())[0];

      if (ultimoMovimiento) {
        // Asignar los valores correctos del último movimiento
        setTipoMovimiento(ultimoMovimiento.id_tipo_movimiento || null);
        setResponsableActual(ultimoMovimiento.id_responsable_actual || null);
        setUbicacionActual(ultimoMovimiento.id_ubicacion_actual || null);
        setMotivoMovimiento(ultimoMovimiento.motivo_movimiento || '');


      } else {
        // Si no hay movimientos previos, limpiar los campos de asignación
        setTipoMovimiento(null);
        setResponsableActual(null);
        setUbicacionActual(null);
        setMotivoMovimiento('');
      }

    } else {
      // Si no hay activoFijoToEdit, limpiar los campos
      setCodigoUnico('');
      setNombreAF('');
      setDescripcionAF('');
      setModeloAF('');
      setMarcaAF('');
      setNoSerieAF('');
      setPrecioUnitarioAF(0.00);
      setAFPropio(true);
      setTipoEstatusAF(0);
      setTipoClasificacionAF(0);
      setFechaRegistroAF('');
      setObservacionesAF('');
      setTipoMovimiento(null);
      setResponsableActual(null);
      setUbicacionActual(null);
      setMotivoMovimiento('');
    }
  }, [activoFijoToEdit, MovimientosAF]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const activoFijoEditado: ActivosFijos = {
        id_activo_fijo: activoFijoToEdit?.id_activo_fijo,
        codigo_unico: codigoUnico,
        nombre_af: nombreAF,
        descripcion_af: descripcionAF,
        modelo_af: modeloAF,
        marca_af: marcaAF,
        numero_serie_af: noSerieAF,
        precio_unitario_af: precioUnitarioAF,
        af_propio: afPropio,
        id_estado_af: tipoEstatusAF,
        id_clasificacion: tipoClasificacionAF,
        fecha_registro_af: fechaRegistroAF,
        observaciones_af: observacionesAF,
      };

      const formData = new FormData();

      formData.append('id_activo_fijo', activoFijoEditado.id_activo_fijo!.toString());
      formData.append('codigo_unico', activoFijoEditado.codigo_unico!);
      formData.append('nombre_af', nombreAF);
      formData.append('descripcion_af', descripcionAF);
      formData.append('modelo_af', modeloAF);
      formData.append('marca_af', marcaAF);
      formData.append('numero_serie_af', noSerieAF);
      formData.append('precio_unitario_af', precioUnitarioAF.toString());
      formData.append('af_propio', afPropio ? '1' : '0');
      formData.append('id_estado_af', tipoEstatusAF.toString());
      formData.append('id_clasificacion', tipoClasificacionAF.toString());
      formData.append('fecha_registro_af', fechaRegistroAF);
      formData.append('observaciones_af', observacionesAF);


      console.log('dataActivoFijo_Enviada: ', activoFijoEditado)
      const resultAction = await dispatch(editActivoFijo(activoFijoEditado)).unwrap();


      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        const activosFijosActualizados = await dispatch(getActivosFijos()).unwrap();

        if (activosFijosActualizados.success) {
          dispatch(setListActivosFijos(activosFijosActualizados.activosFijos || [])); // Actualiza la lista de activos fijos en el estado
          setNombreAF('');
          setDescripcionAF('');
          setModeloAF('');
          setMarcaAF('');
          setNoSerieAF('');
          setPrecioUnitarioAF(0.00);
          setAFPropio(true);
          setTipoEstatusAF(0);
          setTipoClasificacionAF(0);
          setFechaRegistroAF('');
          setObservacionesAF('');

          setTipoMovimiento(null);
          setResponsableActual(null);
          setUbicacionActual(null);
          setMotivoMovimiento('');

          console.log('Activo fijo editado y lista recargada:', activosFijosActualizados.activosFijos);

        }

        Swal.fire({
          icon: 'success',
          title: 'Activo Fijo Editado',
          text: 'El activo fijo ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onEdit()
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el activo fijo.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el activo fijo:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el activo fijo. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalComponent_AlmacenAF"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="modalActivosFijos">
        <h2>Editar ActivoFijo</h2>
        <h3 className='titleCódigoÚnicoAF'>Código Único Consecutivo: <br /> <p className='textCódigoUnico'> {codigoUnico}</p></h3>

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
                      onChange={(e) => setNombreAF(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Descripción:
                    <input
                      value={descripcionAF}
                      onChange={(e) => setDescripcionAF(e.target.value)}
                      type="text"
                    />
                  </label>

                  <label>
                    *Modelo:
                    <input
                      type="text"
                      value={modeloAF}
                      onChange={(e) => setModeloAF(e.target.value)}
                    />
                  </label>

                  <label>
                    *Marca:
                    <input
                      type="text"
                      value={marcaAF}
                      onChange={(e) => setMarcaAF(e.target.value)}
                    />
                  </label>

                  <label>
                    *No. de Serie:
                    <input
                      type="text"
                      value={noSerieAF}
                      onChange={(e) => setNoSerieAF(e.target.value)}
                    />
                  </label>

                  <label htmlFor="">
                    *Activo Propio:
                    <select
                      required
                      value={afPropio ? '1' : '0'}
                      onChange={(e) => {
                        const esPropio = e.target.value === '1';
                        setAFPropio(esPropio);
                        if (!esPropio) {
                          setPrecioUnitarioAF(0);
                        }
                      }}
                    >
                      <option value="" disabled>Seleccione una opción</option>
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                  </label>

                  <label>
                    *Precio Unitario{afPropio ? '' : ' (COMODATO)'}:
                    <input
                      type="number"
                      min={'0'}
                      placeholder='0.00'
                      value={precioUnitarioAF}
                      disabled={!afPropio}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === '') {
                          setPrecioUnitarioAF(0);
                        } else {
                          setPrecioUnitarioAF(parseFloat(valor) || 0);
                        }
                      }}
                      onFocus={(e) => {
                        if (precioUnitarioAF === 0) {
                          e.target.select();
                        }
                      }} />
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
                        <option className='optionsClasificacionesAF' key={tipoClasificacionAF.id_clasificacion} value={tipoClasificacionAF.id_clasificacion}>
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
                      onChange={(e) => setObservacionesAF(e.target.value)}
                    />
                  </label>

                </section>

              </div>

              <div className='asignacionAF_SecondColumn'>
                <h2> Asignación del Activo Fijo </h2>

                <div className='divInfoAsignación'>
                  <div>
                    <span>ℹ️</span> <strong>Información:</strong>

                    <p>
                      Para realizar cambios en la asignación del activo fijo, dirígete a la sección <strong>Movimientos de Activos</strong>. Los campos a continuación son solo informativos.
                    </p>
                  </div>

                </div>

                <section className='inputs_asignacionAF'>

                  <label >
                    *Tipo de Movimiento:
                    <select
                      value={tipoMovimiento || ''}
                      onChange={(e) => setTipoMovimiento(Number(e.target.value))}
                      disabled
                    >
                      <option value="" disabled>Seleccione un tipo de movimiento</option>
                      {Array.isArray(tipoMovimientoAF) && tipoMovimientoAF.map((tipomovimiento, index) => (
                        <option key={`tipoMovEditAF-${tipomovimiento.id_tipomovimientoaf}-${index}`} value={tipomovimiento.id_tipomovimientoaf}>
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
                      disabled
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
                      disabled
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
                    Motivo de asignación:
                    <textarea
                      value={motivoMovimiento}
                      onChange={(e) => setMotivoMovimiento(e.target.value)}
                      className='textarea_motivoMovimientoAF'
                      placeholder="Ej: Asignación inicial, nuevo empleado, etc."
                      disabled
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
  )

}

export default EditActivoFijo;

