// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Ubicaciones
import { Ubicaciones } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import AddUbicacionControl from './AddUbicacion';
import EditUbicacion from './EditUbicacion';
import DeleteUbicacion from './DeleteUbicacion';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/99_Administrador/Ubicaciones/ubicacionesControl.css';

const Main_UbicacionesControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [ubicacionToEdit_Delete, setUbicacionToEdit_Delete] = useState<Ubicaciones | null>(null); // Usuario seleccionado para editar_eliminar

  
  const [isModalAddUbicacionOpen, setModalAddUbicacionOpen] = useState(false);
  const [isModalEditUbicacionOpen, setModalEditUbicacionOpen] = useState(false);
  const [isModalDeleteUbicacionOpen, setModalDeleteUbicacionOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Paginacion servidor: fetcher que llama al thunk de ubicaciones con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren.
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: Ubicaciones[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getUbicaciones(params)).unwrap();
      if (resultAction.success && resultAction.ubicaciones) {
        return { data: resultAction.ubicaciones, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener las ubicaciones');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: ubicacionesPorPagina,
    items: ubicacionesPaginaActual,
    totalItems: totalUbicaciones,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeUbicacionesPorPagina,
  } = usePaginacionServidor<Ubicaciones>({
    fetcher,
    perPageDefault: 5,
  });

  // Anadir Ubicacion
  const openModalAddUbicacion = () => {
    setModalAddUbicacionOpen(true);
  };
  const closeModalAddUbicacion = () => {
    setModalAddUbicacionOpen(false);
    // Recargar la tabla paginada tras crear una ubicacion.
    refetch();
  };

  // Editar Ubicacion
  const openModalEditUbicacion = (ubicacion: Ubicaciones) => {
    setUbicacionToEdit_Delete(ubicacion)
    setModalEditUbicacionOpen(true);
  };
  const closeModalEditUbicacion = () => {
    setModalEditUbicacionOpen(false);
    setUbicacionToEdit_Delete(null)
    // Recargar la tabla paginada tras editar una ubicacion.
    refetch();
  };

  // Eliminar Ubicacion
  const openAlertDeleteUbicacion = (ubicacion: Ubicaciones) => {
    setUbicacionToEdit_Delete(ubicacion)
    setModalDeleteUbicacionOpen(true);

  };
  const closeAlertDeleteUbicacion = () => {
    setModalDeleteUbicacionOpen(false);
    setUbicacionToEdit_Delete(null)
    // Recargar la tabla paginada tras eliminar una ubicacion.
    refetch();
  };  

  // Cargar las ubicaciones desde la API solo si no están cargados en el store
  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const resultAction = await dispatch(getUbicaciones()).unwrap();
        if (resultAction.success) {
          dispatch(setListUbicaciones(resultAction.ubicaciones!)); // Guarda las ubicaciones en el store
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
      }
    };
    cargarUbicaciones();
  }, []); // Solo ejecuta el effect si los departamentos no están en el store
  

  const ubicaciones = useSelector((state: RootState) => state.ubicaciones?.ubicaciones || []);
  console.log(ubicaciones)

  // Crear nuevas ubicaciones
  const handleNuevoUbicacion = () => {
    openModalAddUbicacion();
  };

  return (
    <div className='mainDiv_UbicacionControl'>
      <div className='searchAdd_ButtonDiv'>
 
        <div className='text_Div'>
          <h1>Ubicaciones</h1>
          <p>Mostrando {ubicacionesPaginaActual.length} de {totalUbicaciones} ubicaciones</p>
        </div>
        
        <div className='buttons_Div'>
          <select className='selectList' value={ubicacionesPorPagina} id='selectList' name='selectList' onChange={handleChangeUbicacionesPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={busqueda}
            id='busqueda'
            name='busqueda'
            onChange={handleSearch}
          />
          <button className='buttonAdd' onClick={handleNuevoUbicacion}>
            <IoAddCircleOutline className='iconAdd' /> Nueva Ubicación
          </button>
        </div>

      </div>

      <hr />

      {!loading && ubicacionesPaginaActual.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay ubicaciones registradas </p> <FiAlertTriangle />
        </div>
      ) : (
        <>
          {/* Paginación */}
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
                  <th id='th_UbicacionID'>ID</th>
                  <th id='th_NombreUbicacion'>Ubicación</th>
                  <th id='th_DescripcionUbicacion'>Descripción</th>
                  <th id='th_EstatusActivo'>Estatus</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>


              <tbody>
                {ubicacionesPaginaActual.map(ubicacion => ( 
                  <tr key={ubicacion.id_ubicacion}>
                    <td id='td_UbicacionID'>{ubicacion.id_ubicacion}</td>
                    <td id='td_NombreUbicacion'>{ubicacion.nombre_ubicacion}</td>
                    <td id='td_DescripcionUbicacion'>{ubicacion.descripcion_ubicacion}</td>
                    <td id='td_EstatusActivo'   className={ubicacion.estatus_activo ? 'status-activo' : 'status-inactivo'}> {ubicacion.estatus_activo ? 'Activo' : 'Inactivo'}</td>
                    <td id='td_FechaCreacion'>{ubicacion.created_at}</td>
                    <td id='td_FechaModificacion'>{ubicacion.updated_at}</td>
                    


                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditUbicacion(ubicacion)}> <MdEdit/></button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteUbicacion(ubicacion)}><MdDeleteForever/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />
        </>
      )}

      {isModalAddUbicacionOpen && (
        <AddUbicacionControl isOpen={isModalAddUbicacionOpen} onClose={closeModalAddUbicacion} />
      )}

      {isModalEditUbicacionOpen && ubicacionToEdit_Delete && (
        <EditUbicacion isOpen={isModalEditUbicacionOpen} onClose={closeModalEditUbicacion} ubicacionToEdit={ubicacionToEdit_Delete}/>
      )}

      {isModalDeleteUbicacionOpen && ubicacionToEdit_Delete && (
        <DeleteUbicacion isOpen={isModalDeleteUbicacionOpen} onClose={closeAlertDeleteUbicacion} ubicacionToDelete={ubicacionToEdit_Delete}/>
      )}




    </div>
  )
};

export default Main_UbicacionesControl;
