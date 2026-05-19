// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


// Icons
import { FaArrowCircleRight } from 'react-icons/fa';
import { MdOutlineFileDownload, MdOutlineCalculate } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";

// Componentes
import ListActivosDepreciacion from '@/components/02_Almacenes/AlmacenGeneral/ActivosFijos/ListActivosDepreciacion';
import CalcularDepreciacion from './CalcularDepreciacion';
import ReporteDepreciacion from './ReporteDepreciacion';

// Activos Fijos
import { getActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';

// Styles
import '@styles/03_Contabilidad/DepreciacionAF/depreciacionControl.css'

const Main_DepreciacionControl: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
    const navigate = useNavigate();

    const [isOpenActivosSinDepreciar, setIsOpenActivosSinDepreciar] = useState(false);
    const [isOpenActivosEnDepreciacion, setIsOpenActivosEnDepreciacion] = useState(false);
    const [isOpenCalcularDepreciacion, setIsOpenCalcularDepreciacion] = useState(false);
    const [isOpenReporteDepreciacion, setIsOpenReporteDepreciacion] = useState(false);


    // Función para cargar los proveedores y tipos de datos desde la base de datos y Redux
    useEffect(() => {

        const cargarActivosFijos = async () => {
            try {
                const resultAction = await dispatch(getActivosFijos()).unwrap();

                if (resultAction.success) {
                    dispatch(setListActivosFijos(resultAction.activosFijos!)); // Establece los activos fijos en el estado

                } else {
                    console.log('Error', resultAction.message)
                }


            } catch (error) {
                console.error('Error al cargar proveedores:', error);
            }
        };
        cargarActivosFijos();

        const cargarEstatusActivosFijos = async () => {
            try {
                const resultAction = await dispatch(getEstatusAF()).unwrap();

                if (resultAction.success) {
                    dispatch(setListEstatusAF(resultAction.estatusAF!)); // Establece el estatus en el estado

                } else {
                    console.log('Error', resultAction.message)
                }

            } catch (error) {
                console.error('Error al cargar estatus de activos fijos:', error);
            }
        };
        cargarEstatusActivosFijos();



    }, []); // Solo se ejecuta una vez al montar el componente


    const handleRegresarOpcionesDepreciacion = () => {
        navigate('/contabilidad/depreciacionaf');
        setIsOpenActivosEnDepreciacion(false);
        setIsOpenActivosSinDepreciar(false);
        setIsOpenCalcularDepreciacion(false);
        setIsOpenReporteDepreciacion(false);

    }

    const handleOpcionAFenDepreciacion = () => {
        setIsOpenActivosEnDepreciacion(true);
        setIsOpenActivosSinDepreciar(false);
        setIsOpenCalcularDepreciacion(false);
        setIsOpenReporteDepreciacion(false);

        navigate('/contabilidad/depreciacionaf/activos-en-depreciacion');
    }

    const handleOpcionCalcularDepreciacion = () => {
        setIsOpenActivosEnDepreciacion(false);
        setIsOpenActivosSinDepreciar(false);
        setIsOpenCalcularDepreciacion(true);
        setIsOpenReporteDepreciacion(false);

        navigate('/contabilidad/depreciacionaf/calcular-depreciacion');
    }

    const handleOpcionReporteDepreciacion = () => {
        setIsOpenActivosEnDepreciacion(false);
        setIsOpenActivosSinDepreciar(false);
        setIsOpenCalcularDepreciacion(false);
        setIsOpenReporteDepreciacion(true);

        navigate('/contabilidad/depreciacionaf/reporte-depreciacion');
    }

    // Renders //

    const renderOpcionesDepreciacion = () => (
        <>
            <header>

                <div className='returnButton'>
                    {isOpenActivosEnDepreciacion || isOpenActivosSinDepreciar || isOpenCalcularDepreciacion || isOpenReporteDepreciacion ?
                        <button onClick={handleRegresarOpcionesDepreciacion}>
                            <FaArrowCircleRight className='iconAdd' style={
                                { transform: 'rotate(180deg)' }
                            } /> Volver
                        </button>
                        : null
                    }
                </div>

                <h1>Depreciación de Activos Fijos</h1>

            </header>

            <hr />

            <section>
                <div className='divOption' onClick={() => handleOpcionAFenDepreciacion()}>
                    <MdOutlineFileDownload className='iconFiltro' />
                    <h2> Depreciación de AFs </h2>
                    <p> Consultar activos que estan siendo depreciados </p>
                </div>

                <div className='divOption' onClick={() => handleOpcionCalcularDepreciacion()}>
                    <MdOutlineCalculate className='iconFiltro' />
                    <h2> Calcular Depreciación </h2>
                    <p> Calcular con parámetros especificos </p>
                </div>

                <div className='divOption' onClick={() => handleOpcionReporteDepreciacion()}>
                    <TbReportAnalytics className='iconFiltro' />
                    <h2> Reporte de Depreciación </h2>
                    <p> Análisis de la depreciación de activos </p>
                </div>






            </section>
        </>

    )

    const renderAFConDepreciacion = () => (
        <>
            <header>

                <div className='returnButton'>
                    {isOpenActivosEnDepreciacion || isOpenActivosSinDepreciar || isOpenCalcularDepreciacion || isOpenReporteDepreciacion ?
                        <button
                            onClick={() => {
                                handleRegresarOpcionesDepreciacion();
                            }}
                        >
                            <FaArrowCircleRight className='iconAdd' style={
                                { transform: 'rotate(180deg)' }
                            } /> Volver
                        </button>
                        : null
                    }
                </div>

                <h1>Control de Depreciación</h1>

            </header>

            <hr />

            <ListActivosDepreciacion />


        </>
    )

    const renderCalcularDepreciacion = () => (
        <>
            <header>

                <div className='returnButton'>
                    {isOpenActivosEnDepreciacion || isOpenActivosSinDepreciar || isOpenCalcularDepreciacion || isOpenReporteDepreciacion ?
                        <button
                            onClick={() => {
                                handleRegresarOpcionesDepreciacion();
                            }}
                        >
                            <FaArrowCircleRight className='iconAdd' style={
                                { transform: 'rotate(180deg)' }
                            } /> Volver
                        </button>
                        : null
                    }
                </div>

                <h1>Calcular Depreciación</h1>

            </header>

            <hr />

            <CalcularDepreciacion />

        </>
    )

    const renderReporteDepreciacion = () => (
        <>
            <header>

                <div className='returnButton'>
                    {isOpenActivosEnDepreciacion || isOpenActivosSinDepreciar || isOpenCalcularDepreciacion || isOpenReporteDepreciacion ?
                        <button
                            onClick={() => {
                                handleRegresarOpcionesDepreciacion();
                            }}
                        >
                            <FaArrowCircleRight className='iconAdd' style={
                                { transform: 'rotate(180deg)' }
                            } /> Volver
                        </button>
                        : null
                    }
                </div>

                <h1>Reporte de Depreciación</h1>

            </header>

            <hr />

            <ReporteDepreciacion />

        </>
    )


    return (
        <div className='mainDiv_DepreciacionControl'>
            {isOpenActivosEnDepreciacion ? renderAFConDepreciacion() :
                isOpenCalcularDepreciacion ? renderCalcularDepreciacion() :
                    isOpenReporteDepreciacion ? renderReporteDepreciacion() :
                        renderOpcionesDepreciacion()}

        </div>

    )
};

export default Main_DepreciacionControl;
