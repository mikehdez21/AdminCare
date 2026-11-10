// Bibliotecas
import React, { useState } from 'react';

// Roles
import { Roles } from '@/@types/mainTypes';
import { useGetAlcancesCatalogoQuery, useGetRolesQuery } from '@/store/api/rolesApi';
import { useGetPermisosQuery } from '@/store/api/permisosApi';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionRtk } from '@/hooks/usePaginacionRtk';
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
  const [rolesToEdit_Delete, setRolesToEdit_Delete] = useState<Roles | null>(null);

  const [isModalAddRolesOpen, setModalAddRolesOpen] = useState(false);
  const [isModalEditRolesOpen, setModalEditRolesOpen] = useState(false);
  const [isModalDeleteRolesOpen, setModalDeleteRolesOpen] = useState(false);

  const [isModalViewPermisosOpen, setModalViewPermisosOpen] = useState(false);

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
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionRtk<Roles>({
    useQuery: useGetRolesQuery,
    perPageDefault: 5,
  });

  const { data: permisosData } = useGetPermisosQuery();
  const permisos = permisosData ?? [];

  const { data: alcancesCatalogo = [] } = useGetAlcancesCatalogoQuery();

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<Roles>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'roles_th_RolID',
      tdId: 'roles_td_RolID',
      fija: 'izquierda',
      render: (rol) => rol.id,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'nombre',
      encabezado: 'Rol',
      thId: 'roles_th_NombreRol',
      tdId: 'roles_td_NombreRol',
      fija: 'izquierda',
      render: (rol) => rol.name,
      filtro: { tipo: 'texto', placeholder: 'Rol' },
    },
    {
      clave: 'permisos',
      encabezado: 'Permisos Asignados',
      thId: 'roles_th_PermisosRol',
      tdId: 'roles_td_PermisosRol',
      ordenable: false,
      render: (rol) => (
        <>
          {rol.permissions?.length || 0} |{' '}
          <button
            type='button'
            className='button_viewPermisos'
            onClick={() => openModalViewPermisos(rol)}
          >
            Ver
          </button>
        </>
      ),
    },
    {
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'roles_th_FechaCreacion',
      tdId: 'roles_td_FechaCreacion',
      render: (rol) => rol.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'roles_th_FechaModificacion',
      tdId: 'roles_td_FechaModificacion',
      render: (rol) => rol.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'roles_th_Acciones',
      tdId: 'roles_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (rol) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => openModalEditRoles(rol)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => openAlertDeleteRoles(rol)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

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
    setRolesToEdit_Delete(rol);
    setModalEditRolesOpen(true);
  };
  const closeModalEditRoles = () => {
    setModalEditRolesOpen(false);
    setRolesToEdit_Delete(null);
    // Recargar la tabla paginada tras editar un rol.
    refetch();
  };

  // Eliminar Roles
  const openAlertDeleteRoles = (rol: Roles) => {
    setRolesToEdit_Delete(rol);
    setModalDeleteRolesOpen(true);
  };
  const closeAlertDeleteRoles = () => {
    setModalDeleteRolesOpen(false);
    setRolesToEdit_Delete(null);
    // Recargar la tabla paginada tras eliminar un rol.
    refetch();
  };

  // Vista de Permisos del Rol
  const openModalViewPermisos = (rol: Roles) => {
    setRolesToEdit_Delete(rol);
    setModalViewPermisosOpen(true);
  };
  const closeModalViewPermisos = () => {
    setModalViewPermisosOpen(false);
  };

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
          <select className='selectList' value={rolesPorPagina} name='selectList' onChange={handleChangeRolesPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoRol}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Rol
          </button>
        </div>

      </div>

      <hr />

      {!loading && rolesPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
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

          <TablaEntidades
            className='list_entitiesDiv_roles'
            filas={rolesPaginaActual}
            columnas={columnas}
            clave={(rol) => rol.id ?? ''}
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


      {isModalAddRolesOpen && (
        <AddRolesControl isOpen={isModalAddRolesOpen} onClose={closeModalAddRoles} permisos={permisos} alcancesCatalogo={alcancesCatalogo} />
      )}

      {isModalEditRolesOpen && rolesToEdit_Delete && (
        <EditRol isOpen={isModalEditRolesOpen} onClose={closeModalEditRoles} rolesToEdit={rolesToEdit_Delete} permisos={permisos} alcancesCatalogo={alcancesCatalogo} />
      )}

      {isModalDeleteRolesOpen && rolesToEdit_Delete && (
        <DeleteRoles isOpen={isModalDeleteRolesOpen} onClose={closeAlertDeleteRoles} rolesToDelete={rolesToEdit_Delete} />
      )}

      {isModalViewPermisosOpen && rolesToEdit_Delete && (
        <ShowPermisosRole isOpen={isModalViewPermisosOpen} onClose={closeModalViewPermisos} rolToShow={rolesToEdit_Delete} permisos={permisos} alcancesCatalogo={alcancesCatalogo} />
      )}




    </div>
  );
};

export default Main_RolesControl;
