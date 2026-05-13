// Bibliotecas
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';

// Tipos de Formas de Pago
import { FormasPago } from '@/@types/fiscalTypes';
import { getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { setListFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoReducer';

// Componentes
import Paginacion from '../../../../00_Utils/Paginacion';
import AddFormaPago from './AddFormaPago';
import EditFormaPago from './EditFormaPago';
import DeleteFormaPago from './DeleteFormaPago';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Parametros/FormaPago/formaPagoControl.css';

const AlmacenGeneral_ControlFormaPago: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const [formaPagoToEdit_Delete, setFormaPagoToEdit_Delete] = useState<FormasPago | null>(null);

    const [busqueda, setBusqueda] = useState<string>('');
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const [formasPagoPorPagina, setFormasPagoPorPagina] = useState<number>(5);

    const [isModalAddFormaPagoOpen, setModalAddFormaPagoOpen] = useState(false);
    const [isModalEditFormaPagoOpen, setModalEditFormaPagoOpen] = useState(false);
    const [isModalDeleteFormaPagoOpen, setModalDeleteFormaPagoOpen] = useState(false);

    const openModalAddFormaPago = () => setModalAddFormaPagoOpen(true);
    const closeModalAddFormaPago = () => setModalAddFormaPagoOpen(false);

    const openModalEditFormaPago = (formaPago: FormasPago) => {
        setFormaPagoToEdit_Delete(formaPago);
        setModalEditFormaPagoOpen(true);
    };
    const closeModalEditFormaPago = () => {
        setModalEditFormaPagoOpen(false);
        setFormaPagoToEdit_Delete(null);
    };

    const openAlertDeleteFormaPago = (formaPago: FormasPago) => {
        setFormaPagoToEdit_Delete(formaPago);
        setModalDeleteFormaPagoOpen(true);
    };
    const closeAlertDeleteFormaPago = () => {
        setModalDeleteFormaPagoOpen(false);
        setFormaPagoToEdit_Delete(null);
    };

    useEffect(() => {
        const cargarFormasPago = async () => {
            try {
                const resultAction = await dispatch(getFormasPago()).unwrap();

                if (resultAction.success) {
                    dispatch(setListFormasPago(resultAction.formasPago!));
                } else {
                    console.log('Error', resultAction.message);
                }
            } catch (error) {
                console.error('Error al cargar formas de pago:', error);
            }
        };

        cargarFormasPago();
    }, [dispatch]);

    const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
    const totalFormasPago = formasPago.length;

    const formasPagoFiltradas = Array.isArray(formasPago)
        ? formasPago
            .filter(formaPago =>
                formaPago.descripcion_formaspago.toLowerCase().includes(busqueda.toLowerCase()) ||
                formaPago.id_formapago?.toString().includes(busqueda)
            )
            .sort((a, b) => a.id_formapago! - b.id_formapago!)
        : [];

    const indexUltimaFormaPago = paginaActual * formasPagoPorPagina;
    const indexPrimeraFormaPago = indexUltimaFormaPago - formasPagoPorPagina;
    const formasPagoPaginaActual = formasPagoFiltradas.slice(indexPrimeraFormaPago, indexUltimaFormaPago);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusqueda(e.target.value);
        setPaginaActual(1);
    };

    const handleChangeFormasPagoPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormasPagoPorPagina(Number(e.target.value));
        setPaginaActual(1);
    };

    const numeroTotalPaginas = Math.ceil(formasPagoFiltradas.length / formasPagoPorPagina);

    return (
        <div className='mainDiv_FormasPagoControl'>
            <div className='searchAdd_ButtonDiv'>

                <div className='text_Div'>
                    <h1>Formas de Pago</h1>
                    <p>Mostrando {formasPagoPaginaActual.length} de {totalFormasPago} formas de pago</p>
                </div>

                <div className='buttons_Div'>
                    <select className='selectList' value={formasPagoPorPagina} onChange={handleChangeFormasPagoPorPagina}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Buscar por descripción o ID"
                        value={busqueda}
                        onChange={handleSearch}
                    />
                    <button className='buttonAdd' onClick={openModalAddFormaPago}>
                        <IoAddCircleOutline className='iconAdd' /> Nueva Forma de Pago
                    </button>
                </div>

            </div>

            <hr />

            {formasPagoFiltradas && formasPagoFiltradas.length === 0 ? (
                <div className='noEntities'>
                    <FiAlertTriangle /> <p>  No hay formas de pago registradas </p> <FiAlertTriangle />
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
                                    <th id='th_FormaPagoID'>ID</th>
                                    <th id='th_FormaPago'>Forma de Pago</th>
                                    <th id='th_FechaCreacion'>Fecha Creación</th>
                                    <th id='th_FechaModificacion'>Fecha Modificación</th>
                                    <th id='th_Acciones'>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formasPagoPaginaActual.map(formaPago => (
                                    <tr key={formaPago.id_formapago}>
                                        <td id='td_FormaPagoID'>{formaPago.id_formapago}</td>
                                        <td id='td_FormaPago'>{formaPago.descripcion_formaspago}</td>
                                        <td id='td_FechaCreacion'>{formaPago.created_at}</td>
                                        <td id='td_FechaModificacion'>{formaPago.updated_at}</td>
                                        <td id='td_Acciones'>
                                            <div className='divActions'>
                                                <button className='button_editEntity' onClick={() => openModalEditFormaPago(formaPago)}>
                                                    <MdEdit />
                                                </button>
                                                <button className='button_deleteEntity' onClick={() => openAlertDeleteFormaPago(formaPago)}>
                                                    <MdDeleteForever />
                                                </button>
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

            {isModalAddFormaPagoOpen && (
                <AddFormaPago isOpen={isModalAddFormaPagoOpen} onClose={closeModalAddFormaPago} />
            )}

            {isModalEditFormaPagoOpen && formaPagoToEdit_Delete && (
                <EditFormaPago
                    isOpen={isModalEditFormaPagoOpen}
                    onClose={closeModalEditFormaPago}
                    formaPagoToEdit={formaPagoToEdit_Delete}
                />
            )}

            {isModalDeleteFormaPagoOpen && formaPagoToEdit_Delete && (
                <DeleteFormaPago
                    isOpen={isModalDeleteFormaPagoOpen}
                    onClose={closeAlertDeleteFormaPago}
                    formaPagoToDelete={formaPagoToEdit_Delete}
                />
            )}

        </div>
    )
};

export default AlmacenGeneral_ControlFormaPago;
