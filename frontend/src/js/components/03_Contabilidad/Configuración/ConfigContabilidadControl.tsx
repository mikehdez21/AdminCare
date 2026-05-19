import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { FaTools, FaRegListAlt, FaTags, FaArrowCircleRight } from 'react-icons/fa';

// Types & Store
import { fetchMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { setMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFReducer';

// Componentes
import MetodosDepreciacion from './MetodosDepreciacion/MetodosDepreciacionControl';

// Styles
import '@styles/03_Contabilidad/Configuracion/configContabilidadControl.css';

const Main_ConfigContabilidadControl: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Estados para vistas (Métodos, Estatus, Clasificación)
    const [isOpenMetodos, setIsOpenMetodos] = useState(false);
    const [isOpenEstatus, setIsOpenEstatus] = useState(false);
    const [isOpenClasificacion, setIsOpenClasificacion] = useState(false);


    // useEffect: cargar métodos de depreciación al montar o abrir la sección
    useEffect(() => {
        if (isOpenMetodos) {
            const cargarMetodos = async () => {
                try {
                    const resultAction = await dispatch(fetchMetodosDepreciacion()).unwrap();
                    console.log(resultAction);
                    if (resultAction.success) {
                        dispatch(setMetodosDepreciacion(resultAction.metodos!));
                    } else {
                        console.log('Error al cargar métodos:', resultAction.message);
                    }
                } catch (error) {
                    console.error('Error al cargar métodos de depreciación:', error);
                }
            };
            cargarMetodos();
        }
    }, [isOpenMetodos, dispatch]);


    const handleBack = () => {
        setIsOpenMetodos(false);
        setIsOpenEstatus(false);
        setIsOpenClasificacion(false);
    };

    const handleOpenMetodos = () => {
        setIsOpenMetodos(true);
        setIsOpenEstatus(false);
        setIsOpenClasificacion(false);
    };

    const handleOpenEstatus = () => {
        setIsOpenMetodos(false);
        setIsOpenEstatus(true);
        setIsOpenClasificacion(false);
    };

    const handleOpenClasificacion = () => {
        setIsOpenMetodos(false);
        setIsOpenEstatus(false);
        setIsOpenClasificacion(true);
    };

    const renderMenu = () => (
        <>
            <header>
                <div className='returnButton'>
                    {isOpenMetodos || isOpenEstatus || isOpenClasificacion ?
                        <button onClick={handleBack}>
                            <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Volver
                        </button>
                        : null
                    }
                </div>

                <h1>Configuración - Contabilidad</h1>
            </header>

            <hr />

            <section>
                <div className="divOption" onClick={handleOpenMetodos}>
                    <FaTools className="iconFiltro" />
                    <h2>Métodos de Depreciación</h2>
                    <p>Gestionar los métodos disponibles para cálculos de depreciación</p>
                </div>

                <div className="divOption" onClick={handleOpenEstatus}>
                    <FaRegListAlt className="iconFiltro" />
                    <h2>Estatus de Depreciación</h2>
                    <p>Estados que puede tener una depreciación (sin depreciar, en depreciación, pausada, etc)</p>
                </div>

                <div className="divOption" onClick={handleOpenClasificacion}>
                    <FaTags className="iconFiltro" />
                    <h2>Clasificación de Activos Fijos</h2>
                    <p>Clasificaciones usadas para agrupar activos fijos</p>
                </div>
            </section>
        </>
    );

    const renderMetodos = () => (
        <>
            <header>
                <div className="returnButton">
                    <button onClick={handleBack}>
                        <FaArrowCircleRight className="iconAdd" style={{ transform: 'rotate(180deg)' }} /> Volver
                    </button>
                </div>
                <h1>Métodos de Depreciación</h1>
            </header>
            <hr />

            <div className="sectionContent">
                {/* Aquí irá el componente de Métodos de Depreciación */}
                <MetodosDepreciacion />
            </div>
        </>
    );

    const renderEstatus = () => (
        <>
            <header>
                <div className="returnButton">
                    <button onClick={handleBack}>
                        <FaArrowCircleRight className="iconAdd" style={{ transform: 'rotate(180deg)' }} /> Volver
                    </button>
                </div>
                <h1>Estatus de Depreciación</h1>
            </header>
            <hr />
            <div className="sectionContent">
                {/* Aquí irá el componente de Estatus de Depreciación */}
                {/* <EstatusDepreciacion /> */}
            </div>
        </>
    );

    const renderClasificacion = () => (
        <>
            <header>
                <div className="returnButton">
                    <button onClick={handleBack}>
                        <FaArrowCircleRight className="iconAdd" style={{ transform: 'rotate(180deg)' }} /> Volver
                    </button>
                </div>
                <h1>Clasificación de Activos Fijos</h1>
            </header>
            <hr />
            <div className="sectionContent">
                {/* Aquí irá el componente de Clasificación de Activos Fijos */}
                {/* <ClasificacionActivosFijos /> */}
            </div>
        </>
    );

    return (
        <div className="mainDiv_ConfigContabilidad">
            {isOpenMetodos ? renderMetodos() : isOpenEstatus ? renderEstatus() : isOpenClasificacion ? renderClasificacion() : renderMenu()}
        </div>
    );
};

export default Main_ConfigContabilidadControl;
