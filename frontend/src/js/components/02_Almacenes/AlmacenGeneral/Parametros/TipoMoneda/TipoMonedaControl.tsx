// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';

// Tipos de Moneda
import { TiposMoneda } from '@/@types/fiscalTypes';
import { getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { setListTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaReducer';

// Componentes
import Paginacion from '../../../../00_Utils/Paginacion';
import AddTipoMoneda from './AddTipoMoneda';
import EditTipoMoneda from './EditTipoMoneda';
import DeleteTipoMoneda from './DeleteTipoMoneda';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoMoneda/tipoMonedaControl.css';

const AlmacenGeneral_ControlTipoMoneda: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [tipoMonedaToEdit_Delete, setTipoMonedaToEdit_Delete] = useState<TiposMoneda | null>(null);
    const [busqueda, setBusqueda] = useState<string>('');
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const [tiposMonedaPorPagina, setTiposMonedaPorPagina] = useState<number>(5);

    const [isModalAddTipoMonedaOpen, setModalAddTipoMonedaOpen] = useState(false);
    const [isModalEditTipoMonedaOpen, setModalEditTipoMonedaOpen] = useState(false);
    const [isModalDeleteTipoMonedaOpen, setModalDeleteTipoMonedaOpen] = useState(false);

    const openModalAddTipoMoneda = () => setModalAddTipoMonedaOpen(true);
    const closeModalAddTipoMoneda = () => setModalAddTipoMonedaOpen(false);

    const openModalEditTipoMoneda = (tipoMoneda: TiposMoneda) => {
        setTipoMonedaToEdit_Delete(tipoMoneda);
        setModalEditTipoMonedaOpen(true);
    };
    const closeModalEditTipoMoneda = () => {
        setModalEditTipoMonedaOpen(false);
        setTipoMonedaToEdit_Delete(null);
    };

    const openAlertDeleteTipoMoneda = (tipoMoneda: TiposMoneda) => {
        setTipoMonedaToEdit_Delete(tipoMoneda);
        setModalDeleteTipoMonedaOpen(true);
    };
    const closeAlertDeleteTipoMoneda = () => {
        setModalDeleteTipoMonedaOpen(false);
        setTipoMonedaToEdit_Delete(null);
    };

    useEffect(() => {
        const cargarTiposMoneda = async () => {
            try {
                const resultAction = await dispatch(getTiposMoneda()).unwrap();
                if (resultAction.success) {
                    dispatch(setListTiposMoneda(resultAction.tiposMoneda || []));
                } else {
                    console.log('Error', resultAction.message);
                }
            } catch (error) {
                console.error('Error al cargar tipos de moneda:', error);
            }
        };
        cargarTiposMoneda();
    }, [dispatch]);

    const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);
    const totalTiposMoneda = tiposMoneda.length;

    const tiposMonedaFiltradas = Array.isArray(tiposMoneda)
        ? tiposMoneda
            .filter(tipoMoneda =>
                tipoMoneda.descripcion_tipomoneda.toLowerCase().includes(busqueda.toLowerCase()) ||
                tipoMoneda.id_tipomoneda?.toString().includes(busqueda)
            )
            .sort((a, b) => (a.id_tipomoneda || 0) - (b.id_tipomoneda || 0))
        : [];

    const indexUltimaTipoMoneda = paginaActual * tiposMonedaPorPagina;
    const indexPrimeraTipoMoneda = indexUltimaTipoMoneda - tiposMonedaPorPagina;
    const tiposMonedaPaginaActual = tiposMonedaFiltradas.slice(indexPrimeraTipoMoneda, indexUltimaTipoMoneda);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusqueda(e.target.value);
        setPaginaActual(1);
    };

    const handleChangeTiposMonedaPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTiposMonedaPorPagina(Number(e.target.value));
        setPaginaActual(1);
    };

    const numeroTotalPaginas = Math.ceil(tiposMonedaFiltradas.length / tiposMonedaPorPagina);

    return (
        <div className='mainDiv_TipoMonedaControl'>
            <div className='searchAdd_ButtonDiv'>
                <div className='text_Div'>
                    <h1>Tipos de Moneda</h1>
                    <p>Mostrando {tiposMonedaPaginaActual.length} de {totalTiposMoneda} tipos de moneda</p>
                </div>

                <div className='buttons_Div'>
                    <select className='selectList' value={tiposMonedaPorPagina} onChange={handleChangeTiposMonedaPorPagina}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>

                    <input
                        type='text'
                        placeholder='Buscar por descripción o ID'
                        value={busqueda}
                        onChange={handleSearch}
                    />
                    <button className='buttonAdd' onClick={openModalAddTipoMoneda}>
                        <IoAddCircleOutline className='iconAdd' /> Nuevo Tipo de Moneda
                    </button>
                </div>
            </div>

            <hr />

            {tiposMonedaFiltradas && tiposMonedaFiltradas.length === 0 ? (
                <div className='noEntities'>
                    <FiAlertTriangle /> <p>No hay tipos de moneda registrados</p> <FiAlertTriangle />
                </div>
            ) : (
                <>
                    <Paginacion
                        paginaActual={paginaActual}
                        numeroTotalPaginas={numeroTotalPaginas}
                        onPageChange={setPaginaActual}
                        onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
                        onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
                    />

                    <div className='list_entitiesDiv'>
                        <table>
                            <thead>
                                <tr>
                                    <th id='th_TipoMonedaID'>ID</th>
                                    <th id='th_TipoMoneda'>Tipo de Moneda</th>
                                    <th id='th_FechaCreacion'>Fecha Creación</th>
                                    <th id='th_FechaModificacion'>Fecha Modificación</th>
                                    <th id='th_Acciones'>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiposMonedaPaginaActual.map(tipoMoneda => (
                                    <tr key={tipoMoneda.id_tipomoneda}>
                                        <td id='td_TipoMonedaID'>{tipoMoneda.id_tipomoneda}</td>
                                        <td id='td_TipoMoneda'>{tipoMoneda.descripcion_tipomoneda}</td>
                                        <td id='td_FechaCreacion'>{tipoMoneda.created_at}</td>
                                        <td id='td_FechaModificacion'>{tipoMoneda.updated_at}</td>
                                        <td id='td_Acciones'>
                                            <div className='divActions'>
                                                <button className='button_editEntity' onClick={() => openModalEditTipoMoneda(tipoMoneda)}><MdEdit /></button>
                                                <button className='button_deleteEntity' onClick={() => openAlertDeleteTipoMoneda(tipoMoneda)}><MdDeleteForever /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Paginacion
                        paginaActual={paginaActual}
                        numeroTotalPaginas={numeroTotalPaginas}
                        onPageChange={setPaginaActual}
                        onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
                        onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
                    />
                </>
            )}

            {isModalAddTipoMonedaOpen && (
                <AddTipoMoneda isOpen={isModalAddTipoMonedaOpen} onClose={closeModalAddTipoMoneda} />
            )}

            {isModalEditTipoMonedaOpen && tipoMonedaToEdit_Delete && (
                <EditTipoMoneda isOpen={isModalEditTipoMonedaOpen} onClose={closeModalEditTipoMoneda} tipoMonedaToEdit={tipoMonedaToEdit_Delete} />
            )}

            {isModalDeleteTipoMonedaOpen && tipoMonedaToEdit_Delete && (
                <DeleteTipoMoneda isOpen={isModalDeleteTipoMonedaOpen} onClose={closeAlertDeleteTipoMoneda} tipoMonedaToDelete={tipoMonedaToEdit_Delete} />
            )}
        </div>
    );
};

export default AlmacenGeneral_ControlTipoMoneda;
