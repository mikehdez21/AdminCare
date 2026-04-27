import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Types
import { Empleados } from '@/@types/mainTypes';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/AFEmpleados.css'
import { FaList } from 'react-icons/fa';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getActivosFijosPorResponsable } from '@/store/almacengeneral/Activos/activosActions';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';

// Icons
import { FaFilePdf } from "react-icons/fa6";

// PDF
import { PDFViewer } from '@react-pdf/renderer';
import { MyDocument } from '@/reactPDF/pdfActivosResponsable';


interface AFEmpleadosProps {
    empleadoSeleccionadoId: number | null;
    onSelectEmpleado: (id: number | null) => void;
}

const AFEmpleados: React.FC<AFEmpleadosProps> = ({ empleadoSeleccionadoId, onSelectEmpleado }) => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Estados Locales
    const [busquedaEmpleados, setBusquedaEmpleados] = useState<string>('');
    const [activosEmpleado, setActivosEmpleado] = useState<ActivosFijos[]>([]);

    // Estado para empleado seleccionado
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleados | null>(null);

    // PDF
    const [showPDF, setShowPDF] = useState(false);

    // Store
    const empleados = useSelector((state: RootState) => state.empleados.empleados);
    const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

    useEffect(() => {
        setActivosEmpleado([]);
    }, [empleados]);

    useEffect(() => {
        const cargarDepartamentos = async () => {
            try {
                const resultAction = await dispatch(getDepartamentos()).unwrap();

                if (resultAction.success) {
                    dispatch(setListDepartamentos(resultAction.departamentos!));
                } else {
                    console.error('Error al cargar departamentos:', resultAction.message);
                }
            } catch (error) {
                console.error('Error al cargar departamentos:', error);
            }
        };

        cargarDepartamentos();
    }, [dispatch]);

    // Filtros de búsqueda
    const empleadosDisponiblesFiltrados = empleados.filter(empleado => {
        if (!empleado || !empleado.nombre_empleado) return false;
        return (
            empleado.nombre_empleado.toLowerCase().includes(busquedaEmpleados.toLowerCase()) ||
            (empleado.id_empleado?.toString().includes(busquedaEmpleados) || false)
        );
    });


    const handleSeleccionarEmpleado = async (empleado: Empleados) => {
        setEmpleadoSeleccionado(empleado);
        onSelectEmpleado(empleado.id_empleado ?? null);
        navigate(`/almacen_general/activos/empleado/${empleado.id_empleado}`);

        try {
            const resultados = await dispatch(getActivosFijosPorResponsable(empleado.id_empleado ?? 0)).unwrap();

            if (resultados.success) {
                setActivosEmpleado(resultados.activosFijos || []);

            } else {
                setActivosEmpleado([]);
            }


        } catch (error) {
            console.error('Error al obtener activos por responsable:', error);
            setActivosEmpleado([]);
        }
    };



    return (
        <div className='mainDiv_AFEmpleados'>

            {/* Columna Izquierda - Empleados Disponibles */}
            < div className="columnEmpleadosDisponibles" >

                <div className="columnHeader">
                    <h3>
                        {empleadoSeleccionadoId ? (
                            <>
                                <FaList className="columnIcon" /> Empleado: {busquedaEmpleados}
                            </>
                        ) : (
                            <>
                                <FaList className="columnIcon" /> Empleados Disponibles
                            </>
                        )}

                    </h3>
                    <span className="contadorBadge">{empleados.length}</span>
                </div>

                <div className="divSearch">
                    <input
                        type="text"
                        placeholder="Buscar por nombre de empleado..."
                        value={busquedaEmpleados}
                        onChange={(e) => setBusquedaEmpleados(e.target.value)}
                        className="inputSearch"
                    />
                </div>

                <div className="divEmpleadosList">
                    {empleadosDisponiblesFiltrados.length > 0 ? (
                        empleadosDisponiblesFiltrados.map((empleado) => (
                            <div
                                key={empleado.id_empleado}
                                className={`empleadoItem disponible ${empleadoSeleccionado?.id_empleado === empleado.id_empleado
                                    ? 'seleccionado'
                                    : ''
                                    }`}
                                onClick={() => handleSeleccionarEmpleado(empleado)}
                            >
                                <div className="empleadoInfo">

                                    <h4>
                                        {empleado.id_empleado}{' | '}
                                        {empleado.nombre_empleado} {empleado.apellido_paterno} {empleado.apellido_materno}
                                    </h4>

                                    {departamentos.find(depto => depto.id_departamento === empleado.id_departamento)?.nombre_departamento && (
                                        <p className='departamento'>
                                            {departamentos.find(depto => depto.id_departamento === empleado.id_departamento)?.nombre_departamento}
                                        </p>
                                    )}


                                </div>
                            </div>

                        ))
                    ) : (
                        <div className="noItems">
                            <p>No hay Empleados disponibles</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Columna Derecha - Activos de la Factura */}
            {empleadoSeleccionado ? (
                <div className="columnActivosEmpleado">

                    <div className="columnHeader">
                        <h3>
                            <FaList className="columnIcon" /> Activos Fijos Asociados
                            <span className="contadorBadge">{activosEmpleado.length}</span>
                        </h3>

                        {empleadoSeleccionado && activosEmpleado.length > 0 && (
                            <FaFilePdf
                                className='pdfResponsable'
                                onClick={() => setShowPDF(true)}
                            />
                        )}

                    </div>

                    <div className="divActivosEmpleadoList">

                        {activosEmpleado.length > 0 ? (
                            activosEmpleado.map((activo: ActivosFijos) => (
                                <div
                                    key={activo.id_activo_fijo}
                                    className="activoEmpleadoItem disponible"
                                >
                                    <div className="activoEmpleadoInfo">
                                        <h4>
                                            <p className="codigo">{activo.codigo_unico} </p>
                                            {activo.nombre_af}
                                        </h4>

                                        <p>
                                            <strong>NoSerie: </strong> {activo.numero_serie_af}
                                        </p>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="noItems">
                                <p>Este empleado no tiene activos asignados</p>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className='columnActivosEmpleado'>
                    <div className="sinSeleccion">
                        <p>Selecciona un empleado para ver sus activos</p>
                    </div>

                </div>
            )}

            <Modal
                isOpen={showPDF}
                onRequestClose={() => setShowPDF(false)}
                className='viewPDF'
                contentLabel='Vista previa PDF'
                ariaHideApp={false}
            >
                <div style={{ height: '94vh' }}>
                    <PDFViewer width="100%" height="100%">
                        <MyDocument activosResponsable={activosEmpleado} infoResponsable={empleadoSeleccionado} />
                    </PDFViewer>
                </div>
            </Modal>
        </div>
    );
};

export default AFEmpleados;
