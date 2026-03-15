// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Ubicaciones
import { Ubicaciones } from '@/@types/mainTypes';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';

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

  
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [ubicacionesPorPagina, setUbicacionesPorPagina] = useState<number>(5);

    
  const [isModalAddUbicacionOpen, setModalAddUbicacionOpen] = useState(false);
  const [isModalEditUbicacionOpen, setModalEditUbicacionOpen] = useState(false);
  const [isModalDeleteUbicacionOpen, setModalDeleteUbicacionOpen] = useState(false);


  // Añadir Ubicación
  const openModalAddUbicacion = () => {
    setModalAddUbicacionOpen(true);
  };
  const closeModalAddUbicacion = () => {
    setModalAddUbicacionOpen(false);
  };
  
  // Editar Ubicación
  const openModalEditUbicacion = (ubicacion: Ubicaciones) => {
    setUbicacionToEdit_Delete(ubicacion)
    setModalEditUbicacionOpen(true);
  };
  const closeModalEditUbicacion = () => {
    setModalEditUbicacionOpen(false);
    setUbicacionToEdit_Delete(null)
  };
  
  // Eliminar Ubicación
  const openAlertDeleteUbicacion = (ubicacion: Ubicaciones) => {
    setUbicacionToEdit_Delete(ubicacion)
    setModalDeleteUbicacionOpen(true);

  };
  const closeAlertDeleteUbicacion = () => {
    setModalDeleteUbicacionOpen(false);
    setUbicacionToEdit_Delete(null)

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


  // Filtrar y ordenar ubicaciones basados en la búsqueda
  const ubicacionesFiltradas = ubicaciones
    .filter(ubicacion =>
      ubicacion.nombre_ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      ubicacion.id_ubicacion?.toString().includes(busqueda)
    )
    .sort((a, b) => a.id_ubicacion! - b.id_ubicacion!);

  // Obtener las ubicaciones para la página actual
  const indexUltimoUbicacion = paginaActual * ubicacionesPorPagina;
  const indexPrimerUbicacion = indexUltimoUbicacion - ubicacionesPorPagina;
  const ubicacionesPaginaActual = ubicacionesFiltradas.slice(indexPrimerUbicacion, indexUltimoUbicacion);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(ubicacionesFiltradas.length / ubicacionesPorPagina);

  // Crear nuevas ubicaciones
  const handleNuevoUbicacion = () => {
    openModalAddUbicacion();
  };

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de ubicaciones por página
  const handleChangeUbicacionesPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUbicacionesPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de ubicaciones por página
  };


  return(
    <div className='mainDiv_UbicacionControl'>
      <div className='searchAdd_ButtonDiv'>
 
        <div className='text_Div'>
          <h1>Ubicaciones</h1>
          <p>Mostrando {ubicacionesPaginaActual.length} de {ubicaciones.length} ubicaciones</p>
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

      {ubicacionesFiltradas && ubicacionesFiltradas.length === 0 ? (
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
