import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getVWmovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
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

import { FaArrowCircleLeft } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/resumenAF.css'
import { formatMexicanCurrency } from '@/utils/numbersFormat';

interface ResumenPorActivo {
    nombre: string;
    costoUnitario: number;
    cantidad: number;
    totalValor: number;
    esPropio?: boolean;
}

interface ChartItem {
    nombre: string;
    valor: number;
    cantidad: number;
}

interface ResumenAFProps {
    isOpen: boolean;
    onClose: () => void;
    listActivos: ActivosFijos[];
    infoLugar?: string;
}

const COLORES = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#82d982', '#ffa07a'];

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ResumenAF: React.FC<ResumenAFProps> = ({ isOpen, onClose, listActivos, infoLugar }) => {
    const dispatch = useDispatch<AppDispatch>();
    const activosMovimientos = useSelector((state: RootState) => state.vwMovimientosAF.activosMovimientos);

    useEffect(() => {
        if (!isOpen) return;
        if (activosMovimientos.length === 0) {
            dispatch(getVWmovimientosActivosFijos());
        }
    }, [dispatch, isOpen, activosMovimientos.length]);

    const movimientosPorId = useMemo(() => {
        const map = new Map<number, { nombre_af: string; costo_unitario_af: number }>();

        for (const movimiento of activosMovimientos) {
            if (!movimiento.id_activo_fijo) continue;
            map.set(movimiento.id_activo_fijo, {
                nombre_af: movimiento.nombre_af,
                costo_unitario_af: Number(movimiento.costo_unitario_af) || 0,
            });
        }

        return map;
    }, [activosMovimientos]);

    const resumenPorActivo = useMemo<ResumenPorActivo[]>(() => {
        const acumulado = new Map<string, ResumenPorActivo>();

        for (const activo of listActivos || []) {
            const idActivo = activo.id_activo_fijo || 0;
            const movimiento = movimientosPorId.get(idActivo);

            const nombre = movimiento?.nombre_af || activo.nombre_af || 'Sin nombre';
            const esPropio = activo.af_propio ?? true; // Asumir que es propio si no se especifica
            const costoUnitario = Number(movimiento?.costo_unitario_af ?? activo.costo_unitario_af ?? 0);

            if (!acumulado.has(nombre)) {
                acumulado.set(nombre, {
                    nombre,
                    esPropio,
                    costoUnitario,
                    cantidad: 0,
                    totalValor: 0,
                });
            }

            const registro = acumulado.get(nombre)!;
            registro.cantidad += 1;
            registro.totalValor += costoUnitario;
        }

        return Array.from(acumulado.values()).sort((a, b) => b.totalValor - a.totalValor);
    }, [listActivos, movimientosPorId]);

    const totalGeneral = useMemo(() => {
        return resumenPorActivo.reduce((sum, activo) => sum + activo.totalValor, 0);
    }, [resumenPorActivo]);

    const datosChart = useMemo<ChartItem[]>(() => {
        return resumenPorActivo.map(activo => ({
            nombre: activo.nombre,
            valor: activo.totalValor,
            cantidad: activo.cantidad,
        }));
    }, [resumenPorActivo]);

    const chartLabels = datosChart.map(item => item.nombre);
    const chartValores = datosChart.map(item => item.valor);
    const charCantidades = datosChart.map(item => item.cantidad);

    const barData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Total de Activos',
                data: charCantidades,
                backgroundColor: '#8884d8',
                borderColor: '#6f6bc9',
                borderWidth: 1,
            },
        ],
    };

    const pieData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartValores,
                backgroundColor: chartLabels.map((_, index) => COLORES[index % COLORES.length]),
                borderWidth: 1,
            },
        ],
    };

    if (!isOpen) return null;

    if (!listActivos || listActivos.length === 0) {
        return (
            <div className="resumen-af-container">
                <div className="resumen-header">
                    <h1>Resumen de Activos Fijos</h1>
                    <button type="button" className="buttonDelete" onClick={onClose}> <FaArrowCircleLeft className='iconAdd' /> Lista de Activos </button>
                </div>
                <div className="noEntities">
                    <FiAlertTriangle /> <p>No hay activos fijos registrados</p> <FiAlertTriangle />
                </div>
            </div>
        );
    }

    return (
        <div className="resumen-af-container">
            <div className="resumen-header">
                <h1>Resumen de Activos Fijos</h1>
                <button type="button" className="buttonDelete" onClick={onClose}> <FaArrowCircleLeft className='iconAdd' /> Lista de Activos </button>
            </div>

            <div className="total-general">

                <section>
                    <span className="label">Entidad: </span>
                    <span className="valor">{infoLugar || 'General'}</span>
                </section>

                <section>
                    <span className="label">Total de la entidad: </span>
                    <span className="valor">${totalGeneral.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</span>
                </section>

            </div>


            <div className="graficos-section">
                <div className="grafico-container">
                    <h3>Cantidad de Activos por Tipo</h3>
                    <div style={{ height: 300 }}>
                        <Bar
                            data={barData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const valor = Number(context.raw || 0);
                                                return `Cantidad: ${valor}`;
                                            },
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="grafico-container">
                    <h3>Distribución de valor</h3>
                    <div style={{ height: 300 }}>
                        <Pie
                            data={pieData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const etiqueta = context.label || 'Activo';
                                                const valor = Number(context.raw || 0);
                                                return `${etiqueta}: $${valor.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`;
                                            },
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="tabla-section">
                <h3>Detalle por activo</h3>
                <div className="tabla-responsive">
                    <table className="tabla-activos">
                        <thead>
                            <tr>
                                <th>Activo Fijo</th>
                                <th>Costo Unitario</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumenPorActivo.map((activo) => (
                                <tr key={activo.nombre}>
                                    <td>
                                        {activo.nombre} <strong>{activo.esPropio === false ? ' (Comodato)' : ''}</strong>
                                    </td>
                                    <td className="numero">{formatMexicanCurrency(activo.costoUnitario)}</td>
                                    <td className="numero">{activo.cantidad}</td>
                                    <td className="numero total">{formatMexicanCurrency(activo.totalValor)}</td>
                                </tr>
                            ))}
                            <tr className="fila-total">
                                <td colSpan={3}><strong>TOTAL ENTIDAD</strong></td>
                                <td className="numero total"><strong>{formatMexicanCurrency(totalGeneral)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResumenAF;
