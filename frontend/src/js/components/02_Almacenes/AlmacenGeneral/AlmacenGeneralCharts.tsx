import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { AppDispatch, RootState } from '@/store/store';
import {
    ActivosFijos,
    ClasificacionesAF,
    EstatusActivosFijos,
    VwMovimientosAF,
} from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { FacturasAF, TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { getActivosFijos, getEstatusActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { setListActivosFijos, setListEstatusActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';
import { getFacturas, getTiposFacturas } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer';
import { getVWmovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListvwMovimientosAF } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFReducer';
import '@styles/02_Almacenes/AlmacenGeneralCharts.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const parseDateValue = (value?: string | null): number => {
    if (!value) return 0;
    const fromNative = new Date(value).getTime();
    if (!Number.isNaN(fromNative)) return fromNative;

    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return 0;

    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const rebuilt = new Date(year, month, day).getTime();
    return Number.isNaN(rebuilt) ? 0 : rebuilt;
};

const AlmacenGeneralCharts: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const fetchedRef = useRef({
        activos: false,
        estatus: false,
        facturas: false,
        tiposFacturas: false,
        clasificaciones: false,
        movimientos: false,
    });

    const activos = useSelector((state: RootState) => state.activos.activosfijos);
    const estatusAF = useSelector((state: RootState) => state.activos.estatusActivoFijo);
    const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
    const tiposFacturas = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
    const clasificaciones = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);
    const activosMovimientos = useSelector((state: RootState) => state.vwMovimientosAF.activosMovimientos);

    useEffect(() => {
        const loadData = async () => {
            const tasks: Promise<void>[] = [];

            if (activos.length === 0 && !fetchedRef.current.activos) {
                fetchedRef.current.activos = true;
                tasks.push((async () => {
                    const resActivos = await dispatch(getActivosFijos()).unwrap();
                    if (resActivos.success && resActivos.activosFijos) {
                        dispatch(setListActivosFijos(resActivos.activosFijos));
                    }
                })());
            }

            if (estatusAF.length === 0 && !fetchedRef.current.estatus) {
                fetchedRef.current.estatus = true;
                tasks.push((async () => {
                    const resEstatus = await dispatch(getEstatusActivosFijos()).unwrap();
                    if (resEstatus.success && resEstatus.estatusAF) {
                        dispatch(setListEstatusActivosFijos(resEstatus.estatusAF as EstatusActivosFijos[]));
                    }
                })());
            }

            if (facturas.length === 0 && !fetchedRef.current.facturas) {
                fetchedRef.current.facturas = true;
                tasks.push((async () => {
                    const resFacturas = await dispatch(getFacturas()).unwrap();
                    if (resFacturas.success && resFacturas.facturas) {
                        dispatch(setFacturas(resFacturas.facturas));
                    }
                })());
            }

            if (tiposFacturas.length === 0 && !fetchedRef.current.tiposFacturas) {
                fetchedRef.current.tiposFacturas = true;
                tasks.push((async () => {
                    await dispatch(getTiposFacturas()).unwrap();
                })());
            }

            if (clasificaciones.length === 0 && !fetchedRef.current.clasificaciones) {
                fetchedRef.current.clasificaciones = true;
                tasks.push((async () => {
                    const resClasificaciones = await dispatch(getClasificaciones()).unwrap();
                    if (resClasificaciones.success && resClasificaciones.clasificacion) {
                        dispatch(setListClasificacion(resClasificaciones.clasificacion as ClasificacionesAF[]));
                    }
                })());
            }

            if (activosMovimientos.length === 0 && !fetchedRef.current.movimientos) {
                fetchedRef.current.movimientos = true;
                tasks.push((async () => {
                    const resVw = await dispatch(getVWmovimientosActivosFijos()).unwrap();
                    if (resVw.success && resVw.vwMovimientosAF) {
                        dispatch(setListvwMovimientosAF(resVw.vwMovimientosAF as VwMovimientosAF[]));
                    }
                })());
            }

            await Promise.allSettled(tasks);
        };

        loadData();
    }, [
        dispatch,
        activos.length,
        estatusAF.length,
        facturas.length,
        tiposFacturas.length,
        clasificaciones.length,
        activosMovimientos.length,
    ]);

    const totalFacturas = facturas.length;
    const totalActivos = activos.length;

    const totalActivosInactivos = useMemo(() => {
        if (activosMovimientos.length > 0) {
            return activosMovimientos.filter((a) => /dado de baja/i.test(a.estado_actual || '')).length;
        }

        const inactivoIds = new Set(
            estatusAF
                .filter((e) => /inactivo/i.test(e.descripcion_estatusaf || ''))
                .map((e) => e.id_estatusaf)
        );

        if (inactivoIds.size === 0) return 0;
        return activos.filter((a) => a.id_estado_af && inactivoIds.has(a.id_estado_af)).length;
    }, [activos, estatusAF, activosMovimientos]);

    const activosPorClasificacion = useMemo(() => {
        const map = new Map<string, number>();

        if (activosMovimientos.length > 0) {
            activosMovimientos.forEach((a) => {
                const key = a.clasificacion || 'Sin clasificacion';
                map.set(key, (map.get(key) || 0) + 1);
            });
        } else {
            const clasifMap = new Map<number, string>();
            clasificaciones.forEach((c) => {
                if (c.id_clasificacion) {
                    clasifMap.set(c.id_clasificacion, c.nombre_clasificacion);
                }
            });
            activos.forEach((a) => {
                const key = a.id_clasificacion ? (clasifMap.get(a.id_clasificacion) || 'Sin clasificacion') : 'Sin clasificacion';
                map.set(key, (map.get(key) || 0) + 1);
            });
        }

        const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
        return {
            labels: sorted.map(([k]) => k),
            values: sorted.map(([, v]) => v),
        };
    }, [activosMovimientos, activos, clasificaciones]);

    const movimientosStats = useMemo(() => {
        const porDepartamento = new Map<string, number>();
        const porUbicacion = new Map<string, number>();
        const porEmpleado = new Map<string, number>();

        activosMovimientos.forEach((a) => {
            porDepartamento.set(a.departamento_actual || 'Sin departamento', (porDepartamento.get(a.departamento_actual || 'Sin departamento') || 0) + 1);
            porUbicacion.set(a.ubicacion_actual || 'Sin ubicacion', (porUbicacion.get(a.ubicacion_actual || 'Sin ubicacion') || 0) + 1);
            porEmpleado.set(a.responsable_actual_completo || 'Sin responsable', (porEmpleado.get(a.responsable_actual_completo || 'Sin responsable') || 0) + 1);
        });

        const ultimos5MovimientosLocal = [...activosMovimientos]
            .sort((a, b) => {
                const fechaA = parseDateValue(a.fecha_ultimo_movimiento) || parseDateValue(a.created_at);
                const fechaB = parseDateValue(b.fecha_ultimo_movimiento) || parseDateValue(b.created_at);
                return fechaB - fechaA;
            })
            .slice(0, 5);

        const porTipoUltimos5 = new Map<string, number>();
        ultimos5MovimientosLocal.forEach((mov) => {
            const tipo = mov.tipo_movimiento || 'Sin tipo';
            porTipoUltimos5.set(tipo, (porTipoUltimos5.get(tipo) || 0) + 1);
        });

        return {
            activosPorDepartamento: Array.from(porDepartamento.entries()).sort((a, b) => b[1] - a[1]),
            activosPorUbicacion: Array.from(porUbicacion.entries()).sort((a, b) => b[1] - a[1]),
            activosPorEmpleado: Array.from(porEmpleado.entries()).sort((a, b) => b[1] - a[1]),
            ultimos5Movimientos: ultimos5MovimientosLocal,
            tiposUltimos5Movimientos: {
                labels: Array.from(porTipoUltimos5.keys()),
                values: Array.from(porTipoUltimos5.values()),
            },
        };
    }, [activosMovimientos]);

    const { activosPorDepartamento, activosPorUbicacion, activosPorEmpleado, ultimos5Movimientos, tiposUltimos5Movimientos } = movimientosStats;

    const facturasPorTipo = useMemo(() => {
        const map = new Map<string, number>();
        const tiposMap = new Map<number, string>();

        tiposFacturas.forEach((tipo: TiposFacturasAF) => {
            if (tipo.id_tipofacturaaf) {
                tiposMap.set(tipo.id_tipofacturaaf, tipo.nombre_tipofactura);
            }
        });

        facturas.forEach((f: FacturasAF) => {
            const key = tiposMap.get(f.id_tipo_factura) || `Tipo ${f.id_tipo_factura}`;
            map.set(key, (map.get(key) || 0) + 1);
        });
        const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
        return {
            labels: sorted.map(([k]) => k),
            values: sorted.map(([, v]) => v),
        };
    }, [facturas, tiposFacturas]);

    const ultimos5Activos = useMemo(() => {
        return [...activos]
            .sort((a: ActivosFijos, b: ActivosFijos) => (b.id_activo_fijo || 0) - (a.id_activo_fijo || 0))
            .slice(0, 5);
    }, [activos]);

    const getHeight = (items: number) => Math.max(260, Math.min(1000, items * 36));

    if (activos.length === 0 && facturas.length === 0 && activosMovimientos.length === 0) {
        return <p className="agc-loading">Cargando dashboard de Almacen General...</p>;
    }

    return (
        <div className="agc-wrapper">
            <div className="agc-kpi-grid">
                <div className="agc-kpi-card">
                    <h4>Total Facturas</h4>
                    <p>{totalFacturas}</p>
                </div>
                <div className="agc-kpi-card">
                    <h4>Total Activos</h4>
                    <p>{totalActivos}</p>
                </div>
                <div className="agc-kpi-card">
                    <h4>Total Bajas de Activos</h4>
                    <p>{totalActivosInactivos}</p>
                </div>
            </div>

            <div className="agc-main-grid">
                <section className="agc-card agc-card--clasificacion">
                    <h3>Activos Por Clasificacion</h3>
                    <Bar
                        data={{
                            labels: activosPorClasificacion.labels,
                            datasets: [{
                                label: 'Activos',
                                data: activosPorClasificacion.values,
                                backgroundColor: 'rgba(34, 197, 94, 0.75)',
                                borderColor: 'rgba(22, 163, 74, 1)',
                                borderWidth: 1,
                            }],
                        }}
                        options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                        }}
                        height={120}
                    />
                </section>

                <section className="agc-card agc-card--facturas">
                    <h3>Facturas Por Tipo</h3>
                    <Pie
                        data={{
                            labels: facturasPorTipo.labels,
                            datasets: [{
                                data: facturasPorTipo.values,
                                backgroundColor: ['#6366f1', '#f59e0b', '#14b8a6', '#ef4444', '#8b5cf6'],
                                borderColor: '#ffffff',
                                borderWidth: 2,
                            }],
                        }}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom' } },
                        }}
                        height={120}
                    />
                </section>

                <section className="agc-card agc-card--departamento">
                    <h3>Activos Por Departamento</h3>
                    <div className="agc-scroll-chart">
                        <div style={{ height: `${getHeight(activosPorDepartamento.length)}px` }}>
                            <Bar
                                data={{
                                    labels: activosPorDepartamento.map(([k]) => k),
                                    datasets: [{
                                        label: 'Activos',
                                        data: activosPorDepartamento.map(([, v]) => v),
                                        backgroundColor: 'rgba(59, 130, 246, 0.75)',
                                        borderColor: 'rgba(29, 78, 216, 1)',
                                        borderWidth: 1,
                                    }],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    plugins: { legend: { display: false } },
                                }}
                            />
                        </div>
                    </div>
                </section>

                <section className="agc-card agc-card--ubicacion">
                    <h3>Activos Por Ubicacion</h3>
                    <div className="agc-scroll-chart">
                        <div style={{ height: `${getHeight(activosPorUbicacion.length)}px` }}>
                            <Bar
                                data={{
                                    labels: activosPorUbicacion.map(([k]) => k),
                                    datasets: [{
                                        label: 'Activos',
                                        data: activosPorUbicacion.map(([, v]) => v),
                                        backgroundColor: 'rgba(14, 165, 233, 0.75)',
                                        borderColor: 'rgba(3, 105, 161, 1)',
                                        borderWidth: 1,
                                    }],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    plugins: { legend: { display: false } },
                                }}
                            />
                        </div>
                    </div>
                </section>

                <section className="agc-card agc-card--empleado">
                    <h3>Activos Por Empleado</h3>
                    <div className="agc-scroll-chart">
                        <div style={{ height: `${getHeight(activosPorEmpleado.length)}px` }}>
                            <Bar
                                data={{
                                    labels: activosPorEmpleado.map(([k]) => k),
                                    datasets: [{
                                        label: 'Activos',
                                        data: activosPorEmpleado.map(([, v]) => v),
                                        backgroundColor: 'rgba(168, 85, 247, 0.75)',
                                        borderColor: 'rgba(109, 40, 217, 1)',
                                        borderWidth: 1,
                                    }],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    plugins: { legend: { display: false } },
                                }}
                            />
                        </div>
                    </div>
                </section>

                <section className="agc-card agc-card--ultimos">
                    <h3>Ultimos 5 Activos Añadidos</h3>
                    <div className="agc-last-table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Activo</th>
                                    <th>No. Serie</th>
                                    <th>Codigo Etiqueta</th>
                                    <th>Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimos5Activos.map((a) => (
                                    <tr key={a.id_activo_fijo}>
                                        <td>{a.nombre_af || '-'}</td>
                                        <td>{a.numero_serie_af || '-'}</td>
                                        <td>{a.codigo_etiqueta || '-'}</td>
                                        <td>{a.fecha_registro_af || '-'}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="agc-card agc-card--ultimos">
                    <h3>Ultimos 5 Movimientos de Activos</h3>
                    <div className="agc-movimientos-grid">
                        <div className="agc-mov-chart">
                            <Pie
                                data={{
                                    labels: tiposUltimos5Movimientos.labels,
                                    datasets: [{
                                        data: tiposUltimos5Movimientos.values,
                                        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
                                        borderColor: '#ffffff',
                                        borderWidth: 2,
                                    }],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { position: 'bottom' } },
                                }}
                                height={120}
                            />
                        </div>

                        <div className="agc-last-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Activo</th>
                                        <th>No. Serie</th>
                                        <th>Tipo Movimiento</th>
                                        <th>Fecha</th>
                                        <th>Responsable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ultimos5Movimientos.map((mov, idx) => (
                                        <tr key={`${mov.id_activo_fijo}-${idx}`}>
                                            <td>{mov.nombre_af || '-'}</td>
                                            <td>{mov.numero_serie_af || '-'}</td>
                                            <td>{mov.tipo_movimiento || '-'}</td>
                                            <td>{mov.fecha_ultimo_movimiento || '-'}</td>
                                            <td>{mov.responsable_actual_completo || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AlmacenGeneralCharts;
