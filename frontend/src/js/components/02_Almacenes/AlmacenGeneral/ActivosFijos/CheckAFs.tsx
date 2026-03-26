import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

// Icons
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/checkAF.css';

// PDF
import { PDFViewer } from '@react-pdf/renderer';
import { MyDocument } from '@/reactPDF/pdfScaneoActivos';

interface CheckAFsProps {
    isOpen: boolean;
    onClose: () => void;
    listActivos: ActivosFijos[];
    infoLugar: string | undefined;
}

interface ActivoEscaneado extends ActivosFijos {
    timestamp: Date;
    qrCapturado: string;
}

const CheckAF: React.FC<CheckAFsProps> = ({ isOpen, listActivos, infoLugar }) => {
    const [activosEscaneados, setActivosEscaneados] = useState<ActivoEscaneado[]>([]);

    // Calcula los activos pendientes en base a los escaneados y la lista total
    const activosPendientes = listActivos.filter(
        (activo) => !activosEscaneados.some((a) => a.id_activo_fijo === activo.id_activo_fijo)
    );

    // Procesar infoLugar

    const [qrInput, setQrInput] = useState('');
    const [ultimoError, setUltimoError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inicioCapturaRef = useRef<number | null>(null);
    const ultimaTeclaRef = useRef<number | null>(null);
    const bufferCapturaRef = useRef('');
    const alertaCompletadoMostradaRef = useRef(false);

    const [showPDF, setShowPDF] = useState(false);

    const normalizarCodigoQRAF = (valor: string): string | null => {
        const valorNormalizado = valor.trim().toUpperCase();
        const match = valorNormalizado.match(/QRAF\d+[-'’`´]F\d+[-'’`´]L\d+[-'’`´]C\d+[-'’`´]LT\d+/);

        if (!match) {
            return null;
        }

        return match[0].replace(/['’`´]/g, '-');
    };

    const obtenerCodigoQRAFActivo = (activo: ActivosFijos): string | null => {
        // 1) Fuente principal: relación codigosQR (si viene cargada en el filtro)
        const qrActivo = activo.codigosQR?.find((qr) => qr.activo);
        if (qrActivo?.codigo_qr) {
            return normalizarCodigoQRAF(qrActivo.codigo_qr);
        }

        // 2) Fallback: algunas respuestas incluyen codigo_qr directo en el objeto
        const codigoQRDirecto = (activo as unknown as { codigo_qr?: string }).codigo_qr;
        if (codigoQRDirecto) {
            return normalizarCodigoQRAF(codigoQRDirecto);
        }

        // 3) Fallback estable: codigo_qr se construye como "QR" + codigo_etiqueta
        if (activo.codigo_etiqueta) {
            return normalizarCodigoQRAF(`QR${activo.codigo_etiqueta}`);
        }

        return null;
    };


    const forzarFocoInput = () => {
        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    // Mantener el foco en el input para capturar escaneos continuos
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        forzarFocoInput();
    }, [isOpen]);

    // Asegurar foco persistente aunque el usuario haga click en otras zonas del componente.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = () => {
            forzarFocoInput();
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
        };
    }, [isOpen]);

    // Procesamiento automático: cuando la Zebra termina de escribir,
    // esperamos un instante corto de inactividad y procesamos sin Enter.
    useEffect(() => {
        const valor = qrInput.trim();
        if (!valor) {
            inicioCapturaRef.current = null;
            ultimaTeclaRef.current = null;
            bufferCapturaRef.current = '';
            return;
        }

        const timer = window.setTimeout(() => {
            const ahora = Date.now();
            const inicio = inicioCapturaRef.current ?? ahora;
            const ultima = ultimaTeclaRef.current ?? ahora;
            const duracion = Math.max(1, ultima - inicio);
            const longitud = valor.length;
            const esRafagaScanner = longitud >= 8 && duracion <= 450;

            if (esRafagaScanner) {
                procesarEscaneo(valor);
            }
        }, 120);

        return () => window.clearTimeout(timer);
    }, [qrInput]);

    // Mostrar alerta cuando todos los activos filtrados ya fueron escaneados.
    useEffect(() => {
        const total = listActivos.length;
        const escaneados = activosEscaneados.length;

        if (total === 0 || escaneados === 0) {
            alertaCompletadoMostradaRef.current = false;
            return;
        }

        if (escaneados < total) {
            alertaCompletadoMostradaRef.current = false;
            return;
        }

        if (escaneados === total && !alertaCompletadoMostradaRef.current) {
            alertaCompletadoMostradaRef.current = true;
            void Swal.fire({
                icon: 'success',
                title: 'Revision completada',
                text: `Se escanearon ${escaneados} de ${total} activos.`,
                confirmButtonText: 'OK',
            });
        }
    }, [activosEscaneados.length, listActivos.length]);

    const procesarEscaneo = (qrValue: string) => {
        if (!qrValue.trim()) {
            return;
        }

        // Limpiar el input
        bufferCapturaRef.current = '';
        setQrInput('');

        // Extraer solo QRAF... aunque el scanner envíe URL completa o caracteres alterados.
        const codigoQR = normalizarCodigoQRAF(qrValue);

        if (!codigoQR) {
            setUltimoError('No se pudo extraer un código QRAF válido del escaneo.');
            setTimeout(() => setUltimoError(null), 3000);
            forzarFocoInput();
            return;
        }

        console.log('QR Escaneado:', qrValue);
        console.log('Código extraído:', codigoQR);

        // Buscar el activo por codigo_qr
        const activoEncontrado = listActivos.find((activo) => {
            const codigoActivo = obtenerCodigoQRAFActivo(activo);
            return codigoActivo === codigoQR;
        });

        if (activoEncontrado) {
            // Verificar si el activo ya fue escaneado
            const yaEscaneado = activosEscaneados.some(
                (a) => a.id_activo_fijo === activoEncontrado.id_activo_fijo
            );

            if (yaEscaneado) {
                setUltimoError(`"${activoEncontrado.descripcion_af}" ya fue escaneado`);
                setTimeout(() => setUltimoError(null), 3000);
                return;
            }

            // Agregar a la lista de escaneados
            setActivosEscaneados((prev) => [
                ...prev,
                {
                    ...activoEncontrado,
                    timestamp: new Date(),
                    qrCapturado: codigoQR,
                },
            ]);
            setUltimoError(null);
        } else {
            setUltimoError(`QR no encontrado: ${codigoQR}`);
            setTimeout(() => setUltimoError(null), 3000);
        }

        // Mantener el foco en el input
        forzarFocoInput();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const ahora = Date.now();

        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            bufferCapturaRef.current = bufferCapturaRef.current.slice(0, -1);
            setQrInput(bufferCapturaRef.current);
            ultimaTeclaRef.current = ahora;
            return;
        }

        if (e.key.length === 1) {
            e.preventDefault();
            if (!inicioCapturaRef.current) {
                inicioCapturaRef.current = ahora;
            }
            ultimaTeclaRef.current = ahora;
            bufferCapturaRef.current += e.key;
            setQrInput(bufferCapturaRef.current);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const inicio = inicioCapturaRef.current ?? ahora;
            const ultima = ultimaTeclaRef.current ?? ahora;
            const duracion = Math.max(1, ultima - inicio);
            const longitud = bufferCapturaRef.current.trim().length;
            const esRafagaScanner = longitud >= 8 && duracion <= 450;

            if (esRafagaScanner) {
                procesarEscaneo(bufferCapturaRef.current);
            }
        }
    };


    const removerActivoEscaneado = (id: number) => {
        setActivosEscaneados((prev) =>
            prev.filter((a) => a.id_activo_fijo !== id)
        );
    };

    const limpiarTodo = () => {
        setActivosEscaneados([]);
        bufferCapturaRef.current = '';
        setQrInput('');
        setUltimoError(null);
        alertaCompletadoMostradaRef.current = false;
        forzarFocoInput();
    };


    const porcentajeEscaneados = listActivos.length
        ? Math.round((activosEscaneados.length / listActivos.length) * 100)
        : 0;

    return (
        <>
            <div className="mainDiv_CheckAF">
                <div className="headerCheckAF">
                    <h2>
                        Revisar Activos Fijos con Zebra DS22

                        <button onClick={() => setShowPDF(true)}>Ver PDF</button>


                    </h2>
                    <div className="estadisticas">
                        <span>{activosEscaneados.length} / {listActivos.length} escaneados</span>
                        <div className="progressBar">
                            <div
                                className="progress"
                                style={{ width: `${porcentajeEscaneados}%` }}
                            ></div>
                        </div>
                    </div>

                </div>

                <div className="scannearActivos">
                    {/* Columna Izquierda - Lista de Activos */}
                    <section className="listaActivos">
                        <div className="sectionHeader">
                            <h3>Activos Disponibles ({listActivos.length})</h3>
                        </div>
                        <div className="activosList">
                            {listActivos && listActivos.length > 0 ? (
                                listActivos.map((activo) => {
                                    const yaEscaneado = activosEscaneados.some(
                                        (a) => a.id_activo_fijo === activo.id_activo_fijo
                                    );
                                    return (
                                        <div
                                            key={activo.id_activo_fijo}
                                            className={`activoRow ${yaEscaneado ? 'escaneado' : ''}`}
                                        >
                                            <div className="activoContent">
                                                <div className="activoHeader">
                                                    <span className="activoId">
                                                        {activo.codigo_etiqueta}
                                                    </span>
                                                    {yaEscaneado && (
                                                        <FiCheckCircle className="iconEscaneado" />
                                                    )}
                                                </div>
                                                <p className="descripcion">
                                                    {activo.descripcion_af}
                                                </p>

                                                <div className="detalles">
                                                    <span className="modelo">
                                                        {activo.modelo_af}
                                                    </span>
                                                    <span className="marca">
                                                        {activo.marca_af}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="noActivos">
                                    No hay activos disponibles
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Columna Derecha - Registro de Escaneos */}
                    <section className="registroEscaneos">
                        <div className="sectionHeader">
                            <h3>Registro de Escaneos ({activosEscaneados.length})</h3>

                            <div className="inputQRContainer">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value=""
                                    onKeyDown={handleKeyDown}
                                    onPaste={(e) => e.preventDefault()}
                                    onBlur={forzarFocoInput}
                                    placeholder="Escanea QR aquí"
                                    className="inputQR"
                                    readOnly
                                    autoFocus
                                />
                            </div>

                            {activosEscaneados.length > 0 && (
                                <button className="btnLimpiar" onClick={limpiarTodo}>
                                    <FiX /> Limpiar
                                </button>
                            )}


                        </div>



                        {ultimoError && (
                            <div className="alertaError">
                                <FiAlertCircle />
                                <span>{ultimoError}</span>
                            </div>
                        )}

                        <div className="escaneosList">
                            {activosEscaneados.length > 0 ? (
                                activosEscaneados.map((activo, index) => (
                                    <div
                                        key={`${activo.id_activo_fijo}-${index}`}
                                        className="escaneoRow"
                                    >
                                        <div className="escaneoNumber">
                                            {index + 1}
                                        </div>
                                        <div className="escaneoContent">
                                            <p className="qrCapturado">
                                                {activo.qrCapturado}
                                            </p>
                                            <p className="descripcion">
                                                {activo.descripcion_af}
                                            </p>
                                            <p className="timestamp">
                                                {activo.timestamp.toLocaleTimeString(
                                                    'es-CO'
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            className="btnRemover"
                                            onClick={() =>
                                                removerActivoEscaneado(
                                                    activo.id_activo_fijo!
                                                )
                                            }
                                            title="Remover escaneo"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="noEscaneos">
                                    <FiAlertCircle />
                                    <p>Escanea un QR para comenzar</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>



            </div>

            <Modal
                isOpen={showPDF}
                onRequestClose={() => setShowPDF(false)}
                className='viewPDF'
                contentLabel='Vista previa PDF'
                ariaHideApp={false}
            >
                <div style={{ height: '94vh' }}>
                    <PDFViewer width="100%" height="100%">
                        <MyDocument activos={activosEscaneados} activosPendientes={activosPendientes} infoLugar={infoLugar} />
                    </PDFViewer>
                </div>
            </Modal>
        </>
    );


};

export default CheckAF;