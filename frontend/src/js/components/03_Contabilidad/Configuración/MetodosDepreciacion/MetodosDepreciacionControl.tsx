import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { MetodoDepreciacion } from '@/@types/AlmacenGeneralTypes/depreciacionTypes';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddMetodoDepreciacion from './AddMetodoDepreciacion';
import EditMetodoDepreciacion from './EditMetodoDepreciacion';
import DeleteMetodoDepreciacion from './DeleteMetodoDepreciacion';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/03_Contabilidad/Configuracion/MetodosDepreciacion/metodosDepreciacionControl.css';

const MetodosDepreciacionControl: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [busqueda, setBusqueda] = useState<string>('');
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const [porPagina, setPorPagina] = useState<number>(5);

    const [isModalAddMetodoOpen, setModalAddMetodoOpen] = useState(false);
    const [isModalEditMetodoOpen, setModalEditMetodoOpen] = useState(false);
    const [isModalDeleteMetodoOpen, setModalDeleteMetodoOpen] = useState(false);
    const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoDepreciacion | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                await dispatch(fetchMetodosDepreciacion()).unwrap();
            } catch (error) {
                console.error(error);
            }
        };
        load();
    }, [dispatch]);

    const metodos: MetodoDepreciacion[] = useSelector((state: RootState) => state.depreciacionAF.metodosDepreciacion);

    const filtrados = metodos
        .filter(m =>
            m.nombre_metodo.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.id_metodo_depreciacion?.toString().includes(busqueda)
        )
        .sort((a, b) => a.id_metodo_depreciacion - b.id_metodo_depreciacion);

    const total = filtrados.length;
    const indexUlt = paginaActual * porPagina;
    const indexPrim = indexUlt - porPagina;
    const pageItems = filtrados.slice(indexPrim, indexUlt);

    const numeroTotalPaginas = Math.max(1, Math.ceil(total / porPagina));

    return (
        <div className='mainDiv_MetodosDepreciacionControl'>
            <div className='searchAdd_ButtonDiv'>
                <div className='text_Div'>
                    <p>Mostrando {pageItems.length} de {metodos.length} métodos</p>
                </div>

                <div className='buttons_Div'>
                    <select className='selectList' value={porPagina} onChange={(e) => { setPorPagina(Number(e.target.value)); setPaginaActual(1); }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>

                    <input type='text' placeholder='Buscar por nombre o ID' value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} />

                    <button className='buttonAdd' onClick={() => setModalAddMetodoOpen(true)}>
                        <IoAddCircleOutline className='iconAdd' /> Nuevo Método
                    </button>
                </div>
            </div>

            {filtrados.length === 0 ? (
                <div className='noEntities'>
                    <FiAlertTriangle /> <p>  No hay métodos registrados </p> <FiAlertTriangle />
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
                                    <th id='th_MetodoDepreciacionID'>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Fórmula</th>
                                    <th>Tasa Default</th>
                                    <th>Estatus</th>
                                    <th>Creado</th>
                                    <th>Modificado</th>
                                    <th id='th_Acciones'>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map(m => (
                                    <tr key={m.id_metodo_depreciacion}>
                                        <td id='td_MetodoDepreciacionID'>{m.id_metodo_depreciacion}</td>
                                        <td>{m.nombre_metodo}</td>
                                        <td>{m.descripcion_metodo}</td>
                                        <td>{m.formula}</td>
                                        <td>{m.tasa_default ?? '-'}</td>
                                        <td className={m.activo ? 'status-activo' : 'status-inactivo'}>{m.activo ? 'Activo' : 'Inactivo'}</td>
                                        <td>{(m as any).created_at ?? '-'}</td>
                                        <td>{(m as any).updated_at ?? '-'}</td>
                                        <td id='td_Acciones'>
                                            <div className='divActions'>
                                                <button className='button_editEntity' onClick={() => { setMetodoSeleccionado(m); setModalEditMetodoOpen(true); }}><MdEdit /></button>
                                                <button className='button_deleteEntity' onClick={() => { setMetodoSeleccionado(m); setModalDeleteMetodoOpen(true); }}><MdDeleteForever /></button>
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

            {isModalAddMetodoOpen && (
                <AddMetodoDepreciacion
                    isOpen={isModalAddMetodoOpen}
                    onClose={() => setModalAddMetodoOpen(false)}
                />
            )}

            {isModalEditMetodoOpen && metodoSeleccionado && (
                <EditMetodoDepreciacion
                    isOpen={isModalEditMetodoOpen}
                    onClose={() => setModalEditMetodoOpen(false)}
                    metodo={metodoSeleccionado}
                />
            )}

            {isModalDeleteMetodoOpen && metodoSeleccionado && (
                <DeleteMetodoDepreciacion
                    isOpen={isModalDeleteMetodoOpen}
                    onClose={() => setModalDeleteMetodoOpen(false)}
                    metodo={metodoSeleccionado}
                />
            )}
        </div>
    );
};

export default MetodosDepreciacionControl;
