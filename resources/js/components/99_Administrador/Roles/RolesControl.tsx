// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';


// Roles
import { Roles } from '@/@types/mainTypes';
import { getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddRolesControl from './AddRol';
import DeleteRoles from './DeleteRol';
import EditRol from './EditRol';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/99_Administrador/Roles/rolesControl.css';

const Main_RolesControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [rolesToEdit_Delete, setRolesToEdit_Delete] = useState<Roles | null>(null); // Usuario seleccionado para editar_eliminar
  
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [rolesPorPagina, setRolesPorPagina] = useState<number>(5);

    
  const [isModalAddRolesOpen, setModalAddRolesOpen] = useState(false);
  const [isModalEditRolesOpen, setModalEditRolesOpen] = useState(false);
  const [isModalDeleteRolesOpen, setModalDeleteRolesOpen] = useState(false);


  
  // Añadir Roles
  const openModalAddRoles = () => {
    setModalAddRolesOpen(true);
  };
  const closeModalAddRoles = () => {
    setModalAddRolesOpen(false);
  };
  
  // Editar Roles
  const openModalEditRoles = (rol: Roles) => {
    setRolesToEdit_Delete(rol)
    setModalEditRolesOpen(true);
  };
  const closeModalEditRoles = () => {
    setModalEditRolesOpen(false);
    setRolesToEdit_Delete(null)
  };
  
  // Eliminar Roles
  const openAlertDeleteRoles = (rol: Roles) => {
    setRolesToEdit_Delete(rol)
    setModalDeleteRolesOpen(true);

  };
  const closeAlertDeleteRoles = () => {
    setModalDeleteRolesOpen(false);
    setRolesToEdit_Delete(null)

  };

  // Cargar los roles desde la API solo si no están cargados en el store
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const resultAction = await dispatch(getRoles()).unwrap();
        if (resultAction.success) {
          dispatch(setListRoles(resultAction.roles!)); // Guarda los roles en el store
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    };
    cargarRoles();
  }, []); // Solo ejecuta el effect si los roles no están en el store
  


  

  const roles = useSelector((state: RootState) => state.roles?.roles || []);
  console.log(roles)



  // Filtrar y ordenar roles basados en la búsqueda
  const rolesFiltrados = roles
    .filter(rol =>
      rol.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      rol.name?.toString().includes(busqueda)
    )
    .sort((a, b) => a.id! - b.id!);

  // Obtener los roles para la página actual
  const indexUltimoRol = paginaActual * rolesPorPagina;
  const indexPrimerRol = indexUltimoRol - rolesPorPagina;
  const rolesPaginaActual = rolesFiltrados.slice(indexPrimerRol, indexUltimoRol);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);


  // Crear nuevos roles
  const handleNuevoRol = () => {
    openModalAddRoles();
  };

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de roles por página
  const handleChangeRolesPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRolesPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de roles por página
  };


  return(
    <div className='mainDiv_RolControl'>
      <div className='searchAdd_ButtonDiv'>
 
        <div className='text_Div'>
          <h1>Roles de Usuario</h1>
          <p>Mostrando {rolesPaginaActual.length} de {roles.length} roles</p>
        </div>
        
        <div className='buttons_Div'>
          <select className='selectList' value={rolesPorPagina} id='selectList' name='selectList' onChange={handleChangeRolesPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoRol}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Rol
          </button>
        </div>

      </div>

      <hr />

      {rolesFiltrados && rolesFiltrados.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay roles registrados </p> <FiAlertTriangle />
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
                  <th id='th_RolID'>ID</th>
                  <th id='th_NombreRol'>Rol</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>

                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>


              <tbody>
                {rolesPaginaActual.map(rol => (
                  <tr key={rol.id}>
                    <td id='td_RolID'>{rol.id}</td>
                    <td id='td_NombreRol'>{rol.name}</td>
                    <td id='td_FechaCreacion'>{rol.created_at}</td>
                    <td id='td_FechaModificacion'>{rol.updated_at}</td>


                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditRoles(rol)}> <MdEdit/></button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteRoles(rol)}><MdDeleteForever/></button>
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

    

          
      {isModalAddRolesOpen && (
        <AddRolesControl isOpen={isModalAddRolesOpen} onClose={closeModalAddRoles} />
      )}

      {isModalEditRolesOpen && rolesToEdit_Delete && (
        <EditRol isOpen={isModalEditRolesOpen} onClose={closeModalEditRoles} rolesToEdit={rolesToEdit_Delete}/>
      )}

      {isModalDeleteRolesOpen && rolesToEdit_Delete && (
        <DeleteRoles isOpen={isModalDeleteRolesOpen} onClose={closeAlertDeleteRoles} rolesToDelete={rolesToEdit_Delete}/>
      )}

    



    </div>
  )
};

export default Main_RolesControl;
