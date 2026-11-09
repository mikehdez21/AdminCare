// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';


// Movimientos Activos Fijos  
import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getVWmovimientosActivosFijos, getTipoMovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListvwMovimientosAF } from '@/store/almacengeneral/Activos/vwMovimientosAFReducer';
import { setListTipoMovimientoAF } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import ModalAFDetails from './DetalleMovimientosAF';
import EditMovimientoAF from './EditMovifimientoAF';

// Icons
import { MdEdit, MdVisibility } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa6';

// PDF
import { PDFViewer } from '@react-pdf/renderer';
import { MyDocument } from '@/reactPDF/pdfMovimientosAF';

import { getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/movIndividual.css'

const getEstatusClass = (descripcion: string): string => {
  const estatus = descripcion.toLowerCase().trim();
  if (estatus === 'activo') return 'estatus-activo';
  if (estatus.includes('mantenimiento') || estatus.includes('revisión')) return 'estatus-mantenimiento-revision';
  if (estatus.includes('baja') || estatus === 'perdido') return 'estatus-baja-perdido';
  if (estatus === 'prestado') return 'estatus-prestado';
  return 'estatus-default';
};

const AlmacenGeneral_MovimientoIndividual: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const estatusActivoFijo = useSelector((state: RootState) => state.estatusAF.estatusAF);


  // Estados para el componente de movimientos
  const [movimientoAFToEditViewDetails, setMovimientoAFToEditViewDetails] = useState<VwMovimientosAF | null>(null);

  const [isModalViewDetailsOpen, setModalViewDetailsOpen] = useState(false);
  const [isModalEditMovimientoOpen, setModalEditMovimientoOpen] = useState(false);

  // PDF
  const [showPDF, setShowPDF] = useState(false);

  console.log(movimientoAFToEditViewDetails)

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de movimientos con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren (TraspasoAF, charts, etc.).
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: VwMovimientosAF[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getVWmovimientosActivosFijos(params)).unwrap();
      if (resultAction.success && resultAction.vwMovimientosAF) {
        return { data: resultAction.vwMovimientosAF, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los movimientos de activos fijos');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: movimientosPorPagina,
    items: movimientosPaginaActual,
    totalItems: totalMovimientos,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeMovimientosPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<VwMovimientosAF>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<VwMovimientosAF>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'movIndividual_th_ID',
      tdId: 'movIndividual_td_ID',
      fija: 'izquierda',
      render: (movimiento) => (
        <div className='divIDAF'>{movimiento.id_activo_fijo}</div>
      ),
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'codigo_unico',
      encabezado: 'Código',
      thId: 'movIndividual_th_CodigoUnico',
      tdId: 'movIndividual_td_CodigoUnico',
      fija: 'izquierda',
      desplazamientoFijo: '80px',
      render: (movimiento) => movimiento.codigo_unico,
      filtro: { tipo: 'texto', placeholder: 'Código' },
    },
    {
      clave: 'nombre',
      encabezado: 'Activo Fijo',
      thId: 'movIndividual_th_NombreAF',
      tdId: 'movIndividual_td_NombreAF',
      render: (movimiento) => (
        <div className='divNombreAF'>{movimiento.nombre_af}</div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Activo' },
    },
    {
      clave: 'fecha_ultimo_movimiento',
      encabezado: 'Fecha Último Movimiento',
      thId: 'movIndividual_th_FechaUltimoMovimiento',
      tdId: 'movIndividual_td_FechaUltimoMovimiento',
      render: (movimiento) =>
        formatDateHorasToFrontend(movimiento.fecha_ultimo_movimiento),
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'estado',
      encabezado: 'Estado Actual',
      thId: 'movIndividual_th_EstadoAF',
      tdId: 'movIndividual_td_EstadoAF',
      render: (movimiento) => {
        if (!movimiento.estado_actual) return null;

        return (
          <div
            className={`estatus-badge ${getEstatusClass(movimiento.estado_actual)}`}
          >
            {movimiento.estado_actual}
          </div>
        );
      },
      filtro: {
        tipo: 'seleccion',
        opciones: estatusActivoFijo
          .filter((estatus) => estatus.descripcion_estatusaf)
          .map((estatus) => ({
            valor: estatus.descripcion_estatusaf,
            etiqueta: estatus.descripcion_estatusaf,
          })),
      },
    },
    {
      clave: 'ubicacion_actual',
      encabezado: 'Ubicación Actual',
      thId: 'movIndividual_th_UbicacionActual',
      tdId: 'movIndividual_td_UbicacionActual',
      render: (movimiento) => movimiento.ubicacion_actual,
      filtro: { tipo: 'texto', placeholder: 'Ubicación' },
    },
    {
      clave: 'responsable_actual',
      encabezado: 'Responsable Actual',
      thId: 'movIndividual_th_ResponsableActual',
      tdId: 'movIndividual_td_ResponsableActual',
      render: (movimiento) => (
        <div className='divResponsableAF'>
          {movimiento.responsable_actual_completo}
        </div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Responsable' },
    },
    {
      clave: 'ubicacion_anterior',
      encabezado: 'Ubicación Anterior',
      thId: 'movIndividual_th_UbicacionAnterior',
      tdId: 'movIndividual_td_UbicacionAnterior',
      render: (movimiento) => movimiento.ubicacion_anterior,
      filtro: { tipo: 'texto', placeholder: 'Ubicación anterior' },
    },
    {
      clave: 'responsable_anterior',
      encabezado: 'Responsable Anterior',
      thId: 'movIndividual_th_ResponsableAnterior',
      tdId: 'movIndividual_td_ResponsableAnterior',
      render: (movimiento) => (
        <div className='divResponsableAnteriorAF'>
          {movimiento.responsable_anterior_completo}
        </div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Responsable anterior' },
    },
    {
      clave: 'tipo_movimiento',
      encabezado: 'Tipo de Movimiento',
      thId: 'movIndividual_th_TipoMovimiento',
      tdId: 'movIndividual_td_TipoMovimiento',
      render: (movimiento) => movimiento.tipo_movimiento,
      filtro: { tipo: 'texto', placeholder: 'Tipo' },
    },
    {
      clave: 'departamento',
      encabezado: 'Departamento Responsable',
      thId: 'movIndividual_th_DepartamentoResponsable',
      tdId: 'movIndividual_td_DepartamentoResponsable',
      render: (movimiento) => movimiento.departamento_actual,
      filtro: { tipo: 'texto', placeholder: 'Departamento' },
    },
    {
      clave: 'motivo',
      encabezado: 'Motivo Último Movimiento',
      thId: 'movIndividual_th_UltimoMotivoMovimiento',
      tdId: 'movIndividual_td_UltimoMotivoMovimiento',
      render: (movimiento) => (
        <div className='divMotivoMovimiento'>
          {movimiento.ultimo_motivo_movimiento}
        </div>
      ),
      filtro: { tipo: 'texto', placeholder: 'Motivo' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'movIndividual_th_Acciones',
      tdId: 'movIndividual_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (movimiento) => (
        <div className='divActions'>
          <button
            type='button'
            className='pdfButton'
            onClick={() => handleOpenPDF(movimiento)}
          >
            <FaFilePdf />
          </button>
          <button
            className='button_viewDetails'
            onClick={() => openModalViewDetails(movimiento)}
          >
            <MdVisibility />
          </button>
          <button
            className='button_editEntity'
            onClick={() => openModalEditMovimiento(movimiento)}
          >
            <MdEdit />
          </button>
        </div>
      ),
    },
  ];

  // Detalles del MovimientoAF
  const openModalViewDetails = (vwMovimiento: VwMovimientosAF) => {
    setMovimientoAFToEditViewDetails(vwMovimiento);
    setModalViewDetailsOpen(true);
  };

  const closeModalViewDetails = () => {
    setMovimientoAFToEditViewDetails(null);
    setModalViewDetailsOpen(false);
  };



  // Editar movimiento
  const openModalEditMovimiento = (editMovimiento: VwMovimientosAF) => {

    setMovimientoAFToEditViewDetails(editMovimiento);
    setModalEditMovimientoOpen(true);
  };

  const closeModalEditMovimiento = () => {
    setMovimientoAFToEditViewDetails(null);
    setModalEditMovimientoOpen(false);
    // Recargar la tabla paginada tras editar/cancelar la edición de un movimiento.
    refetch();
  };



  // Cargar datos
  useEffect(() => {

    const cargarVWMovimientosActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getVWmovimientosActivosFijos()).unwrap();

        if (resultAction.success) {
          dispatch(setListvwMovimientosAF(resultAction.vwMovimientosAF!));
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar movimientos de activos fijos:', error);
      }
    };
    cargarVWMovimientosActivosFijos();

    const cargarTiposMovimientoAF = async () => {
      try {
        const resultAction = await dispatch(getTipoMovimientosActivosFijos()).unwrap();
        if (resultAction.success) {
          dispatch(setListTipoMovimientoAF(resultAction.tipoMovimientoAF!));
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar los tipos de movimiento de activos fijos:', error);
      }
    };
    cargarTiposMovimientoAF();

    const cargarEstatusActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getEstatusAF()).unwrap();

        if (resultAction.success) {
          dispatch(setListEstatusAF(resultAction.estatusAF!)); // Establece el estatus en el estado

        } else {
          console.log('Error', resultAction.message)
        }

      } catch (error) {
        console.error('Error al cargar estatus de activos fijos:', error);
      }
    };
    cargarEstatusActivosFijos();


  }, [dispatch]);

  const handleOpenPDF = (vwMovimiento: VwMovimientosAF) => {
    setMovimientoAFToEditViewDetails(vwMovimiento);
    setShowPDF(true);
  }

  return (
    <>
      <div className='searchAdd_ButtonDiv'>
        <p>Mostrando {movimientosPaginaActual.length} de {totalMovimientos} registros de movimientos</p>

        <div className='buttons_Div'>
          <select className='selectList' value={movimientosPorPagina} onChange={handleChangeMovimientosPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por código, nombre o ID"
            value={busqueda}
            onChange={handleSearch}
          />
        </div>
      </div>

      {!loading && movimientosPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>No hay registros de movimientos</p> <FiAlertTriangle />
        </div>
      ) : (
        <>
          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />

          <TablaEntidades
            className='list_entitiesDiv_movIndividual'
            filas={movimientosPaginaActual}
            columnas={columnas}
            clave={(movimiento) => movimiento.id_activo_fijo ?? ''}
            orden={orden}
            onOrden={alternarOrden}
            filtros={filtros}
            onFiltro={cambiarFiltro}
            mensajeVacio={<p>No hay coincidencias con los filtros seleccionados.</p>}
          />

          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />
        </>
      )}

      {isModalViewDetailsOpen && movimientoAFToEditViewDetails && (
        <ModalAFDetails isOpen={isModalViewDetailsOpen} onClose={closeModalViewDetails} activoDetalle={movimientoAFToEditViewDetails} />
      )}

      {isModalEditMovimientoOpen && movimientoAFToEditViewDetails && (
        <EditMovimientoAF isOpen={isModalEditMovimientoOpen} onClose={closeModalEditMovimiento} movimientoAFToEdit={movimientoAFToEditViewDetails} />
      )}

      <Modal
        isOpen={showPDF}
        onRequestClose={() => setShowPDF(false)}
        className='viewPDF'
        contentLabel='Vista previa PDF'
        ariaHideApp={false}
      >
        <div style={{ height: '94vh' }}>
          <PDFViewer width="100%" height="100%">
            <MyDocument movimientoActivo={movimientoAFToEditViewDetails} responsableActual={movimientoAFToEditViewDetails?.responsable_actual_completo} />
          </PDFViewer>
        </div>
      </Modal>


    </>
  );
};

export default AlmacenGeneral_MovimientoIndividual;