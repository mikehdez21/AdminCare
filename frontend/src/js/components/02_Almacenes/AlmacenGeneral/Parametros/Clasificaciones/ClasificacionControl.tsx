// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Clasificaciones
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacenGeneral/Clasificaciones/clasificacionesReducer';

// Componentes
import Paginacion from '../../../../00_Utils/Paginacion';
import AddClasificacion from './AddClasificacion';
import EditClasificacion from './EditClasificacion';
import DeleteClasificacion from './DeleteClasificacion';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Parametros/Clasificaciones/clasificacionesAFControl.css';




const AlmacenGeneral_ControlClasificacion: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [clasificacionToEdit_Delete, setClasificacionToEdit_Delete] = useState<ClasificacionesAF | null>(null); // clasificacion seleccionado para editar_eliminar

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [clasificacionesPorPagina, setClasificacionesPorPagina] = useState<number>(5);

  const [isModalAddClasificacionOpen, setModalAddClasificacionOpen] = useState(false);
  const [isModalEditClasificacionOpen, setModalEditClasificacionOpen] = useState(false);
  const [isModalDeleteClasificacionOpen, setModalDeleteClasificacionOpen] = useState(false);

  // Añadir Clasificacion
  const openModalAddClasificacion = () => {
    setModalAddClasificacionOpen(true);
  };
  const closeModalAddClasificacion = () => {
    setModalAddClasificacionOpen(false);
  };

  // Editar Clasificacion
  const openModalEditClasificacion = (clasificacion: ClasificacionesAF) => {
    setClasificacionToEdit_Delete(clasificacion); // Establecer el clasificacion seleccionado
    setModalEditClasificacionOpen(true);
  };
  const closeModalEditClasificacion = () => {
    setModalEditClasificacionOpen(false);
    setClasificacionToEdit_Delete(null); // Establecer el clasificacion seleccionado

  };

  // Eliminar Clasificacion
  const openAlertDeleteClasificacion = (clasificacion: ClasificacionesAF) => {
    setClasificacionToEdit_Delete(clasificacion); // Establecer el clasificacion seleccionado
    setModalDeleteClasificacionOpen(true);
  };
  const closeAlertDeleteClasificacion = () => {
    setModalDeleteClasificacionOpen(false);
    setClasificacionToEdit_Delete(null); // Establecer el clasificacion seleccionado

  };

  // Función para cargar lass Clasificaciones desde la base de datos y Redux
  useEffect(() => {
    const cargarClasificaciones = async () => {
      try {
        const resultAction = await dispatch(getClasificaciones()).unwrap();

        if (resultAction.success) {
          dispatch(setListClasificacion(resultAction.clasificacion!)); // Establece el clasificacion en el estado

        } else {
          console.log('Error', resultAction.message)
        }


      } catch (error) {
        console.error('Error al cargar clasificaciones:', error);
      }
    };
    cargarClasificaciones();
  }, []);

  const clasificaciones = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);
  const totalClasificaciones = clasificaciones.length;

  // Filtrar y ordenar clasificaciones basados en la búsqueda
  const clasificacionesFiltradas = Array.isArray(clasificaciones)
    ? clasificaciones
      .filter(clasificacion =>
        clasificacion.nombre_clasificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
        clasificacion.id_clasificacion?.toString().includes(busqueda)
      )
      .sort((a, b) => a.id_clasificacion! - b.id_clasificacion!) // Orden ascendente por ID
    : [];

  // Obtener las clasificaciones para la página actual
  const indexUltimaClasificacion = paginaActual * clasificacionesPorPagina;
  const indexPrimeraClasificacion = indexUltimaClasificacion - clasificacionesPorPagina;
  const clasificacionesPaginaActual = clasificacionesFiltradas.slice(indexPrimeraClasificacion, indexUltimaClasificacion);

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de clasificaciones por página
  const handleChangeClasificacionesPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClasificacionesPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de clasificaciones por página
  };

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(clasificacionesFiltradas.length / clasificacionesPorPagina);


  return (
    <div className='mainDiv_ClasificacionesControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Clasificaciones Activo Fijo</h1>
          <p>Mostrando {clasificacionesPaginaActual.length} de {totalClasificaciones} clasificaciones</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={clasificacionesPorPagina} onChange={handleChangeClasificacionesPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={busqueda}
            onChange={handleSearch}
          />
          <button className='buttonAdd' onClick={openModalAddClasificacion}>
            <IoAddCircleOutline className='iconAdd' /> Nueva Clasificación
          </button>
        </div>

      </div>

      <hr />

      {clasificacionesFiltradas && clasificacionesFiltradas.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay clasificaciones registradas </p> <FiAlertTriangle />
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
                  <th id='th_ClasificacionID'>ID</th>
                  <th id='th_Clasificacion'>Clasificación</th>
                  <th id='th_CuentaContable'>Cuenta Contable</th>
                  <th id='th_EstatusActivo'>Estatus</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>

                  <th id='th_Acciones'>ACCIONES</th>


                </tr>
              </thead>
              <tbody>
                {clasificacionesPaginaActual.map(clasificacion => (
                  <tr key={clasificacion.id_clasificacion}>
                    <td id='td_ClasificacionID'>{clasificacion.id_clasificacion}</td>
                    <td id='td_Clasificacion'>{clasificacion.nombre_clasificacion}</td>
                    <td id='td_CuentaContable'>{clasificacion.cuenta_contable}</td>
                    <td id='td_EstatusActivo' className={clasificacion.estatus_activo ? 'status-activo' : 'status-inactivo'}> {clasificacion.estatus_activo ? 'Activo' : 'Inactivo'}</td>
                    <td id='td_FechaCreacion'>{clasificacion.created_at}</td>
                    <td id='td_FechaModificacion'>{clasificacion.updated_at}</td>

                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditClasificacion(clasificacion)}> <MdEdit /> </button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteClasificacion(clasificacion)}><MdDeleteForever /> </button>
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

      {isModalAddClasificacionOpen && (
        <AddClasificacion isOpen={isModalAddClasificacionOpen} onClose={closeModalAddClasificacion} />
      )}

      {isModalEditClasificacionOpen && clasificacionToEdit_Delete && (
        <EditClasificacion isOpen={isModalEditClasificacionOpen} onClose={closeModalEditClasificacion} clasificacionToEdit={clasificacionToEdit_Delete} />
      )}

      {isModalDeleteClasificacionOpen && clasificacionToEdit_Delete && (
        <DeleteClasificacion isOpen={isModalDeleteClasificacionOpen} onClose={closeAlertDeleteClasificacion} clasificacionToDelete={clasificacionToEdit_Delete} />
      )}

    </div>
  )
};

export default AlmacenGeneral_ControlClasificacion;


