import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';

// Types
import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Actions / Reducer (ajustar nombres según implementación en store)
import { getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';

// Components
import Paginacion from '../../../../00_Utils/Paginacion';
import AddEstatusAF from './AddEstatusAF';
import EditEstatusAF from './EditEstatusAF';
import DeleteEstatusAF from './DeleteEstatusAF';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Parametros/EstatusAF/estatusAFControl.css'

const EstatusAFControl: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [estatusToEdit_Delete, setEstatusToEdit_Delete] = useState<EstatusActivosFijos | null>(null);

    const [busqueda, setBusqueda] = useState<string>('');
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const [itemsPorPagina, setItemsPorPagina] = useState<number>(5);

    const [isModalAddOpen, setModalAddOpen] = useState(false);
    const [isModalEditOpen, setModalEditOpen] = useState(false);
    const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                const resultAction = await dispatch(getEstatusAF()).unwrap();
                console.log('Estatus AF cargados:', resultAction.estatusAF);
                if (resultAction.success) {
                    dispatch(setListEstatusAF(resultAction.estatusAF!));
                } else {
                    console.error('Error cargar estatus AF', resultAction.message);
                }
            } catch (error) {
                console.error(error);
            }
        };
        cargar();
    }, [dispatch]);

    const estatusList = useSelector((state: RootState) => state.estatusAF.estatusAF || []);
    const total = estatusList.length;

    const estatusFiltrados = Array.isArray(estatusList)
        ? estatusList
            .filter(e =>
                e.descripcion_estatusaf.toLowerCase().includes(busqueda.toLowerCase()) ||
                e.id_estatusaf?.toString().includes(busqueda)
            )
            .sort((a, b) => (a.id_estatusaf || 0) - (b.id_estatusaf || 0))
        : [];

    const indexUltimo = paginaActual * itemsPorPagina;
    const indexPrimero = indexUltimo - itemsPorPagina;
    const paginaActualList = estatusFiltrados.slice(indexPrimero, indexUltimo);

    const numeroTotalPaginas = Math.ceil(estatusFiltrados.length / itemsPorPagina);

    return (
        <div className='mainDiv_EstatusAFControl'>
            <div className='searchAdd_ButtonDiv'>
                <div className='text_Div'>
                    <h1>Estatus Activos Fijos</h1>
                    <p>Mostrando {paginaActualList.length} de {total} estatus</p>
                </div>

                <div className='buttons_Div'>
                    <select className='selectList' value={itemsPorPagina} onChange={e => { setItemsPorPagina(Number(e.target.value)); setPaginaActual(1); }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>

                    <input type='text' placeholder='Buscar por descripcion o ID' value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }} />

                    <button className='buttonAdd' onClick={() => setModalAddOpen(true)}>
                        <IoAddCircleOutline className='iconAdd' /> Nuevo Estatus
                    </button>
                </div>
            </div>

            <hr />

            {estatusFiltrados && estatusFiltrados.length === 0 ? (
                <div className='noEntities'>
                    <FiAlertTriangle /> <p>No hay estatus registrados</p> <FiAlertTriangle />
                </div>
            ) : (
                <>
                    <Paginacion paginaActual={paginaActual} numeroTotalPaginas={numeroTotalPaginas} onPageChange={setPaginaActual} onPaginaAnterior={() => setPaginaActual(paginaActual - 1)} onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)} />

                    <div className='list_entitiesDiv'>
                        <table>
                            <thead>
                                <tr>
                                    <th id='th_EstatusAFID'>ID</th>
                                    <th id='th_EstatusAFDescripcion'>Descripción</th>
                                    <th id='th_EstatusAFCreado'>Creado</th>
                                    <th id='th_FechaModificacion'>Modificado</th>
                                    <th id='th_Acciones'>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginaActualList.map(e => (
                                    <tr key={e.id_estatusaf}>
                                        <td id='td_EstatusAFID'>{e.id_estatusaf}</td>
                                        <td id='td_EstatusAFDescripcion'>{e.descripcion_estatusaf}</td>
                                        <td id='td_EstatusAFCreado'>{e.created_at}</td>
                                        <td id='td_EstatusAFModificado'>{e.updated_at}</td>
                                        <td id='td_Acciones'>
                                            <div className='divActions'>
                                                <button className='button_editEntity' onClick={() => { setEstatusToEdit_Delete(e); setModalEditOpen(true); }}><MdEdit /></button>
                                                <button className='button_deleteEntity' onClick={() => { setEstatusToEdit_Delete(e); setModalDeleteOpen(true); }}><MdDeleteForever /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Paginacion paginaActual={paginaActual} numeroTotalPaginas={numeroTotalPaginas} onPageChange={setPaginaActual} onPaginaAnterior={() => setPaginaActual(paginaActual - 1)} onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)} />
                </>
            )}

            {isModalAddOpen && <AddEstatusAF isOpen={isModalAddOpen} onClose={() => setModalAddOpen(false)} />}
            {isModalEditOpen && estatusToEdit_Delete && <EditEstatusAF isOpen={isModalEditOpen} onClose={() => { setModalEditOpen(false); setEstatusToEdit_Delete(null); }} estatusToEdit={estatusToEdit_Delete} />}
            {isModalDeleteOpen && estatusToEdit_Delete && <DeleteEstatusAF isOpen={isModalDeleteOpen} onClose={() => { setModalDeleteOpen(false); setEstatusToEdit_Delete(null); }} estatusToDelete={estatusToEdit_Delete} />}

        </div>
    );
};

export default EstatusAFControl;
