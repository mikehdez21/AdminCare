// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';


// Roles
import { Roles } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';
import { getPermisos } from '@/store/administrador/Permisos/permisosActions';
import { setListPermisos } from '@/store/administrador/Permisos/permisosReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import AddRolesControl from './AddRol';
import DeleteRoles from './DeleteRol';
import EditRol from './EditRol';
import ShowPermisosRole from './ShowPermisosRole';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/99_Administrador/Roles/rolesControl.css';

const Main_RolesControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [rolesToEdit_Delete, setRolesToEdit_Delete] = useState<Roles | null>(null); // Usuario seleccionado para editar_eliminar


  const [isModalAddRolesOpen, setModalAddRolesOpen] = useState(false);
  const [isModalEditRolesOpen, setModalEditRolesOpen] = useState(false);
  const [isModalDeleteRolesOpen, setModalDeleteRolesOpen] = useState(false);

  const [isModalViewPermisosOpen, setModalViewPermisosOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de roles con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren.
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: Roles[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getRoles(params)).unwrap();
      if (resultAction.success && resultAction.roles) {
        return { data: resultAction.roles, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los roles');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: rolesPorPagina,
    items: rolesPaginaActual,
    totalItems: totalRoles,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeRolesPorPagina,
  } = usePaginacionServidor<Roles>({
    fetcher,
    perPageDefault: 5,
  });

  // Añadir Roles
  const openModalAddRoles = () => {
    setModalAddRolesOpen(true);
  };
  const closeModalAddRoles = () => {
    setModalAddRolesOpen(false);
    // Recargar la tabla paginada tras crear un rol.
    refetch();
  };

  // Editar Roles
  const openModalEditRoles = (rol: Roles) => {
    setRolesToEdit_Delete(rol)
    setModalEditRolesOpen(true);
  };
  const closeModalEditRoles = () => {
    setModalEditRolesOpen(false);
    setRolesToEdit_Delete(null)
    // Recargar la tabla paginada tras editar un rol.
    refetch();
  };

  // Eliminar Roles
  const openAlertDeleteRoles = (rol: Roles) => {
    setRolesToEdit_Delete(rol)
    setModalDeleteRolesOpen(true);

  };
  const closeAlertDeleteRoles = () => {
    setModalDeleteRolesOpen(false);
    setRolesToEdit_Delete(null)
    // Recargar la tabla paginada tras eliminar un rol.
    refetch();
  };

  // Vista de Permisos del Rol
  const openModalViewPermisos = (rol: Roles) => {
    setRolesToEdit_Delete(rol);
    setModalViewPermisosOpen(true);
  }
  const closeModalViewPermisos = () => {
    setModalViewPermisosOpen(false);
  }

  // Cargar los roles desde la API solo si no están cargados en el store
  useEffect(() => {
    const cargarRolesYPermisos = async () => {
      try {
        const resultAction = await dispatch(getRoles()).unwrap();
        if (resultAction.success) {
          dispatch(setListRoles(resultAction.roles!)); // Guarda los roles en el store
        } else {
          console.log('Error', resultAction.message);
        }

        const permisosAction = await dispatch(getPermisos()).unwrap();
        if (permisosAction.success) {
          dispatch(setListPermisos(permisosAction.permisos!));
        } else {
          console.log('Error', permisosAction.message);
        }
      } catch (error) {
        console.error('Error al cargar roles y permisos:', error);
      }
    };
    cargarRolesYPermisos();
  }, [dispatch]); // Solo ejecuta el effect si los roles no están en el store

  const permisos = useSelector((state: RootState) => state.permisos?.permisos || []);

  // Crear nuevos roles
  const handleNuevoRol = () => {
    openModalAddRoles();
  };

  return (
    <div className='mainDiv_RolControl'>

      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Roles de Usuario</h1>
          <p>Mostrando {rolesPaginaActual.length} de {totalRoles} roles</p>
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

      {!loading && rolesPaginaActual.length === 0 ? (
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
                  <th id='th_PermisosRol'>Permisos Asignados</th>
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
                    <td id='td_PermisosRol' onClick={() => openModalViewPermisos(rol)}>
                      {rol.permissions?.length || 0} | Ver
                    </td>
                    <td id='td_FechaCreacion'>{rol.created_at}</td>
                    <td id='td_FechaModificacion'>{rol.updated_at}</td>


                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditRoles(rol)}> <MdEdit /></button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteRoles(rol)}><MdDeleteForever /></button>
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
        <AddRolesControl isOpen={isModalAddRolesOpen} onClose={closeModalAddRoles} permisos={permisos} />
      )}

      {isModalEditRolesOpen && rolesToEdit_Delete && (
        <EditRol isOpen={isModalEditRolesOpen} onClose={closeModalEditRoles} rolesToEdit={rolesToEdit_Delete} permisos={permisos} />
      )}

      {isModalDeleteRolesOpen && rolesToEdit_Delete && (
        <DeleteRoles isOpen={isModalDeleteRolesOpen} onClose={closeAlertDeleteRoles} rolesToDelete={rolesToEdit_Delete} />
      )}

      {isModalViewPermisosOpen && rolesToEdit_Delete && (
        <ShowPermisosRole isOpen={isModalViewPermisosOpen} onClose={closeModalViewPermisos} rolToShow={rolesToEdit_Delete} />
      )}




    </div>
  )
};

export default Main_RolesControl;
