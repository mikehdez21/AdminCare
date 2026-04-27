import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';

// Types
import { ActivosFacturaApiResponse, FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Store
import { AppDispatch, RootState } from '@/store/store';
import { getActivosFactura } from '@/store/almacengeneral/Facturas/facturasActions';
import { getVWmovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListvwMovimientosAF } from '@/store/almacengeneral/Activos/vwMovimientosAFReducer';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Facturas/ResponsivasAF.css';

// Icons
import { FiAlertTriangle } from 'react-icons/fi';
import { FaFilePdf } from "react-icons/fa6";

// PDF
import { PDFViewer } from '@react-pdf/renderer';
import { MyDocument } from '@/reactPDF/pdfFacturaActivosResponsable';


interface ResponsivasAFProps {
    facturaToPDF: FacturasAF | null;
}

interface ResponsableFactura {
    responsable_id: string;
    responsable_nombre: string;
    activos: VwMovimientosAF[];
}

const ResponsivasAF: React.FC<ResponsivasAFProps> = ({ facturaToPDF }) => {
    const dispatch = useDispatch<AppDispatch>();
    const facturaId = facturaToPDF?.id_factura ?? null;
    const movimientosCargadosRef = useRef(false);

    // Obtener activos de la factura desde el endpoint específico
    const [activosFactura, setActivosFactura] = React.useState<ActivosFacturaApiResponse>();

    // Obtener todos los movimientos de activos fijos del store
    const activosMovimientos = useSelector((state: RootState) => state.vwMovimientosAF.activosMovimientos);

    // PDF
    const [showPDF, setShowPDF] = useState(false);

    // Estados locales
    const [responsableSeleccionado, setResponsableSeleccionado] = React.useState<string | null>(null);

    const responsablesFactura = useMemo<ResponsableFactura[]>(() => {
        if (!activosFactura?.activosFactura || !activosMovimientos || activosMovimientos.length === 0) {
            return [];
        }

        const activosFacturaIds = new Set(
            activosFactura.activosFactura
                .map((activo) => activo.id_activo_fijo)
                .filter((id): id is number => id !== undefined)
        );

        const activosFacturaConResponsables = activosMovimientos.filter(
            (movimiento) => movimiento.id_activo_fijo !== undefined && activosFacturaIds.has(movimiento.id_activo_fijo)
        );

        const responsablesMap = new Map<string, VwMovimientosAF[]>();

        activosFacturaConResponsables.forEach((activo) => {
            const responsableNombre = activo.responsable_actual_completo || 'Sin Responsable';

            if (!responsablesMap.has(responsableNombre)) {
                responsablesMap.set(responsableNombre, []);
            }

            responsablesMap.get(responsableNombre)!.push(activo);
        });

        return Array.from(responsablesMap.entries()).map(([responsableNombre, activos]) => ({
            responsable_id: responsableNombre,
            responsable_nombre: responsableNombre,
            activos,
        }));
    }, [activosFactura, activosMovimientos]);

    const responsableActivo = useMemo(
        () => responsablesFactura.find((responsable) => responsable.responsable_id === responsableSeleccionado) ?? null,
        [responsablesFactura, responsableSeleccionado]
    );

    const activosAgrupados = responsableActivo?.activos ?? [];
    const totalActivosFactura = activosFactura?.activosFactura?.length ?? 0;
    const totalResponsablesFactura = responsablesFactura.length;

    // Cargar activos básicos de la factura
    useEffect(() => {
        if (facturaId === null) {
            setActivosFactura(undefined);
            return;
        }

        const cargarActivosFactura = async () => {
            try {
                const resultAction = await dispatch(getActivosFactura(facturaId));
                if (getActivosFactura.fulfilled.match(resultAction)) {
                    const activos = resultAction.payload;
                    setActivosFactura(activos);
                } else {
                    console.error('Error al cargar los activos de la factura');
                }
            } catch (error) {
                console.error('Error en la petición de activos de la factura:', error);
            }
        };

        cargarActivosFactura();
    }, [facturaId, dispatch]);

    // Cargar movimientos de activos fijos (con responsables) si no están cargados
    useEffect(() => {
        const cargarMovimientosAF = async () => {
            if (activosMovimientos && activosMovimientos.length > 0) {
                movimientosCargadosRef.current = true;
                return;
            }

            if (movimientosCargadosRef.current) {
                return;
            }

            movimientosCargadosRef.current = true;

            try {
                const resultAction = await dispatch(getVWmovimientosActivosFijos()).unwrap();
                if (resultAction.success && resultAction.vwMovimientosAF) {
                    dispatch(setListvwMovimientosAF(resultAction.vwMovimientosAF));
                }
            } catch (error) {
                // Permitir reintento si la petición falló realmente
                movimientosCargadosRef.current = false;
                console.error('Error al cargar movimientos de activos fijos:', error);
            }
        };

        cargarMovimientosAF();
    }, [dispatch, activosMovimientos]);

    useEffect(() => {
        setResponsableSeleccionado(null);
        setShowPDF(false);
    }, [facturaId]);

    return (
        <div className='mainDiv_ResponsivasAF'>
            <header className='responsivas_header'>
                <div className='header_copy'>
                    <p className='eyebrow'>Responsivas de activos</p>
                    <h2>Factura {facturaToPDF?.id_factura ?? 'sin identificar'} | {facturaToPDF?.num_factura ?? 'No especificado'}</h2>
                    <p className='header_description'>
                        Selecciona un responsable para revisar sus activos asociados en la factura y preparar el PDF.
                    </p>
                </div>

                <div className='header_actions'>
                    <div className='header_badge'>
                        <span className='badge_label'>Total activos</span>
                        <strong>{totalActivosFactura}</strong>
                    </div>
                    <div className='header_badge'>
                        <span className='badge_label'>Total responsables</span>
                        <strong>{totalResponsablesFactura}</strong>
                    </div>
                    <div className='header_badge header_badge--highlight'>
                        <span className='badge_label'>Activos del responsable</span>
                        <strong>{activosAgrupados.length}</strong>
                    </div>

                </div>
            </header>

            <div className='responsivas_container'>

                <aside className='listResponsables'>
                    <div className='headerSection'>
                        <h3>Responsables</h3>
                        <p>Activos agrupados por responsable actual</p>
                    </div>

                    {responsablesFactura.length === 0 ? (
                        <div className='noEntities'>
                            <FiAlertTriangle />
                            <p>No hay responsables asignados a los activos de esta factura</p>
                        </div>
                    ) : (
                        <div className='responsables_list'>
                            {responsablesFactura.map((responsable) => (
                                <button
                                    key={responsable.responsable_id}
                                    type='button'
                                    className={`responsable_button ${responsableSeleccionado === responsable.responsable_id ? 'active' : ''}`}
                                    onClick={() => {
                                        setResponsableSeleccionado(responsable.responsable_id);
                                    }}
                                >
                                    <span className='responsable_name'>{responsable.responsable_nombre}</span>
                                    <span className='activos_count'>{responsable.activos.length} activos</span>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                <main className='listAFs'>
                    <div className='headerSection'>
                        <div>
                            <h3>
                                {responsableActivo?.responsable_nombre || 'Detalle del responsable'}
                                <button
                                    type='button'
                                    disabled={!responsableActivo || activosAgrupados.length === 0}
                                    className={`pdfButton ${!responsableActivo || activosAgrupados.length === 0 ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if (!responsableActivo || activosAgrupados.length === 0) {
                                            return;
                                        }

                                        setShowPDF(true);
                                    }}
                                >
                                    <FaFilePdf />
                                </button>

                            </h3>

                            <p>
                                {responsableActivo
                                    ? 'Activos asociados al responsable seleccionado'
                                    : 'Selecciona un responsable para mostrar sus activos'}
                            </p>

                        </div>


                    </div>

                    {!responsableActivo ? (
                        <div className='noEntities noEntities--detail'>
                            <FiAlertTriangle />
                            <p>Selecciona un responsable para ver los activos</p>
                        </div>
                    ) : activosAgrupados.length === 0 ? (
                        <div className='noEntities noEntities--detail'>
                            <FiAlertTriangle />
                            <p>No hay activos para este responsable</p>
                        </div>
                    ) : (
                        <div className='activos_list'>
                            {activosAgrupados.map((activo) => (
                                <button
                                    key={activo.id_activo_fijo}
                                    type='button'
                                    className='activoItem'
                                >
                                    <div className='activoInfo'>

                                        <div className='firstRowInfo'>
                                            <span className='label'>ID: <strong>{activo.id_activo_fijo}</strong> </span>
                                            <span className='label'>Nombre: <strong>{activo.nombre_af}</strong> </span>
                                        </div>

                                        <div className='secondRowInfo'>
                                            <span className='label'>NoSerie: <strong>{activo.numero_serie_af}</strong> </span>
                                            <span className='label'>Ubicación: <strong>{activo.ubicacion_actual || 'Sin Ubicación'}</strong> </span>
                                        </div>

                                        <div className='thridRowInfo'>
                                            <span className='label'>Fecha de movimiento: <strong>{activo.fecha_ultimo_movimiento || 'Sin fecha'}</strong> </span>
                                        </div>

                                    </div>

                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div >

            <Modal
                isOpen={showPDF}
                onRequestClose={() => setShowPDF(false)}
                className='viewPDF'
                contentLabel='Vista previa PDF'
                ariaHideApp={false}
            >
                <div style={{ height: '94vh' }}>
                    <PDFViewer width="100%" height="100%">
                        <MyDocument activosFacturaResponsable={activosAgrupados} infoResponsable={responsableActivo} infoFactura={facturaToPDF} />
                    </PDFViewer>
                </div>
            </Modal>

        </div >
    );
};

export default ResponsivasAF;