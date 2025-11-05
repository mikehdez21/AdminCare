// Bibliotecas
import React, {useState, useEffect} from 'react';
import { AppDispatch, RootState } from '@/store/store';
import {useSelector, useDispatch} from 'react-redux';

// Empleados
import { Empleados } from '@/@types/mainTypes';
import { getEmpleados } from '@/store/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/Empleados/empleadosReducer';

// Departamentos
import { getDepartamentos } from '@/store/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/Departamentos/departamentosReducer';


// Componentes
import AddEmpleado from './AddEmpleado';
import EditEmpleado from './EditEmpleado';
import DeleteEmpleado from './DeleteEmpleado';
import Paginacion from '@/components/00_Utils/Paginacion';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaImagePortrait } from 'react-icons/fa6';


// Styles
import '@styles/99_Administrador/empleadosControl.css';
import ShowPhotoEmpleado from './ShowPhotoEmpleado';
import { formatDateHorasToFrontend, formatDateNacimientoToFrontend } from '@/utils/dateFormat';

const Main_EmpleadosControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [empleadosPorPagina, setEmpleadosPorPagina] = useState<number>(5);

  const [isModalFotoEmpleadoOpen, setIsFotoEmpleadoOpen] = useState(false);
  const [empleadoToShow, setEmpleadoToShow] = useState<Empleados | null>(null);
  const [empleadoToEdit_Delete, setEmpleadoToEdit_Delete] = useState<Empleados | null>(null);

  const [isModalAddEmpleadoOpen, setModalAddEmpleadoOpen] = useState(false);
  const [isModalEditEmpleadoOpen, setModalEditEmpleadoOpen] = useState(false);
  const [isModalDeleteEmpeladoOpen, setModalDeleteEmpleadoOpen] = useState(false);
  
  // Abrir y cerrar modal de foto de empleado
  const openModalFotoEmpleado = (empleado: Empleados) => {
    setEmpleadoToShow(empleado);
    setIsFotoEmpleadoOpen(true);
  }

  const cerrarModalFotoEmpleado = () => {
    setIsFotoEmpleadoOpen(false);
  }

  // Añadir Empleado
  const openModalAddEmpleado = () => {
    setModalAddEmpleadoOpen(true);
  }
  const closeModalAddEmpleado = () => {
    setModalAddEmpleadoOpen(false);
  }

  // Editar Empleado
  const openModalEditEmpleado = (empleado: Empleados) => {
    setModalEditEmpleadoOpen(true);
    setEmpleadoToEdit_Delete(empleado);
  }
  const closeModalEditEmpleado = () => {
    setModalEditEmpleadoOpen(false);
    setEmpleadoToEdit_Delete(null); 
  } 

  // Eliminar Empleado
  const openModalDeleteEmpleado = (empleado: Empleados) => {
    setModalDeleteEmpleadoOpen(true);
    setEmpleadoToEdit_Delete(empleado);
  }
  const closeAlertDeleteEmpleado = () => {
    setModalDeleteEmpleadoOpen(false);
    setEmpleadoToEdit_Delete(null); // Limpiar el empleado seleccionado
  }


  const empleados = useSelector((state: RootState) => state.empleados.empleados || []);
  const totalEmpleados = empleados.length;

  // Cargar los empleados desde la API solo si no están cargados en el store
  useEffect(() => {
    if (empleados.length === 0) {
      const cargarEmpleados = async () => {
        try{
          const resultAction = await dispatch(getEmpleados()).unwrap();
          console.log('Empleados cargados:', resultAction);
          if (resultAction.success) {
            dispatch(setListEmpleados(resultAction.empleados!));
          } else {
            console.log('Error al cargar empleados:', resultAction.message);
          }
        } catch (error) {
          console.log('Error inesperado:', error);
        }
      };
      cargarEmpleados();
    }

    if (departamentos.length === 0) { // Si no hay departamentos en el store
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
    }
  }, [dispatch, empleados.length]);

  // Filtrar y ordenar empleados basados en la busqueda
  const empleadosFiltrados = empleados
    .filter((empleado): empleado is Empleados => {
    // Filtramos solo empleados válidos
      return !!empleado && typeof empleado.nombre_empleado === 'string';
    })
    .filter((empleado) => {
      const nombre = empleado.nombre_empleado.toLowerCase();
      const idStr = String(empleado.id_empleado ?? '');
      return nombre.includes(busqueda.toLowerCase()) || idStr.includes(busqueda);
    })
    .sort((a, b) => {
      const idA = a.id_empleado ?? 0;
      const idB = b.id_empleado ?? 0;
      return idA - idB;
    });

  // Obtener los empleados para la pagina actual
  const indexUltimoEmpleado = paginaActual * empleadosPorPagina;
  const indexPrimerEmpleado = indexUltimoEmpleado - empleadosPorPagina;
  const empleadosPaginaActual = empleadosFiltrados.slice(indexPrimerEmpleado, indexUltimoEmpleado);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);

  const handleNuevoEmpleado = () => {
    openModalAddEmpleado();
  }

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de usuarios por página
  const handleChangeEmpleadosPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmpleadosPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de proveedores por página
  };

  return(
    <div className='mainDiv_EmpleadosControl'>
      <div className='searchAdd_ButtonDiv'>
 
        <div className='text_Div'>
          <h1>Empleados</h1>
          <p>Mostrando {empleadosPaginaActual.length} de {totalEmpleados} empleados</p>
        </div>
        
        <div className='buttons_Div'>
          <select className='selectList' value={empleadosPorPagina} id='selectList' name='selectList' onChange={handleChangeEmpleadosPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoEmpleado}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Empleado
          </button>
        </div>

      </div>

      <hr />

      {empleadosFiltrados && empleadosFiltrados.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay empleados registrados </p> <FiAlertTriangle />
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
          <div className='list_entitiesDiv' >
            <table>
              
              <thead>
                <tr>
                  <th id='th_EmpleadoID'>ID</th>
                  <th id='th_NombreEmpleado'>Nombre</th>

                  <th id='th_EmailEmpleado'>Email</th>
                  <th id='th_TelefonoEmpleado'>Teléfono</th>
                  <th id='th_Genero'>Género</th>
                  <th id='th_FechaNacimiento'>Fecha Nacimiento</th>
                  <th id='th_EstatusActivo'>Estatus</th>
                  <th id='th_FechaAlta'>Fecha Alta</th>
                  <th id='th_FechaBaja'>Fecha Baja</th>
                  <th id='th_Departamento'>Departamento</th>
                  
                  <th id='th_Foto'>Foto</th>

                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
             
                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>
              
              <tbody>
                {empleadosPaginaActual.map(empleados => (
                  <tr key={empleados.id_empleado}>
                    <td id='td_EmpleadoID'>{empleados.id_empleado}</td>
                    <td id='td_NombreEmpleado'><p>{empleados.nombre_empleado} {empleados.apellido_paterno} {empleados.apellido_materno}</p></td>
                    <td id='td_EmailEmpleado'>{empleados.email_empleado}</td>
                    <td id='td_TelefonoEmpleado'>{empleados.telefono_empleado}</td>
                    <td id='td_Genero'>{empleados.genero}</td>
                    <td id='td_FechaNacimiento'>{formatDateNacimientoToFrontend(empleados.fecha_nacimiento)}</td>
                    <td id='td_EstatusActivo'   className={empleados.estatus_activo ? 'status-activo' : 'status-inactivo'}> {empleados.estatus_activo ? 'Activo' : 'Inactivo'}</td>
                    <td id='td_FechaAlta'>{formatDateHorasToFrontend(empleados.fecha_alta)}</td>

                    <td id='td_FechaBaja' className={empleados.estatus_activo ? '' : 'status-inactivo'}>
                      {empleados.fecha_baja
                        ? formatDateHorasToFrontend(empleados.fecha_baja)
                        : 'Sin Registro'}
                    </td>

                    <td id='td_Departamento'>{departamentos.map((departamento) => (
                      <div key={departamento.id_departamento} className='divDepartamento'>
                        {empleados.id_departamento === departamento.id_departamento ? departamento.nombre_departamento : ''}
                      </div>
                    ))}</td>

                    <td id='td_Foto'>
                      <FaImagePortrait id='imageIcon' onClick={() => openModalFotoEmpleado(empleados)} />
                    </td>

                    <td id='td_FechaCreacion'>{empleados.created_at}</td>
                    <td id='td_FechaModificacion'>{empleados.updated_at}</td>

                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditEmpleado(empleados)}> <MdEdit/></button>
                        <button className='button_deleteEntity' onClick={() => openModalDeleteEmpleado(empleados)}><MdDeleteForever/></button>
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

      {isModalFotoEmpleadoOpen && (
        <ShowPhotoEmpleado isOpen={isModalFotoEmpleadoOpen} onClose={cerrarModalFotoEmpleado} empleadoToShow={empleadoToShow} />
      )}

      {isModalAddEmpleadoOpen && (
        <AddEmpleado isOpen={isModalAddEmpleadoOpen} onClose={closeModalAddEmpleado} />
      )}

      {isModalEditEmpleadoOpen && (
        <EditEmpleado isOpen={isModalEditEmpleadoOpen} onClose={closeModalEditEmpleado} empleadoToEdit={empleadoToEdit_Delete} /> 
      )}

      {isModalDeleteEmpeladoOpen && (
        <DeleteEmpleado isOpen={isModalDeleteEmpeladoOpen} onClose={closeAlertDeleteEmpleado} empleadoToDelete={empleadoToEdit_Delete} />
      )}

    </div>  


  )


};

export default Main_EmpleadosControl;
