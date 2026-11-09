// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Ubicaciones
import { Ubicaciones } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
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


  const [isModalAddUbicacionOpen, setModalAddUbicacionOpen] = useState(false);
  const [isModalEditUbicacionOpen, setModalEditUbicacionOpen] = useState(false);
  const [isModalDeleteUbicacionOpen, setModalDeleteUbicacionOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Paginacion servidor: fetcher que llama al thunk de ubicaciones con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren.
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: Ubicaciones[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getUbicaciones(params)).unwrap();
      if (resultAction.success && resultAction.ubicaciones) {
        return { data: resultAction.ubicaciones, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener las ubicaciones');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: ubicacionesPorPagina,
    items: ubicacionesPaginaActual,
    totalItems: totalUbicaciones,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeUbicacionesPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<Ubicaciones>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<Ubicaciones>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'ubicaciones_th_UbicacionID',
      tdId: 'ubicaciones_td_UbicacionID',
      fija: 'izquierda',
      render: (ubicacion) => ubicacion.id_ubicacion,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'nombre',
      encabezado: 'Ubicación',
      thId: 'ubicaciones_th_NombreUbicacion',
      tdId: 'ubicaciones_td_NombreUbicacion',
      fija: 'izquierda',
      render: (ubicacion) => ubicacion.nombre_ubicacion,
      filtro: { tipo: 'texto', placeholder: 'Ubicación' },
    },
    {
      clave: 'descripcion',
      encabezado: 'Descripción',
      thId: 'ubicaciones_th_DescripcionUbicacion',
      tdId: 'ubicaciones_td_DescripcionUbicacion',
      render: (ubicacion) => ubicacion.descripcion_ubicacion,
      filtro: { tipo: 'texto', placeholder: 'Descripción' },
    },
    {
      clave: 'estatus',
      encabezado: 'Estatus',
      thId: 'ubicaciones_th_EstatusActivo',
      tdId: 'ubicaciones_td_EstatusActivo',
      render: (ubicacion) => (
        <span className={ubicacion.estatus_activo ? 'status-activo' : 'status-inactivo'}>
          {ubicacion.estatus_activo ? 'Activo' : 'Inactivo'}
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
      thId: 'ubicaciones_th_FechaCreacion',
      tdId: 'ubicaciones_td_FechaCreacion',
      render: (ubicacion) => ubicacion.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'ubicaciones_th_FechaModificacion',
      tdId: 'ubicaciones_td_FechaModificacion',
      render: (ubicacion) => ubicacion.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'ubicaciones_th_Acciones',
      tdId: 'ubicaciones_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (ubicacion) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => openModalEditUbicacion(ubicacion)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => openAlertDeleteUbicacion(ubicacion)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  // Anadir Ubicacion
  const openModalAddUbicacion = () => {
    setModalAddUbicacionOpen(true);
  };
  const closeModalAddUbicacion = () => {
    setModalAddUbicacionOpen(false);
    // Recargar la tabla paginada tras crear una ubicacion.
    refetch();
  };

  // Editar Ubicacion
  const openModalEditUbicacion = (ubicacion: Ubicaciones) => {
    setUbicacionToEdit_Delete(ubicacion)
    setModalEditUbicacionOpen(true);
  };
  const closeModalEditUbicacion = () => {
    setModalEditUbicacionOpen(false);
    setUbicacionToEdit_Delete(null)
    // Recargar la tabla paginada tras editar una ubicacion.
    refetch();
  };

  // Eliminar Ubicacion
  const openAlertDeleteUbicacion = (ubicacion: Ubicaciones) => {
    setUbicacionToEdit_Delete(ubicacion)
    setModalDeleteUbicacionOpen(true);

  };
  const closeAlertDeleteUbicacion = () => {
    setModalDeleteUbicacionOpen(false);
    setUbicacionToEdit_Delete(null)
    // Recargar la tabla paginada tras eliminar una ubicacion.
    refetch();
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

  // Crear nuevas ubicaciones
  const handleNuevoUbicacion = () => {
    openModalAddUbicacion();
  };

  return (
    <div className='mainDiv_UbicacionControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Ubicaciones</h1>
          <p>Mostrando {ubicacionesPaginaActual.length} de {totalUbicaciones} ubicaciones</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={ubicacionesPorPagina} name='selectList' onChange={handleChangeUbicacionesPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoUbicacion}>
            <IoAddCircleOutline className='iconAdd' /> Nueva Ubicación
          </button>
        </div>

      </div>

      <hr />

      {!loading && ubicacionesPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
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

          <TablaEntidades
            className='list_entitiesDiv_ubicaciones'
            filas={ubicacionesPaginaActual}
            columnas={columnas}
            clave={(ubicacion) => ubicacion.id_ubicacion ?? ''}
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
