import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { ActivoConDepreciacion, MetodoDepreciacion } from '@/@types/AlmacenGeneralTypes/depreciacionTypes';
import { fetchActivosSinDepreciar, activarDepreciacion, fetchActivosEnDepreciacion, fetchMetodosDepreciacion, calcularDepreciacionManual, fetchHistoricoDepreciaciones } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { setActivosEnDepreciacion, setActivosSinDepreciar, setMetodosDepreciacion, setHistoricoDepreciaciones } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFReducer';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { formatMexicanCurrency, toSafeNumber } from '@/utils/numbersFormat';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import Swal from 'sweetalert2';

import '@styles/03_Contabilidad/DepreciacionAF/listActivosDepreciacion.css'

Modal.setAppElement('#root');

const ListActivosDepreciacion: React.FC = () => {

    const [isOpenActivosSinDepreciar, setIsOpenActivosSinDepreciar] = useState(true);
    const [isOpenActivosEnDepreciacion, setIsOpenActivosEnDepreciacion] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const activosSinDepreciar = useSelector((state: RootState) => state.depreciacionAF.activosSinDepreciar as ActivoConDepreciacion[]);
    const activosEnDepreciacion = useSelector((state: RootState) => state.depreciacionAF.activosEnDepreciacion as ActivoConDepreciacion[]);
    const historicoDepreciaciones = useSelector((state: RootState) => state.depreciacionAF.historicoDepreciaciones);

    const [modalOpen, setModalOpen] = useState(false);
    const [activoSinDepreciarSeleccionado, setActivoSinDepreciarSeleccionado] = useState<ActivoConDepreciacion | null>(null);
    const [vidaUtil, setVidaUtil] = useState<number | ''>('');
    const [valorResidual, setValorResidual] = useState<number | ''>('');
    const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | null>(null);

    const [detallesModalOpen, setDetallesModalOpen] = useState(false);
    const [activoEnDepreciacionSeleccionado, setActivoEnDepreciacionSeleccionado] = useState<ActivoConDepreciacion | null>(null);

    const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
    const [activoHistoricoSeleccionado, setActivoHistoricoSeleccionado] = useState<ActivoConDepreciacion | null>(null);

    const getUltimaDepreciacion = (activo: ActivoConDepreciacion) => {
        return (activo as any).ultima_depreciacion ?? (activo as any).ultimaDepreciacion ?? null;
    };


    const handleOpcionAFSinDepreciar = () => {
        setIsOpenActivosEnDepreciacion(false);
        setIsOpenActivosSinDepreciar(true);
    }

    const handleOpcionAFenDepreciacion = () => {
        setIsOpenActivosSinDepreciar(false);
        setIsOpenActivosEnDepreciacion(true);
    }

    const metodosDepreciacion = useSelector((state: RootState) => state.depreciacionAF.metodosDepreciacion as MetodoDepreciacion[]);

    useEffect(() => {
        const cargarAFSinDepreciar = async () => {
            try {
                const result = await dispatch(fetchActivosSinDepreciar()).unwrap();
                if (result && result.success && result.activos) {
                    dispatch(setActivosSinDepreciar(result.activos));
                }
            } catch (err) {
                console.error('Error cargando activos sin depreciar', err);
            }
        };

        const cargarAFEnDepreciacion = async () => {
            try {
                const result = await dispatch(fetchActivosEnDepreciacion()).unwrap();
                if (result && result.success && result.activos) {
                    dispatch(setActivosEnDepreciacion(result.activos));
                }
            } catch (err) {
                console.error('Error cargando activos en depreciación', err);
            }
        };

        const cargarMetodos = async () => {
            try {
                const res = await dispatch(fetchMetodosDepreciacion()).unwrap();
                if (res && res.success && res.metodos) dispatch(setMetodosDepreciacion(res.metodos));
            } catch (e) {
                console.error('Error cargando métodos de depreciación', e);
            }
        };

        cargarAFSinDepreciar();
        cargarAFEnDepreciacion();
        cargarMetodos();

    }, [isOpenActivosSinDepreciar, isOpenActivosEnDepreciacion, dispatch]);

    // Cálculos de KPIs
    const kpisData = React.useMemo(() => {
        const activosConDepreciacion = activosEnDepreciacion || [];
        const activosPendientes = activosSinDepreciar || [];

        const depreciacionAcumuladaTotal = activosConDepreciacion.reduce(
            (sum, activo) => sum + toSafeNumber(getUltimaDepreciacion(activo)?.valor_depreciacion_acumulada),
            0,
        );

        const valorEnLibrosTotal = activosConDepreciacion.reduce(
            (sum, activo) => sum + toSafeNumber(getUltimaDepreciacion(activo)?.valor_libros_af),
            0,
        );

        const depreciacionAnualTotal = activosConDepreciacion.reduce(
            (sum, activo) => sum + toSafeNumber(getUltimaDepreciacion(activo)?.valor_depreciacion_anual),
            0,
        );

        const valorActivosPorDepreciar = activosPendientes.reduce(
            (sum, activo) => sum + toSafeNumber(activo.costo_unitario_af),
            0,
        );

        // Próximos vencimientos: ultimos 5 activos con menos años útil
        const proximosVencimientos = [...activosConDepreciacion]
            .filter(a => a.fecha_vencimiento_depreciacion)
            .sort((a, b) => {
                const fechaA = a.fecha_vencimiento_depreciacion ? new Date(a.fecha_vencimiento_depreciacion).getTime() : Number.POSITIVE_INFINITY;
                const fechaB = b.fecha_vencimiento_depreciacion ? new Date(b.fecha_vencimiento_depreciacion).getTime() : Number.POSITIVE_INFINITY;
                return fechaA - fechaB;
            })
            .slice(0, 5);

        return {
            depreciacionAcumuladaTotal,
            valorEnLibrosTotal,
            depreciacionAnualTotal,
            valorActivosPorDepreciar,
            proximosVencimientos,
        };
    }, [activosEnDepreciacion, activosSinDepreciar]);



    const openActivarModal = (activo: ActivoConDepreciacion) => {
        setActivoSinDepreciarSeleccionado(activo);
        setVidaUtil('');
        setValorResidual('');
        setMetodoSeleccionado(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActivoSinDepreciarSeleccionado(null);
    };

    const openDetallesModal = (activo: ActivoConDepreciacion) => {
        setActivoEnDepreciacionSeleccionado(activo);
        setDetallesModalOpen(true);
    };

    const closeDetallesModal = () => {
        setDetallesModalOpen(false);
        setActivoEnDepreciacionSeleccionado(null);
    };

    const closeHistoricoModal = () => {
        setHistoricoModalOpen(false);
        setActivoHistoricoSeleccionado(null);
        dispatch(setHistoricoDepreciaciones([]));
    };

    const handleConfirmarActivar = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!activoSinDepreciarSeleccionado) return;

        if (!metodoSeleccionado) {
            Swal.fire({ icon: 'warning', title: 'Método requerido', text: 'Selecciona un método de depreciación.' });
            return;
        }

        if (vidaUtil === '' || Number(vidaUtil) < 1) {
            Swal.fire({ icon: 'warning', title: 'Vida útil requerida', text: 'La vida útil es obligatoria y debe ser mayor a 0.' });
            return;
        }

        if (valorResidual === '' || Number(valorResidual) < 0) {
            Swal.fire({ icon: 'warning', title: 'Valor residual requerido', text: 'El valor residual es obligatorio y no puede ser negativo.' });
            return;
        }

        const payload = {
            fecha_inicio_depreciacion: new Date().toISOString().split('T')[0], // Solo la fecha, sin hora
            vida_util_anios: Number(vidaUtil),
            valor_residual_af: Number(valorResidual),
            id_metodo_depreciacion: metodoSeleccionado,
        } as any;

        try {
            const result = await dispatch(activarDepreciacion({ idActivo: activoSinDepreciarSeleccionado.id_activo_fijo!, payload })).unwrap();
            if (result && result.success) {
                const res = await dispatch(fetchActivosSinDepreciar()).unwrap();
                if (res && res.success && res.activos) dispatch(setActivosSinDepreciar(res.activos));
                Swal.fire({ icon: 'success', title: 'Depreciación activada', text: 'La depreciación se activó correctamente.', timer: 1500, showConfirmButton: false });
                closeModal();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'Error al activar depreciación' });
                console.log('Error detalle:', result);
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al activar depreciación' });
        }
    };

    const handleRecalcularDepreciacion = async (activo: ActivoConDepreciacion) => {
        const currentYear = new Date().getFullYear();

        const result = await Swal.fire({
            icon: 'question',
            title: 'Recalcular Depreciación',
            text: `Captura el año para recalcular la depreciación de ${activo.nombre_af}.`,
            input: 'number',
            inputValue: currentYear,
            inputAttributes: {
                min: '1',
                step: '1',
            },
            showCancelButton: true,
            confirmButtonText: 'Calcular',
            cancelButtonText: 'Cancelar',
            preConfirm: (value) => {
                const anio = Number(value);
                if (!anio || anio < 1) {
                    Swal.showValidationMessage('Ingresa un año válido mayor a 0');
                    return false;
                }
                return anio;
            },
        });

        if (!result.isConfirmed || typeof result.value !== 'number') return;

        try {
            const response = await dispatch(calcularDepreciacionManual({ idActivo: activo.id_activo_fijo!, anio: result.value })).unwrap();

            if (response && response.success) {
                const actualizado = await dispatch(fetchActivosEnDepreciacion()).unwrap();
                if (actualizado && actualizado.success && actualizado.activos) {
                    dispatch(setActivosEnDepreciacion(actualizado.activos));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Depreciación recalculada',
                    text: 'El cálculo se realizó correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                const message = response.message || 'No se pudo recalcular la depreciación';
                const isDuplicate = /ya existe|llave duplicada|unique violation/i.test(message);

                Swal.fire({
                    icon: isDuplicate ? 'warning' : 'error',
                    title: isDuplicate ? 'Depreciación ya registrada' : 'Error',
                    text: isDuplicate
                        ? message
                        : message,
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo recalcular la depreciación' });
        }
    };

    const handleVerHistoricoDepreciacion = async (activo: ActivoConDepreciacion) => {
        try {
            const response = await dispatch(fetchHistoricoDepreciaciones(activo.id_activo_fijo!)).unwrap();

            if (response && response.success) {
                dispatch(setHistoricoDepreciaciones(response.historico || []));
                setActivoHistoricoSeleccionado(activo);
                setHistoricoModalOpen(true);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin histórico',
                    text: response.message || 'No hay registros históricos para este activo.',
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el histórico de depreciación' });
        }
    };

    const renderListAFSinDepreciar = () => (
        <div className='depreciacionTableContainer'>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Costo</th>
                        <th>Clasificación</th>
                        <th>Estatus</th>
                        <th id="th_Acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {activosSinDepreciar && activosSinDepreciar.length > 0 ? (
                        activosSinDepreciar.map((a) => (
                            <tr key={a.id_activo_fijo}>
                                <td>{a.id_activo_fijo}</td>
                                <td>{a.codigo_unico || a.codigo_etiqueta || '-'}</td>
                                <td>{a.nombre_af}</td>
                                <td>{formatMexicanCurrency(a.costo_unitario_af)}</td>
                                <td>{(a as any).clasificacion?.nombre_clasificacion || '-'}</td>
                                <td>{(a as any).estado?.descripcion_estatusaf || '-'}</td>
                                <td id="td_Acciones">
                                    <button className="buttonActivar" onClick={() => openActivarModal(a)}>Activar</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7}>No hay activos sin depreciar</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderListAFenDepreciacion = () => (
        <div className='depreciacionTableContainer'>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Costo Unitario</th>
                        <th>Valor en Libros</th>
                        <th>Depreciación Acumulada</th>
                        <th>Depreciación Anual</th>
                        <th>Método</th>
                        <th>Vida Útil (años)</th>
                        <th>Última Actualización</th>
                        <th id="th_Acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {activosEnDepreciacion && activosEnDepreciacion.length > 0 ? (
                        activosEnDepreciacion.map((a) => (
                            <tr key={a.id_activo_fijo}>
                                <td>{a.id_activo_fijo}</td>
                                <td>{a.codigo_unico || a.codigo_etiqueta || '-'}</td>
                                <td>{a.nombre_af}</td>
                                <td>{formatMexicanCurrency(a.costo_unitario_af)}</td>
                                <td><strong>{a.ultima_depreciacion?.valor_libros_af != null ? formatMexicanCurrency(a.ultima_depreciacion.valor_libros_af) : '-'}</strong></td>
                                <td>{a.ultima_depreciacion?.valor_depreciacion_acumulada != null ? formatMexicanCurrency(a.ultima_depreciacion.valor_depreciacion_acumulada) : '-'}</td>
                                <td>{a.ultima_depreciacion?.valor_depreciacion_anual != null ? formatMexicanCurrency(a.ultima_depreciacion.valor_depreciacion_anual) : '-'}</td>
                                <td>{a.ultima_depreciacion?.metodo_depreciacion?.nombre_metodo || '-'}</td>
                                <td>{a.ultima_depreciacion?.vida_util_anios ?? '-'}</td>
                                <td>{a.ultima_depreciacion?.fecha_calculo_depreciacion ? formatDateHorasToFrontend(a.ultima_depreciacion.fecha_calculo_depreciacion) : '-'}</td>
                                <td id="td_Acciones">
                                    <button className="buttonActivar" onClick={() => openDetallesModal(a)}>Detalles</button>
                                    <button className="buttonActivar" onClick={() => handleRecalcularDepreciacion(a)}>Recalcular</button>
                                    <button className="buttonActivar" onClick={() => handleVerHistoricoDepreciacion(a)}>Histórico</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={11}>No hay activos en depreciación</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <main className="main_ListActivosDepreciacion">
            <header className="header_KPIs">

                <div className="kpi-row-1">
                    <div className="cardKPI">
                        <h4>Total Faltantes</h4>
                        <p>{activosSinDepreciar?.length || 0}</p>
                        <span className="kpi-subtitle">Activos sin Depreciar</span>

                    </div>

                    <div className="cardKPI">
                        <h4>Total en Depreciación</h4>
                        <p>{activosEnDepreciacion?.length || 0}</p>
                        <span className="kpi-subtitle">Activos en Proceso</span>

                    </div>

                    <div className="cardKPI">
                        <h4>Depreciación Acumulada</h4>
                        <p>{formatMexicanCurrency(kpisData.depreciacionAcumuladaTotal)}</p>
                        <span className="kpi-subtitle">Monto en Activos</span>

                    </div>

                    <div className="cardKPI">
                        <h4>Valor en Libros Total</h4>
                        <p>{formatMexicanCurrency(kpisData.valorEnLibrosTotal)}</p>
                        <span className="kpi-subtitle">Monto en Activos</span>
                    </div>

                    <div className="cardKPI">
                        <h4>Depreciación Anual Total</h4>
                        <p>{formatMexicanCurrency(kpisData.depreciacionAnualTotal)}</p>
                        <span className="kpi-subtitle">Gasto anual</span>
                    </div>

                    <div className="cardKPI">
                        <h4>Total Valor Pendiente</h4>
                        <p>{formatMexicanCurrency(kpisData.valorActivosPorDepreciar)}</p>
                        <span className="kpi-subtitle">Exposición</span>
                    </div>
                </div>

                <div className="kpi-row-2">
                    <div className="cardKPI cardKPI-table">
                        <h4>Próximos 5 Vencimientos </h4>
                        <div className="kpi-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Activo</th>
                                        <th>Fecha Vencimiento</th>
                                        <th>Años Útil</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kpisData.proximosVencimientos.length > 0 ? (
                                        kpisData.proximosVencimientos.map((a) => (
                                            <tr key={a.id_activo_fijo}>
                                                <td>{a.codigo_unico || a.codigo_etiqueta || '-'}</td>
                                                <td>{a.nombre_af}</td>
                                                <td><strong>{a.fecha_vencimiento_depreciacion ? formatDateHorasToFrontend(a.fecha_vencimiento_depreciacion) : '-'}</strong></td>
                                                <td>{a.ultima_depreciacion?.vida_util_anios ?? '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>Sin datos</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </header>
            <hr />

            <div className="divButtonsDepreciacion">
                <button
                    className={isOpenActivosSinDepreciar ? 'active' : ''}
                    onClick={handleOpcionAFSinDepreciar}
                >
                    Activos Sin Depreciar
                </button>

                <button
                    className={isOpenActivosEnDepreciacion ? 'active' : ''}
                    onClick={handleOpcionAFenDepreciacion}
                >
                    Activos en Depreciación
                </button>
            </div>

            <section className='tableContainer'>
                {isOpenActivosSinDepreciar ? renderListAFSinDepreciar() :
                    isOpenActivosEnDepreciacion ? renderListAFenDepreciacion() :
                        <p>Selecciona una opción para mostrar los activos</p>
                }
            </section>

            <Modal
                isOpen={modalOpen && activoSinDepreciarSeleccionado !== null}
                onRequestClose={closeModal}
                className="modalComponent_DepreciacionAF"
            >
                {activoSinDepreciarSeleccionado && (
                    <div className="modalDepreciacionAF">
                        <h3>Activar Depreciación</h3>
                        <p className="modalSubtitle">{activoSinDepreciarSeleccionado.nombre_af}</p>

                        <div className='divInputs_RecalcularDepreciacionAF'>


                            <form onSubmit={handleConfirmarActivar} className="depreciacionModalForm">
                                <label>
                                    Vida útil (años)
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Ingrese la vida útil"
                                        value={vidaUtil}
                                        onChange={(e) => setVidaUtil(e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                    />
                                </label>

                                <label>
                                    Valor residual
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        placeholder="Ingrese el valor residual"
                                        value={valorResidual}
                                        onChange={(e) => setValorResidual(e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                    />
                                </label>

                                <label>
                                    Método
                                    <select
                                        value={metodoSeleccionado ?? ''}
                                        onChange={(e) => setMetodoSeleccionado(e.target.value ? Number(e.target.value) : null)}
                                        required
                                    >
                                        <option value="" disabled>Seleccionar un método</option>
                                        {metodosDepreciacion && metodosDepreciacion.map((m) => (
                                            <option key={m.id_metodo_depreciacion} value={m.id_metodo_depreciacion}>
                                                {m.nombre_metodo}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <ModalButtons
                                    buttons={[
                                        { text: 'Confirmar', type: 'submit', className: 'button_addedit' },
                                        { text: 'Cancelar', type: 'button', className: 'button_close', onClick: closeModal }
                                    ]}
                                />
                            </form>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={detallesModalOpen && activoEnDepreciacionSeleccionado !== null}
                onRequestClose={closeDetallesModal}
                className="modalComponent_DepreciacionAF"
            >
                {activoEnDepreciacionSeleccionado && activoEnDepreciacionSeleccionado.ultima_depreciacion && (
                    <div className="modalDepreciacionAF">
                        <h3>Parámetros del Último Cálculo</h3>
                        <p className="modalSubtitle">{activoEnDepreciacionSeleccionado.nombre_af}</p>

                        <div className='divLabelsDetalles_DepreciacionAF'>
                            <div className="detalle-group">
                                <label>ID del Activo</label>
                                <p>{activoEnDepreciacionSeleccionado.id_activo_fijo}</p>
                            </div>

                            <div className="detalle-group">
                                <label>Costo Unitario</label>
                                <p>{formatMexicanCurrency(activoEnDepreciacionSeleccionado.costo_unitario_af)}</p>
                            </div>

                            <div className="detalle-group">
                                <label>Fecha Inicio Depreciación</label>
                                <p>{activoEnDepreciacionSeleccionado.ultima_depreciacion.fecha_inicio_depreciacion}</p>
                            </div>

                            <div className="detalle-group">
                                <label>Vida Útil (años)</label>
                                <p>{activoEnDepreciacionSeleccionado.ultima_depreciacion.vida_util_anios}</p>
                            </div>

                            <div className="detalle-group">
                                <label>Última Actualización</label>
                                <p>{activoEnDepreciacionSeleccionado.ultima_depreciacion.fecha_calculo_depreciacion ? formatDateHorasToFrontend(activoEnDepreciacionSeleccionado.ultima_depreciacion.fecha_calculo_depreciacion) : '-'}</p>
                            </div>


                            <div className="detalle-group">
                                <label>Método de Depreciación</label>
                                <p>{activoEnDepreciacionSeleccionado.ultima_depreciacion.metodo_depreciacion?.nombre_metodo || '-'}</p>
                            </div>

                            <hr />

                            <div className="detalle-group">
                                <label>Valor Residual</label>
                                <p>{formatMexicanCurrency(activoEnDepreciacionSeleccionado.ultima_depreciacion.valor_residual_af)}</p>
                            </div>

                            <div className="detalle-group">
                                <label>Valor Depreciación Anual</label>
                                <p><strong>{formatMexicanCurrency(activoEnDepreciacionSeleccionado.ultima_depreciacion.valor_depreciacion_anual)}</strong></p>
                            </div>

                            <div className="detalle-group">
                                <label>Depreciación Acumulada</label>
                                <p><strong>{formatMexicanCurrency(activoEnDepreciacionSeleccionado.ultima_depreciacion.valor_depreciacion_acumulada)}</strong></p>
                            </div>

                            <div className="detalle-group">
                                <label>Valor en Libros</label>
                                <p><strong>{formatMexicanCurrency(activoEnDepreciacionSeleccionado.ultima_depreciacion.valor_libros_af)}</strong></p>
                            </div>


                            <button className="button_close" onClick={closeDetallesModal} style={{ marginTop: '1rem', width: '100%' }}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={historicoModalOpen && activoHistoricoSeleccionado !== null}
                onRequestClose={closeHistoricoModal}
                className="modalComponent_HistoricoDepreciacion"
            >
                {activoHistoricoSeleccionado && (
                    <div className="modalDepreciacionHistorico">
                        <h3>Histórico de Depreciación</h3>
                        <p className="modalSubtitle">{activoHistoricoSeleccionado.nombre_af}</p>

                        <div className='historicoTableContainer'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Año</th>
                                        <th>Valor Inicial</th>
                                        <th>Dep. Anual</th>
                                        <th>Dep. Acumulada</th>
                                        <th>Valor en Libros</th>
                                        <th>Método</th>
                                        <th>Vida Útil</th>
                                        <th>Fecha Cálculo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoDepreciaciones.length > 0 ? (
                                        historicoDepreciaciones.map((activoHistorico) => (
                                            <tr key={activoHistorico.id_depreciacionaf}>
                                                <td>{activoHistorico.id_depreciacionaf}</td>
                                                <td>{activoHistorico.anio_depreciacionaf}</td>
                                                <td>{formatMexicanCurrency(activoHistorico.valor_inicialaf)}</td>
                                                <td>{formatMexicanCurrency(activoHistorico.valor_depreciacion_anual)}</td>
                                                <td>{formatMexicanCurrency(activoHistorico.valor_depreciacion_acumulada)}</td>
                                                <td><strong>{formatMexicanCurrency(activoHistorico.valor_libros_af)}</strong></td>
                                                <td>{activoHistorico.metodo_depreciacion?.nombre_metodo || '-'}</td>
                                                <td>{activoHistorico.vida_util_anios ?? '-'}</td>
                                                <td>{activoHistorico.fecha_calculo_depreciacion}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8' }}>
                                                Sin registros históricos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button className="button_close" onClick={closeHistoricoModal} style={{ marginTop: '1rem', width: '100%' }}>
                            Cerrar
                        </button>
                    </div>
                )}
            </Modal>
        </main>


    );
}


export default ListActivosDepreciacion;