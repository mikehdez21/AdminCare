// Bibliotecas
import React, { useState, useCallback } from 'react';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';

// Departamentos
import { Departamentos } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import AddDepartamento from './AddDepartamento';
import EditDepartamento from './EditDepartamento';
import DeleteDepartamentos from './DeleteDepartamento';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/99_Administrador/Departamentos/departamentosControl.css';

const Main_DepartamentosControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [departamentoToEdit_Delete, setDepartamentoToEdit_Delete] = useState<Departamentos | null>(null); // Usuario seleccionado para editar_eliminar

  const [isModalAddDepartamentoOpen, setModalAddDepartamentoOpen] = useState(false);
  const [isModalEditDepartamentoOpen, setModalEditDepartamentoOpen] = useState(false);
  const [isModalDeleteDepartamentoOpen, setModalDeleteDepartamentoOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de departamentos con
  // { page, per_page, search, sort, direction, filtros }. La tabla usa el estado
  // local del hook; no carga la lista completa en el store para no contaminar
  // los selects.
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: Departamentos[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getDepartamentos(params)).unwrap();
      if (resultAction.success && resultAction.departamentos) {
        return { data: resultAction.departamentos, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los departamentos');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: departamentosPorPagina,
    items: departamentosPaginaActual,
    totalItems: totalDepartamentos,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeDepartamentosPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<Departamentos>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<Departamentos>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'departamentos_th_DepartamentoID',
      tdId: 'departamentos_td_DepartamentoID',
      fija: 'izquierda',
      render: (departamento) => departamento.id_departamento,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'nombre',
      encabezado: 'Departamento',
      thId: 'departamentos_th_NombreDepartamento',
      tdId: 'departamentos_td_NombreDepartamento',
      fija: 'izquierda',
      render: (departamento) => departamento.nombre_departamento,
      filtro: { tipo: 'texto', placeholder: 'Departamento' },
    },
    {
      clave: 'descripcion',
      encabezado: 'Descripción',
      thId: 'departamentos_th_DescripcionDepartamento',
      tdId: 'departamentos_td_DescripcionDepartamento',
      render: (departamento) => departamento.descripcion,
      filtro: { tipo: 'texto', placeholder: 'Descripción' },
    },
    {
      clave: 'atiende_px',
      encabezado: 'AtiendePx',
      thId: 'departamentos_th_Atiende',
      tdId: 'departamentos_td_Atiende',
      render: (departamento) => (departamento.atiende_pacientes ? 'Atiende Px' : 'No Atiende Px'),
      filtro: {
        tipo: 'booleano',
        opciones: [
          { valor: '1', etiqueta: 'Atiende Px' },
          { valor: '0', etiqueta: 'No Atiende Px' },
        ],
      },
    },
    {
      clave: 'estatus',
      encabezado: 'Estatus',
      thId: 'departamentos_th_EstatusActivo',
      tdId: 'departamentos_td_EstatusActivo',
      render: (departamento) => (
        <span className={departamento.estatus_activo ? 'status-activo' : 'status-inactivo'}>
          {departamento.estatus_activo ? 'Activo' : 'Inactivo'}
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
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'departamentos_th_FechaCreacion',
      tdId: 'departamentos_td_FechaCreacion',
      render: (departamento) => departamento.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'departamentos_th_FechaModificacion',
      tdId: 'departamentos_td_FechaModificacion',
      render: (departamento) => departamento.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'departamentos_th_Acciones',
      tdId: 'departamentos_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (departamento) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => openModalEditDepartamento(departamento)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => openAlertDeleteDepartamento(departamento)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  // Añadir Departamento
  const openModalAddDepartamento = () => {
    setModalAddDepartamentoOpen(true);
  };
  const closeModalAddDepartamento = () => {
    setModalAddDepartamentoOpen(false);
    // Recargar la tabla paginada tras crear un departamento.
    refetch();
  };

  // Editar Departamento
  const openModalEditDepartamento = (departamento: Departamentos) => {
    setDepartamentoToEdit_Delete(departamento)
    setModalEditDepartamentoOpen(true);
  };
  const closeModalEditDepartamento = () => {
    setModalEditDepartamentoOpen(false);
    setDepartamentoToEdit_Delete(null)
    // Recargar la tabla paginada tras editar un departamento.
    refetch();
  };

  // Eliminar Departamento
  const openAlertDeleteDepartamento = (departamento: Departamentos) => {
    setDepartamentoToEdit_Delete(departamento)
    setModalDeleteDepartamentoOpen(true);

  };
  const closeAlertDeleteDepartamento = () => {
    setModalDeleteDepartamentoOpen(false);
    setDepartamentoToEdit_Delete(null)
    // Recargar la tabla paginada tras eliminar un departamento.
    refetch();
  };

  // Crear nuevos departamentos
  const handleNuevoDepartamento = () => {
    openModalAddDepartamento();
  };

  return (
    <div className='mainDiv_DepartamentoControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Departamentos</h1>
          <p>Mostrando {departamentosPaginaActual.length} de {totalDepartamentos} departamentos</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={departamentosPorPagina} name='selectList' onChange={handleChangeDepartamentosPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoDepartamento}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Departamento
          </button>
        </div>

      </div>

      <hr />

      {!loading && departamentosPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
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

          <TablaEntidades
            className='list_entitiesDiv_departamentos'
            filas={departamentosPaginaActual}
            columnas={columnas}
            clave={(departamento) => departamento.id_departamento ?? ''}
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

      {isModalAddDepartamentoOpen && (
        <AddDepartamento isOpen={isModalAddDepartamentoOpen} onClose={closeModalAddDepartamento} />
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
