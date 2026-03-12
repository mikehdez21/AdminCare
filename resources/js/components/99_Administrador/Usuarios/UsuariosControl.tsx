// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Usuarios
import { User } from '@/@types/mainTypes';
import { getUsers } from '@/store/administrador/Users/usersActions';
import { setListUsuarios } from '@/store/administrador/Users/usersReducer';

// Departamentos
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';

// Empleados
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';

// Componentes
import AddUser from './AddUser';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';

import ShowUserRoles from '@/components/99_Administrador/Usuarios/ShowUserRoles'
import Paginacion from '@/components/00_Utils/Paginacion';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { PiUserList } from 'react-icons/pi';
import { FiAlertTriangle } from 'react-icons/fi';


import { formatDateHorasToFrontend } from '@/utils/dateFormat';

// Styles
import '@styles/99_Administrador/Usuarios/usuariosControl.css';

const Main_UsuariosControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí

  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);
  const empleados = useSelector((state: RootState) => state.empleados.empleados);
  const usuarios = useSelector((state: RootState) => state.users.users || []);
  const totalUsuarios = usuarios.length;

  const [usuarioToEdit_Delete, setUsuarioToEdit_Delete] = useState<User | null>(null); // Usuario seleccionado para editar_eliminar
  const [usuarioToShow, setUsuarioToShow] = useState<User | null>(null); // Usuario seleccionado para editar_eliminar

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [usuariosPorPagina, setUsuariosPorPagina] = useState<number>(5);


  const [isModalAddUsuarioOpen, setModalAddUsuarioOpen] = useState(false);
  const [isModalEditUsuarioOpen, setModalEditUsuarioOpen] = useState(false);
  const [isModalDeleteUsuarioOpen, setModalDeleteUsuarioOpen] = useState(false);
  const [isModalShowUserRoles, setModalShowUserRolesOpen] = useState(false);

  const [isModalFotoOpen, setModalFotoOpen] = useState(false);
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);


  // Añadir Usuario
  const openModalAddUsuario = () => {
    setModalAddUsuarioOpen(true);
  };
  const closeModalAddUsuario = () => {
    setModalAddUsuarioOpen(false);
  };

  // Editar Usuario
  const openModalEditUsuario = (usuario: User) => {
    setUsuarioToEdit_Delete(usuario)
    setModalEditUsuarioOpen(true);
  };
  const closeModalEditUsuario = () => {
    setModalEditUsuarioOpen(false);
    setUsuarioToEdit_Delete(null)
  };

  // Eliminar Usuario
  const openAlertDeleteUsuario = (usuario: User) => {
    setUsuarioToEdit_Delete(usuario)
    setModalDeleteUsuarioOpen(true);

  };
  const closeAlertDeleteUsuario = () => {
    setModalDeleteUsuarioOpen(false);
    setUsuarioToEdit_Delete(null)

  };

  // Mostrar Roles del Usuario
  const openModalShowUserRoles = (usuario: User) => {
    setUsuarioToShow(usuario)
    setModalShowUserRolesOpen(true);
  };
  const closeModalShowUserRoles = () => {
    setUsuarioToShow(null)
    setModalShowUserRolesOpen(false);
  };



  const closeModalFoto = () => {
    setModalFotoOpen(false);
    setFotoUsuario(null);
  };



  // Cargar los usuarios desde la API solo si no están cargados en el store
  useEffect(() => {
    if (usuarios.length === 0) { // Si no hay usuarios en el store
      const cargarUsuarios = async () => {
        try {
          const resultAction = await dispatch(getUsers()).unwrap();
          if (resultAction.success) {
            dispatch(setListUsuarios(resultAction.users!)); // Guarda los usuarios en el store
          } else {
            console.log('Error', resultAction.message);
          }
        } catch (error) {
          console.error('Error al cargar usuarios:', error);
        }
      };
      cargarUsuarios();
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

    if (empleados.length === 0) { // Si no hay empleados en el store
      const cargarEmpleados = async () => {
        try {
          const resultAction = await dispatch(getEmpleados()).unwrap();
          if (resultAction.success) {
            dispatch(setListEmpleados(resultAction.empleados!)); // Guarda los empleados en el store
          } else {
            console.log('Error', resultAction.message);
          }
        } catch (error) {
          console.error('Error al cargar empleados:', error);
        }
      }
      cargarEmpleados();
    }

  }, [dispatch, usuarios.length, departamentos.length, empleados.length]); // Solo ejecuta el effect si los usuarios no están en el store


  // Filtrar y ordenar usuarios basados en la búsqueda
  const usuariosFiltrados = usuarios
    .filter(usuario =>
      usuario.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.id_usuario?.toString().includes(busqueda)
    )
    .sort((a, b) => a.id_usuario! - b.id_usuario!);

  // Obtener los usuarios para la página actual
  const indexUltimoUsuario = paginaActual * usuariosPorPagina;
  const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosPaginaActual = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);


  // Crear nuevos usuarios
  const handleNuevoUsuario = () => {
    openModalAddUsuario();
  };

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de usuarios por página
  const handleChangeUsuariosPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUsuariosPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de proveedores por página
  };


  return (
    <div className='mainDiv_UserControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Usuarios</h1>
          <p>Mostrando {usuariosPaginaActual.length} de {totalUsuarios} usuarios</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={usuariosPorPagina} id='selectList' name='selectList' onChange={handleChangeUsuariosPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoUsuario}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Usuario
          </button>
        </div>

      </div>

      <hr />

      {usuariosFiltrados && usuariosFiltrados.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay usuarios registrados </p> <FiAlertTriangle />
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
                  <th id='th_UserID'>ID</th>
                  <th id='th_NombreUsuario'>Usuario</th>
                  <th id='th_EmailUsuario'>Email</th>
                  <th id='th_EstatusActivo'>Estatus</th>
                  <th id='th_UserRol'>Roles</th>
                  <th id='th_Departamento'>Departamento</th>
                  <th id='th_FechaBaja'>Fecha Baja</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>


              <tbody>
                {usuariosPaginaActual.map(usuarios => (
                  <tr key={usuarios.id_usuario}>
                    <td id='td_UserID'>{usuarios.id_usuario}</td>
                    <td id='td_NombreUsuario'>{usuarios.nombre_usuario}</td>
                    <td id='td_EmailUsuario'>{usuarios.email_usuario}</td>
                    <td id='td_EstatusActivo' className={usuarios.estatus_activo ? 'status-activo' : 'status-inactivo'}> {usuarios.estatus_activo ? 'Activo' : 'Inactivo'}</td>


                    <td id='td_UserRol' >
                      <PiUserList id='rolesIcon' onClick={() => openModalShowUserRoles(usuarios)} />
                    </td>

                    <td id='td_Departamento'>{departamentos.map((departamento) => (
                      <div key={departamento.id_departamento} className='divDepartamento'>
                        {usuarios.id_departamento === departamento.id_departamento ? departamento.nombre_departamento : ''}
                      </div>
                    ))}</td>

                    <td id='td_FechaBaja' className={usuarios.estatus_activo ? '' : 'status-inactivo'}>
                      {formatDateHorasToFrontend(usuarios.fecha_baja) || 'Sin Registro'}
                    </td>


                    <td id='td_FechaCreacion'>{usuarios.created_at}</td>
                    <td id='td_FechaModificacion'>{usuarios.updated_at}</td>

                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditUsuario(usuarios)}> <MdEdit /></button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteUsuario(usuarios)}><MdDeleteForever /></button>
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

      {isModalAddUsuarioOpen && (
        <AddUser key={usuarioToEdit_Delete?.id_usuario} isOpen={isModalAddUsuarioOpen} onClose={closeModalAddUsuario} />
      )}

      {isModalEditUsuarioOpen && usuarioToEdit_Delete && (
        <EditUser isOpen={isModalEditUsuarioOpen} onClose={closeModalEditUsuario} usuarioToEdit={usuarioToEdit_Delete} />
      )}

      {isModalDeleteUsuarioOpen && usuarioToEdit_Delete && (
        <DeleteUser isOpen={isModalDeleteUsuarioOpen} onClose={closeAlertDeleteUsuario} usuarioToDelete={usuarioToEdit_Delete} />
      )}

      {isModalShowUserRoles && usuarioToShow && (
        <ShowUserRoles isOpen={isModalShowUserRoles} onClose={closeModalShowUserRoles} usuarioToShow={usuarioToShow} />
      )}

      {isModalFotoOpen && fotoUsuario && (
        <div className="modalFoto">
          <div className="modalContent">
            <span className="closeButton" onClick={closeModalFoto}>
              &times;
            </span>
            <img src={fotoUsuario} alt="Foto del usuario" className="fotoUsuario" />
          </div>
        </div>
      )}



    </div>
  )
};

export default Main_UsuariosControl;
