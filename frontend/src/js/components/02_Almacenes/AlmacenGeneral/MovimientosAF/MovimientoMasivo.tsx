import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '@/store/store';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import {
    editMovimientoActivoFijo,
    getMovimientosActivosFijos,
    getTipoMovimientosActivosFijos,
    getVWmovimientosActivosFijos,
} from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { MovimientosActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getFechaHoraActual } from '@/utils/dateFormat';

import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/movimientoMasivo.css';

Modal.setAppElement('#root');

interface ResumenActivo {
    nombre: string;
    cantidad: number;
}

interface ResponsableOrigenOption {
    nombreCompleto: string;
    cantidadActivos: number;
}

const nombreCompletoEmpleado = (empleado: {
    nombre_empleado: string;
    apellido_paterno: string;
    apellido_materno: string;
}) => `${empleado.nombre_empleado} ${empleado.apellido_paterno} ${empleado.apellido_materno}`.trim();

const AlmacenGeneral_MovimientoMasivo: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const empleados = useSelector((state: RootState) => state.empleados.empleados);
    const activosMovimientos = useSelector((state: RootState) => state.vwMovimientosAF.activosMovimientos);
    const movimientosAF = useSelector((state: RootState) => state.movimientosAF.movimientosAF);
    const tiposMovimiento = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);

    const [responsableOrigen, setResponsableOrigen] = useState<string>('');
    const [responsableDestino, setResponsableDestino] = useState<number>(0);
    const [tipoMovimientoSeleccionado, setTipoMovimientoSeleccionado] = useState<number>(0);
    const [motivoMovimiento, setMotivoMovimiento] = useState<string>('Reasignacion masiva de activos');
    const [isModalActivosOpen, setIsModalActivosOpen] = useState<boolean>(false);
    const [procesando, setProcesando] = useState<boolean>(false);

    useEffect(() => {
        if (!empleados.length) dispatch(getEmpleados());
        if (!activosMovimientos.length) dispatch(getVWmovimientosActivosFijos());
        if (!movimientosAF.length) dispatch(getVWmovimientosActivosFijos());
        if (!tiposMovimiento.length) dispatch(getTipoMovimientosActivosFijos());
    }, [dispatch, empleados.length, activosMovimientos.length, movimientosAF.length, tiposMovimiento.length]);

    useEffect(() => {
        if (tiposMovimiento.length > 0 && tipoMovimientoSeleccionado === 0) {
            setTipoMovimientoSeleccionado(tiposMovimiento[0].id_tipomovimientoaf || 0);
        }
    }, [tiposMovimiento, tipoMovimientoSeleccionado]);



    const empleadosActivos = useMemo(
        () => empleados.filter((empleado) => empleado.estatus_activo),
        [empleados]
    );

    const empleadoPorId = useMemo(() => {
        const map = new Map<number, string>();
        empleadosActivos.forEach((empleado) => {
            if (empleado.id_empleado) {
                map.set(empleado.id_empleado, nombreCompletoEmpleado(empleado));
            }
        });
        return map;
    }, [empleadosActivos]);

    const ultimoMovimientoPorActivo = useMemo(() => {
        const map = new Map<number, MovimientosActivosFijos>();

        for (const movimiento of movimientosAF) {
            const idActivo = Number(movimiento.id_activo_fijo);
            const fechaActual = new Date(movimiento.fecha_movimiento || '').getTime();
            const fechaAnterior = map.has(idActivo)
                ? new Date(map.get(idActivo)?.fecha_movimiento || '').getTime()
                : 0;

            if (!Number.isNaN(idActivo) && (!map.has(idActivo) || fechaActual >= fechaAnterior)) {
                map.set(idActivo, movimiento);
            }
        }

        return map;
    }, [movimientosAF]);


    const responsablesConActivos = useMemo<ResponsableOrigenOption[]>(() => {
        const conteo = new Map<string, number>();

        activosMovimientos.forEach((activo) => {
            const idActivo = Number(activo.id_activo_fijo);
            const responsableVista = (activo.responsable_actual_completo || '').trim();
            const responsableFallback =
                !Number.isNaN(idActivo) && ultimoMovimientoPorActivo.get(idActivo)?.id_responsable_actual
                    ? empleadoPorId.get(Number(ultimoMovimientoPorActivo.get(idActivo)?.id_responsable_actual)) || ''
                    : '';

            const responsable = (responsableVista || responsableFallback).trim();
            if (!responsable) return;
            conteo.set(responsable, (conteo.get(responsable) || 0) + 1);
        });

        return Array.from(conteo.entries())
            .map(([nombreCompleto, cantidadActivos]) => ({
                nombreCompleto,
                cantidadActivos,
            }))
            .sort((a, b) => b.cantidadActivos - a.cantidadActivos);
    }, [activosMovimientos, ultimoMovimientoPorActivo, empleadoPorId]);

    const responsableOrigenSeleccionado = useMemo(
        () => responsablesConActivos.find((item) => item.nombreCompleto === responsableOrigen),
        [responsablesConActivos, responsableOrigen]
    );

    const activosDelOrigen = useMemo(() => {
        if (!responsableOrigen) return [];
        return activosMovimientos.filter(
            (activo) => {
                const idActivo = Number(activo.id_activo_fijo);
                const responsableVista = (activo.responsable_actual_completo || '').trim();
                const responsableFallback =
                    !Number.isNaN(idActivo) && ultimoMovimientoPorActivo.get(idActivo)?.id_responsable_actual
                        ? empleadoPorId.get(Number(ultimoMovimientoPorActivo.get(idActivo)?.id_responsable_actual)) || ''
                        : '';

                return (responsableVista || responsableFallback).trim() === responsableOrigen;
            }
        );
    }, [activosMovimientos, responsableOrigen, ultimoMovimientoPorActivo, empleadoPorId]);

    const resumenActivosOrigen = useMemo<ResumenActivo[]>(() => {
        const map = new Map<string, number>();
        activosDelOrigen.forEach((activo) => {
            const nombre = activo.nombre_af || 'Sin nombre';
            map.set(nombre, (map.get(nombre) || 0) + 1);
        });
        return Array.from(map.entries())
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);
    }, [activosDelOrigen]);

    const destinosDisponibles = useMemo(() => {
        return empleadosActivos.filter((empleado) => {
            if (!responsableOrigen) return true;
            return nombreCompletoEmpleado(empleado) !== responsableOrigen;
        });
    }, [empleadosActivos, responsableOrigen]);

    const handleTransferenciaMasiva = async () => {
        if (!responsableOrigen || !responsableDestino) {
            Swal.fire('Faltan datos', 'Selecciona empleado origen y destino.', 'warning');
            return;
        }

        const destinoSeleccionado = destinosDisponibles.find((empleado) => empleado.id_empleado === responsableDestino);
        if (destinoSeleccionado && nombreCompletoEmpleado(destinoSeleccionado) === responsableOrigen) {
            Swal.fire('Seleccion invalida', 'El destino debe ser distinto al origen.', 'warning');
            return;
        }

        if (!tipoMovimientoSeleccionado) {
            Swal.fire('Falta tipo de movimiento', 'Selecciona el tipo de movimiento.', 'warning');
            return;
        }

        if (!motivoMovimiento.trim()) {
            Swal.fire('Falta motivo', 'Escribe el motivo del movimiento.', 'warning');
            return;
        }

        if (activosDelOrigen.length === 0) {
            Swal.fire('Sin activos', 'El empleado origen no tiene activos asignados.', 'info');
            return;
        }

        const confirmacion = await Swal.fire({
            icon: 'question',
            title: 'Confirmar Traspaso Masivo',
            html: `
                <div style="text-align:left; line-height:1.6">
                    <p><strong>Cantidad total de activos:</strong> ${activosDelOrigen.length}</p>
                    <p><strong>Empleado origen:</strong> ${responsableOrigenSeleccionado?.nombreCompleto || 'No definido'}</p>
                    <p><strong>Empleado destino:</strong> ${destinosDisponibles.find((empleado) => empleado.id_empleado === responsableDestino)
                    ? nombreCompletoEmpleado(destinosDisponibles.find((empleado) => empleado.id_empleado === responsableDestino)!)
                    : 'No definido'}</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Sí, Traspasar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        setProcesando(true);

        let movidos = 0;
        let omitidos = 0;

        try {
            for (const activo of activosDelOrigen) {
                const idActivo = activo.id_activo_fijo;
                if (!idActivo) {
                    omitidos += 1;
                    continue;
                }

                const ultimoMovimiento = ultimoMovimientoPorActivo.get(Number(idActivo));

                if (!ultimoMovimiento) {
                    omitidos += 1;
                    continue;
                }

                const movimientoEditado: MovimientosActivosFijos = {
                    id_movimientoAF: ultimoMovimiento.id_movimientoAF,
                    id_activo_fijo: idActivo,
                    id_tipo_movimiento: tipoMovimientoSeleccionado,
                    motivo_movimiento: motivoMovimiento.trim(),
                    fecha_movimiento: getFechaHoraActual(),
                    id_responsable_anterior: ultimoMovimiento.id_responsable_actual || null,
                    id_responsable_actual: responsableDestino,
                    id_ubicacion_anterior: ultimoMovimiento.id_ubicacion_actual || ultimoMovimiento.id_ubicacion_anterior || null,
                    id_ubicacion_actual: ultimoMovimiento.id_ubicacion_actual || ultimoMovimiento.id_ubicacion_anterior || null,
                };

                const resultado = await dispatch(editMovimientoActivoFijo(movimientoEditado)).unwrap();
                if (resultado.success) {
                    movidos += 1;
                } else {
                    omitidos += 1;
                }
            }

            await dispatch(getMovimientosActivosFijos()).unwrap();
            await dispatch(getVWmovimientosActivosFijos()).unwrap();

            Swal.fire(
                'Movimiento masivo completado',
                `Activos movidos: ${movidos}. Omitidos: ${omitidos}.`,
                movidos > 0 ? 'success' : 'warning'
            );

            setResponsableOrigen('');
            setResponsableDestino(0);
            setIsModalActivosOpen(false);
        } catch (error) {
            console.error('Error en movimiento masivo:', error);
            Swal.fire('Error', 'No se pudo completar el movimiento masivo.', 'error');
        } finally {
            setProcesando(false);
        }
    };

    return (
        <>
            <div className='divMovimientoMasivo'>

                <section className='sectionEmpleadoActivos'>

                    <h3>Empleados con Activos Asignados</h3>

                    <div className='infoEmpleadoOrigen'>
                        <label>Empleado Origen</label>
                        <select
                            value={responsableOrigen}
                            onChange={(e) => {
                                setResponsableOrigen(e.target.value);
                                setResponsableDestino(0);
                            }}
                        >
                            <option value=''>Selecciona un Empleado</option>
                            {responsablesConActivos.map((empleado) => (
                                <option key={empleado.nombreCompleto} value={empleado.nombreCompleto}>
                                    {empleado.nombreCompleto} ({empleado.cantidadActivos})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='divButton'>
                        <button
                            className='buttonActivosEmpleado'
                            disabled={!responsableOrigenSeleccionado}
                            onClick={() => setIsModalActivosOpen(true)}
                        >
                            Ver Lista de Activos ({activosDelOrigen.length})
                        </button>

                    </div>

                </section>

                <section className='sectionEmpleadoDestino'>
                    <h3>Empleado Destino</h3>

                    <div className='infoEmpleadoDestino'>
                        <label>Responsable Destino</label>
                        <select
                            value={responsableDestino}
                            onChange={(e) => setResponsableDestino(Number(e.target.value))}
                            disabled={!responsableOrigen}
                        >
                            <option value={0}>Selecciona Destino</option>
                            {destinosDisponibles.map((empleado) => (
                                <option key={empleado.id_empleado} value={empleado.id_empleado}>
                                    {nombreCompletoEmpleado(empleado)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='infoEmpleadoDestino'>
                        <label>Tipo de Movimiento</label>
                        <select
                            value={tipoMovimientoSeleccionado}
                            onChange={(e) => setTipoMovimientoSeleccionado(Number(e.target.value))}
                        >
                            <option value={0}>Selecciona Tipo</option>
                            {tiposMovimiento.map((tipo) => (
                                <option key={tipo.id_tipomovimientoaf} value={tipo.id_tipomovimientoaf}>
                                    {tipo.nombre_tipomovimientoaf}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='infoEmpleadoDestino'>
                        <label>Motivo</label>
                        <textarea
                            value={motivoMovimiento}
                            onChange={(e) => setMotivoMovimiento(e.target.value)}
                            placeholder='Describe motivo del movimiento masivo'
                        />
                    </div>

                    <div className='divButton'>

                        <button
                            className='buttonSubmit'
                            disabled={
                                procesando ||
                                !responsableOrigen ||
                                !responsableDestino ||
                                activosDelOrigen.length === 0 ||
                                !motivoMovimiento.trim()
                            }
                            onClick={handleTransferenciaMasiva}
                        >
                            {procesando ? 'Procesando...' : `Mover ${activosDelOrigen.length} activos`}
                        </button>

                    </div>

                </section>
            </div>

            <Modal
                isOpen={isModalActivosOpen}
                onRequestClose={() => setIsModalActivosOpen(false)}
                className='modalActivosEmpleado'
                shouldCloseOnEsc={true}
                shouldCloseOnOverlayClick={true}
            >
                <div className='modalContainer'>

                    <div className='modalHeader'>
                        <h3>
                            Activos Asignados a:
                            <p>
                                {responsableOrigenSeleccionado?.nombreCompleto || 'empleado seleccionado'}

                            </p>
                        </h3>

                        <button type='button' className='buttonClose' onClick={() => setIsModalActivosOpen(false)}>Cerrar</button>
                    </div>

                    <p className='modalSubtitle'>Total activos: {activosDelOrigen.length}</p>

                    <div className='modalTable'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Activo</th>
                                    <th className='thCantidad'>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumenActivosOrigen.map((item) => (
                                    <tr key={item.nombre}>
                                        <td>{item.nombre}</td>
                                        <td className='tdCantidad'>{item.cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

            </Modal>
        </>
    );
};

export default AlmacenGeneral_MovimientoMasivo;
