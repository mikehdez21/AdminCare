// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Departamentos
import { Departamentos } from '@/@types/mainTypes';
import { getDepartamentos } from '@/store/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/Departamentos/departamentosReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddDepartamentoControl from './AddDepartamento';
import EditDepartamento from './EditDepartamento';
import DeleteDepartamentos from './DeleteDepartamento';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/99_Administrador/departamentosControl.css';

const Main_DepartamentosControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [departamentoToEdit_Delete, setDepartamentoToEdit_Delete] = useState<Departamentos | null>(null); // Usuario seleccionado para editar_eliminar

  
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [departamentosPorPagina, setDepartamentosPorPagina] = useState<number>(5);

    
  const [isModalAddDepartamentoOpen, setModalAddDepartamentoOpen] = useState(false);
  const [isModalEditDepartamentoOpen, setModalEditDepartamentoOpen] = useState(false);
  const [isModalDeleteDepartamentoOpen, setModalDeleteDepartamentoOpen] = useState(false);


  // Añadir Departamento
  const openModalAddDepartamento = () => {
    setModalAddDepartamentoOpen(true);
  };
  const closeModalAddDepartamento = () => {
    setModalAddDepartamentoOpen(false);
  };
  
  // Editar Departamento
  const openModalEditDepartamento = (departamento: Departamentos) => {
    setDepartamentoToEdit_Delete(departamento)
    setModalEditDepartamentoOpen(true);
  };
  const closeModalEditDepartamento = () => {
    setModalEditDepartamentoOpen(false);
    setDepartamentoToEdit_Delete(null)
  };
  
  // Eliminar Departamento
  const openAlertDeleteDepartamento = (departamento: Departamentos) => {
    setDepartamentoToEdit_Delete(departamento)
    setModalDeleteDepartamentoOpen(true);

  };
  const closeAlertDeleteDepartamento = () => {
    setModalDeleteDepartamentoOpen(false);
    setDepartamentoToEdit_Delete(null)

  };

  // Cargar los departamentos desde la API solo si no están cargados en el store
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        const resultAction = await dispatch(getDepartamentos()).unwrap();
        if (resultAction.success) {
          dispatch(setListDepartamentos(resultAction.departamentos!)); // Guarda los departamentos en el store
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar departamentos:', error);
      }
    };
    cargarDepartamentos();
  }, []); // Solo ejecuta el effect si los departamentos no están en el store
  

  const departamentos = useSelector((state: RootState) => state.departamentos?.departamentos || []);
  console.log(departamentos)


  // Filtrar y ordenar departamentos basados en la búsqueda
  const departamentosFiltrados = departamentos
    .filter(departamento =>
      departamento.nombre_departamento.toLowerCase().includes(busqueda.toLowerCase()) ||
      departamento.id_departamento?.toString().includes(busqueda)
    )
    .sort((a, b) => a.id_departamento! - b.id_departamento!);

  // Obtener los departamentos para la página actual
  const indexUltimoDepartamento = paginaActual * departamentosPorPagina;
  const indexPrimerDepartamento = indexUltimoDepartamento - departamentosPorPagina;
  const departamentosPaginaActual = departamentosFiltrados.slice(indexPrimerDepartamento, indexUltimoDepartamento);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(departamentosFiltrados.length / departamentosPorPagina);


  // Crear nuevos departamentos
  const handleNuevoDepartamento = () => {
    openModalAddDepartamento();
  };

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de departamentos por página
  const handleChangeDepartamentosPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartamentosPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de departamentos por página
  };


  return(
    <div className='mainDiv_DepartamentoControl'>
      <div className='searchAdd_ButtonDiv'>
 
        <div className='text_Div'>
          <h1>Departamentos</h1>
          <p>Mostrando {departamentosPaginaActual.length} de {departamentos.length} departamentos</p>
        </div>
        
        <div className='buttons_Div'>
          <select className='selectList' value={departamentosPorPagina} id='selectList' name='selectList' onChange={handleChangeDepartamentosPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoDepartamento}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Departamento
          </button>
        </div>

      </div>

      <hr />

      {departamentosFiltrados && departamentosFiltrados.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay departamentos registrados </p> <FiAlertTriangle />
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
                  <th id='th_DepartamentoID'>ID</th>
                  <th id='th_NombreDepartamento'>Departamento</th>
                  <th id='th_DescripcionDepartamento'>Descripción</th>
                  <th id='th_TipoDepartamento'>Tipo</th>
                  <th id='th_Atiende'>AtiendePx</th>
                  <th id='th_EstatusActivo'>Estatus</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>


              <tbody>
                {departamentosPaginaActual.map(departamento => (
                  <tr key={departamento.id_departamento}>
                    <td id='td_DepartamentoID'>{departamento.id_departamento}</td>
                    <td id='td_NombreDepartamento'>{departamento.nombre_departamento}</td>
                    <td id='td_DescripcionDepartamento'>{departamento.descripcion}</td>
                    <td id='td_TipoDepartamento'>{departamento.tipo_departamento}</td>
                    <td id='td_Atiende'>{departamento.atiende_pacientes ? 'Atiende Px' : 'No Atiende Px'}</td>
                    <td id='td_EstatusActivo'   className={departamento.estatus_activo ? 'status-activo' : 'status-inactivo'}> {departamento.estatus_activo ? 'Activo' : 'Inactivo'}</td>
                    <td id='td_FechaCreacion'>{departamento.created_at}</td>
                    <td id='td_FechaModificacion'>{departamento.updated_at}</td>
                    


                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditDepartamento(departamento)}> <MdEdit/></button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteDepartamento(departamento)}><MdDeleteForever/></button>
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

      {isModalAddDepartamentoOpen && (
        <AddDepartamentoControl isOpen={isModalAddDepartamentoOpen} onClose={closeModalAddDepartamento} />
      )}

      {isModalEditDepartamentoOpen && departamentoToEdit_Delete && (
        <EditDepartamento isOpen={isModalEditDepartamentoOpen} onClose={closeModalEditDepartamento} departamentoToEdit={departamentoToEdit_Delete}/>
      )}

      {isModalDeleteDepartamentoOpen && departamentoToEdit_Delete && (
        <DeleteDepartamentos isOpen={isModalDeleteDepartamentoOpen} onClose={closeAlertDeleteDepartamento} departamentoToDelete={departamentoToEdit_Delete}/>
      )}




    </div>
  )
};

export default Main_DepartamentosControl;
