import React, { useEffect } from 'react';
import Modal from 'react-modal';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { getTipoMovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';

// Components
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Types
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Facturas/modalAsignacionesAF.css';


interface AsignacionesAFProps {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: () => void;
    onActivosCreados: ActivoFactura[];
    onActivosChange: (activos: ActivoFactura[]) => void;
};

Modal.setAppElement('#root');

const AsignacionesAF: React.FC<AsignacionesAFProps> = ({ isOpen, onClose, onGuardar, onActivosCreados, onActivosChange }) => {
    if (!isOpen) return null;
    const dispatch = useDispatch<AppDispatch>();

    const empleados = useSelector((state: RootState) => state.empleados.empleados);
    const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);
    const tipoMovimientoAF = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);

    useEffect(() => {
        if (!empleados?.length) {
            dispatch(getEmpleados());
        }
        if (!ubicaciones?.length) {
            dispatch(getUbicaciones());
        }
        if (!tipoMovimientoAF?.length) {
            dispatch(getTipoMovimientosActivosFijos());
        }
    }, [dispatch, empleados.length, ubicaciones.length, tipoMovimientoAF.length]);

    const handleSerieChange = (index: number, serie: string) => {
        const nuevosActivos = [...onActivosCreados];
        nuevosActivos[index] = {
            ...nuevosActivos[index],
            numero_serie_af: serie,
        };
        onActivosChange(nuevosActivos);
    };

    const handleResponsableChange = (index: number, responsableId: number) => {
        const nuevosActivos = [...onActivosCreados];
        nuevosActivos[index] = {
            ...nuevosActivos[index],
            id_responsable_actual: responsableId,
        };
        onActivosChange(nuevosActivos);
    };

    const handleUbicacionChange = (index: number, ubicacionId: number) => {
        const nuevosActivos = [...onActivosCreados];
        nuevosActivos[index] = {
            ...nuevosActivos[index],
            id_ubicacion_actual: ubicacionId,
        };
        onActivosChange(nuevosActivos);
    };

    const handleTipoMovimientoChange = (index: number, tipoMovimientoId: number) => {
        const nuevosActivos = [...onActivosCreados];
        nuevosActivos[index] = {
            ...nuevosActivos[index],
            id_tipo_movimiento: tipoMovimientoId,
        };
        onActivosChange(nuevosActivos);
    };



    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modalComponent_AlmacenAF"
        >
            <div className="modalAsignacionesAF">
                <h2>Asignaciones de {onActivosCreados[0]?.nombre_af}</h2>

                <section className='sectionActivosCreados'>
                    {onActivosCreados.length > 0 ? (
                        <div className="divActivosCreados">
                            {onActivosCreados.map((activo, index) => (
                                <div key={index} className="divActivoItem">

                                    <div className='divSeries'>
                                        <p> Número de Serie</p>

                                        <label className='labelSerie'>
                                            <input
                                                type="text"
                                                value={activo.numero_serie_af}
                                                onChange={(e) => handleSerieChange(index, e.target.value)}
                                            />
                                        </label>

                                    </div>

                                    <div className="divAsignacion">

                                        <p>Asignar a</p>

                                        <select
                                            value={activo.id_responsable_actual || ''}
                                            onChange={(e) => handleResponsableChange(index, Number(e.target.value) || 0)}
                                        >
                                            <option value="">Selecciona un empleado</option>
                                            {empleados.map((empleado) => (
                                                <option key={empleado.id_empleado} value={empleado.id_empleado}>
                                                    {empleado.nombre_empleado} {empleado.apellido_paterno} {empleado.apellido_materno}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    <div className="divAsignacion">

                                        <p>Ubicación actual</p>

                                        <select
                                            value={activo.id_ubicacion_actual || ''}
                                            onChange={(e) => handleUbicacionChange(index, Number(e.target.value) || 0)}
                                        >
                                            <option value="">Selecciona una ubicación</option>
                                            {ubicaciones.map((ubicacion) => (
                                                <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                                                    {ubicacion.nombre_ubicacion}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    <div className="divAsignacion">

                                        <p>Tipo de movimiento</p>

                                        <select
                                            value={activo.id_tipo_movimiento || ''}
                                            onChange={(e) => handleTipoMovimientoChange(index, Number(e.target.value) || 0)}
                                        >
                                            <option value="">Selecciona un tipo</option>
                                            {tipoMovimientoAF.map((tipo) => (
                                                <option key={tipo.id_tipomovimientoaf} value={tipo.id_tipomovimientoaf}>
                                                    {tipo.nombre_tipomovimientoaf}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                </div>
                            ))}
                        </div>

                    ) : (
                        <p>No hay activos creados para asignar.</p>
                    )}

                </section>



                <ModalButtons
                    buttons={[
                        {
                            text: 'Guardar',
                            type: 'submit',
                            className: 'button_addedit',
                            onClick: onGuardar
                        },
                        {
                            text: 'Cancelar',
                            type: 'button',
                            className: 'button_close',
                            onClick: onClose
                        }
                    ]}
                />
            </div>



        </Modal>
    );
};

export default AsignacionesAF;