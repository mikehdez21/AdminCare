// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Usuarios
import { User } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getUsers } from '@/store/administrador/Users/usersActions';
import { setListUsuarios } from '@/store/administrador/Users/usersReducer';

// Departamentos
import { getDepartamentosActivos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';

// Empleados
import { getEmpleadosActivos } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';

// Componentes
import AddUser from './AddUser';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';

import ShowUserRoles from '@/components/99_Administrador/Usuarios/ShowUserRoles'
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import { useGetRolesQuery } from '@/store/api/rolesApi';

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

  // Catálogo de roles para el filtro por columna. RTK Query lo cachea; sin
  // argumentos el endpoint devuelve la lista completa.
  const { data: rolesData } = useGetRolesQuery();
  const roles = rolesData?.items ?? [];

  const [usuarioToEdit_Delete, setUsuarioToEdit_Delete] = useState<User | null>(null); // Usuario seleccionado para editar_eliminar
  const [usuarioToShow, setUsuarioToShow] = useState<User | null>(null); // Usuario seleccionado para editar_eliminar

  const [isModalAddUsuarioOpen, setModalAddUsuarioOpen] = useState(false);
  const [isModalEditUsuarioOpen, setModalEditUsuarioOpen] = useState(false);
  const [isModalDeleteUsuarioOpen, setModalDeleteUsuarioOpen] = useState(false);
  const [isModalShowUserRoles, setModalShowUserRolesOpen] = useState(false);

  const [isModalFotoOpen, setModalFotoOpen] = useState(false);
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de usuarios con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren (selección de empleados, roles, etc.).
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: User[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getUsers(params)).unwrap();
      if (resultAction.success && resultAction.users) {
        return { data: resultAction.users, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los usuarios');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: usuariosPorPagina,
    items: usuariosPaginaActual,
    totalItems: totalUsuarios,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeUsuariosPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<User>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<User>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'usuarios_th_UserID',
      tdId: 'usuarios_td_UserID',
      fija: 'izquierda',
      render: (usuario) => usuario.id_usuario,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'nombre',
      encabezado: 'Usuario',
      thId: 'usuarios_th_NombreUsuario',
      tdId: 'usuarios_td_NombreUsuario',
      fija: 'izquierda',
      render: (usuario) => usuario.nombre_usuario,
      filtro: { tipo: 'texto', placeholder: 'Usuario' },
    },
    {
      clave: 'email',
      encabezado: 'Email',
      thId: 'usuarios_th_EmailUsuario',
      tdId: 'usuarios_td_EmailUsuario',
      render: (usuario) => usuario.email_usuario,
      filtro: { tipo: 'texto', placeholder: 'Email' },
    },
    {
      clave: 'estatus',
      encabezado: 'Estatus',
      thId: 'usuarios_th_EstatusActivo',
      tdId: 'usuarios_td_EstatusActivo',
      render: (usuario) => (
        <span className={usuario.estatus_activo ? 'status-activo' : 'status-inactivo'}>
          {usuario.estatus_activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
      filtro: {
        tipo: 'booleano',
        opciones: [
          { valor: '1', etiqueta: 'Activo' },
          { valor: '0', etiqueta: 'Inactivo' },
        ],
      },
    },
    {
      clave: 'roles',
      encabezado: 'Roles',
      thId: 'usuarios_th_UserRol',
      tdId: 'usuarios_td_UserRol',
      ordenable: false,
      render: (usuario) => (
        <PiUserList
          id='usuarios_rolesIcon'
          onClick={() => openModalShowUserRoles(usuario)}
        />
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: roles
          .filter((rol) => typeof rol.id === 'number')
          .map((rol) => ({ valor: String(rol.id), etiqueta: rol.name })),
      },
    },
    {
      clave: 'departamento',
      encabezado: 'Departamento',
      thId: 'usuarios_th_Departamento',
      tdId: 'usuarios_td_Departamento',
      render: (usuario) =>
        departamentos.find(
          (departamento) => departamento.id_departamento === usuario.id_departamento,
        )?.nombre_departamento ?? '',
      filtro: {
        tipo: 'seleccion',
        opciones: departamentos
          .filter((departamento) => typeof departamento.id_departamento === 'number')
          .map((departamento) => ({
            valor: String(departamento.id_departamento),
            etiqueta: departamento.nombre_departamento,
          })),
      },
    },
    {
      clave: 'fecha_baja',
      encabezado: 'Fecha Baja',
      thId: 'usuarios_th_FechaBaja',
      tdId: 'usuarios_td_FechaBaja',
      render: (usuario) => (
        <span className={usuario.estatus_activo ? '' : 'status-inactivo'}>
          {formatDateHorasToFrontend(usuario.fecha_baja) || 'Sin Registro'}
        </span>
      ),
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'usuarios_th_FechaCreacion',
      tdId: 'usuarios_td_FechaCreacion',
      render: (usuario) => usuario.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'usuarios_th_FechaModificacion',
      tdId: 'usuarios_td_FechaModificacion',
      render: (usuario) => usuario.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'usuarios_th_Acciones',
      tdId: 'usuarios_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (usuario) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => openModalEditUsuario(usuario)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => openAlertDeleteUsuario(usuario)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  // Añadir Usuario
  const openModalAddUsuario = () => {
    setModalAddUsuarioOpen(true);
  };
  const closeModalAddUsuario = () => {
    setModalAddUsuarioOpen(false);
    // Recargar la tabla paginada tras crear un usuario.
    refetch();
  };

  // Editar Usuario
  const openModalEditUsuario = (usuario: User) => {
    setUsuarioToEdit_Delete(usuario)
    setModalEditUsuarioOpen(true);
  };
  const closeModalEditUsuario = () => {
    setModalEditUsuarioOpen(false);
    setUsuarioToEdit_Delete(null)
    // Recargar la tabla paginada tras editar un usuario.
    refetch();
  };

  // Eliminar Usuario
  const openAlertDeleteUsuario = (usuario: User) => {
    setUsuarioToEdit_Delete(usuario)
    setModalDeleteUsuarioOpen(true);

  };
  const closeAlertDeleteUsuario = () => {
    setModalDeleteUsuarioOpen(false);
    setUsuarioToEdit_Delete(null)
    // Recargar la tabla paginada tras eliminar un usuario.
    refetch();
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
          const resultAction = await dispatch(getDepartamentosActivos()).unwrap();
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
          const resultAction = await dispatch(getEmpleadosActivos()).unwrap();
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


  // Crear nuevos usuarios
  const handleNuevoUsuario = () => {
    openModalAddUsuario();
  };

  return (
    <div className='mainDiv_UserControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Usuarios</h1>
          <p>Mostrando {usuariosPaginaActual.length} de {totalUsuarios} usuarios</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={usuariosPorPagina} name='selectList' onChange={handleChangeUsuariosPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={busqueda}

            name='busqueda'
            onChange={handleSearch}
          />
          <button className='buttonAdd' onClick={handleNuevoUsuario}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Usuario
          </button>
        </div>

      </div>

      <hr />

      {!loading && usuariosPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
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

          <TablaEntidades
            className='list_entitiesDiv_usuarios'
            filas={usuariosPaginaActual}
            columnas={columnas}
            clave={(usuario) => usuario.id_usuario ?? ''}
            orden={orden}
            onOrden={alternarOrden}
            filtros={filtros}
            onFiltro={cambiarFiltro}
            mensajeVacio={<p>No hay coincidencias con los filtros seleccionados.</p>}
          />

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
