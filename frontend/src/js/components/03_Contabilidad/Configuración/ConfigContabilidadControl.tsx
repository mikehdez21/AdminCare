import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { FaTools, FaRegListAlt, FaTags, FaArrowCircleRight } from 'react-icons/fa';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { IoAddCircleOutline } from 'react-icons/io5';
import { FiAlertTriangle } from 'react-icons/fi';

// Types & Store
import { MetodoDepreciacion } from '@/@types/AlmacenGeneralTypes/depreciacionTypes';
import { fetchMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { setMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFReducer';

// Componentes
import MetodosDepreciacion from './MetodosDepreciacion/MetodosDepreciacionControl';
import Paginacion from '@/components/00_Utils/Paginacion';

// Styles
import '@styles/03_Contabilidad/Configuracion/configContabilidadControl.css';

const Main_ConfigContabilidadControl: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Estados para vistas (Métodos, Estatus, Clasificación)
    const [isOpenMetodos, setIsOpenMetodos] = useState(false);
    const [isOpenEstatus, setIsOpenEstatus] = useState(false);
    const [isOpenClasificacion, setIsOpenClasificacion] = useState(false);

    // Estados para Métodos de Depreciación
    const [metodosToEdit_Delete, setMetodosToEdit_Delete] = useState<MetodoDepreciacion | null>(null);
    const [busquedaMetodos, setBusquedaMetodos] = useState<string>('');
    const [paginaActualMetodos, setPaginaActualMetodos] = useState<number>(1);
    const [metodosPorPagina, setMetodosPorPagina] = useState<number>(5);
    const [isModalAddMetodoOpen, setModalAddMetodoOpen] = useState(false);
    const [isModalEditMetodoOpen, setModalEditMetodoOpen] = useState(false);
    const [isModalDeleteMetodoOpen, setModalDeleteMetodoOpen] = useState(false);

    // Métodos del store
    const metodos = useSelector((state: RootState) => state.depreciacionAF.metodosDepreciacion);
    const totalMetodos = metodos.length;

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

    // Funciones para modal Add
    const openModalAddMetodo = () => {
        setModalAddMetodoOpen(true);
    };
    const closeModalAddMetodo = () => {
        setModalAddMetodoOpen(false);
    };

    // Funciones para modal Edit
    const openModalEditMetodo = (metodo: MetodoDepreciacion) => {
        setMetodosToEdit_Delete(metodo);
        setModalEditMetodoOpen(true);
    };
    const closeModalEditMetodo = () => {
        setModalEditMetodoOpen(false);
        setMetodosToEdit_Delete(null);
    };

    // Funciones para alert Delete
    const openAlertDeleteMetodo = (metodo: MetodoDepreciacion) => {
        setMetodosToEdit_Delete(metodo);
        setModalDeleteMetodoOpen(true);
    };
    const closeAlertDeleteMetodo = () => {
        setModalDeleteMetodoOpen(false);
        setMetodosToEdit_Delete(null);
    };

    // Filtrar y ordenar métodos
    const metodosFiltrados = Array.isArray(metodos)
        ? metodos
            .filter(
                (metodo) =>
                    metodo.nombre_metodo.toLowerCase().includes(busquedaMetodos.toLowerCase()) ||
                    metodo.id_metodo_depreciacion?.toString().includes(busquedaMetodos)
            )
            .sort((a, b) => a.id_metodo_depreciacion - b.id_metodo_depreciacion)
        : [];

    // Paginación
    const indexUltimoMetodo = paginaActualMetodos * metodosPorPagina;
    const indexPrimerMetodo = indexUltimoMetodo - metodosPorPagina;
    const metodosPaginaActual = metodosFiltrados.slice(indexPrimerMetodo, indexUltimoMetodo);
    const numeroTotalPaginasMetodos = Math.ceil(metodosFiltrados.length / metodosPorPagina);

    // Manejadores
    const handleSearchMetodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusquedaMetodos(e.target.value);
        setPaginaActualMetodos(1);
    };

    const handleChangeMetodosPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMetodosPorPagina(Number(e.target.value));
        setPaginaActualMetodos(1);
    };

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
