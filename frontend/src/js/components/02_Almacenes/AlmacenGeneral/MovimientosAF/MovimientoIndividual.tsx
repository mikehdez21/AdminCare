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
import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/movimientosIndividual.css';

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
  } = usePaginacionServidor<VwMovimientosAF>({
    fetcher,
    perPageDefault: 5,
  });

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

      {!loading && movimientosPaginaActual.length === 0 ? (
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

          <div className='list_entitiesDiv'>
            <table>
              <thead>
                <tr>
                  <th id='th_ID'>ID</th>
                  <th id='th_CodigoUnico'>Código</th>
                  <th id='th_NombreAF'>Activo Fijo</th>
                  <th id='th_FechaUltimoMovimiento'>Fecha Último Movimiento</th>
                  <th id='th_EstadoAF'>Estado Actual</th>
                  <th id='th_UbicacionActual'>Ubicación Actual</th>
                  <th id='th_ResponsableActual'>Responsable Actual</th>
                  <th id='th_TipoMovimiento'>Tipo de Movimiento</th>
                  <th id='th_DepartamentoResponsable'>Departamento Responsable</th>
                  <th id='th_UltimoMotivoMovimiento'>Motivo Último Movimiento</th>
                  <th id='th_Acciones'>ACCIONES</th>

                </tr>
              </thead>

              <tbody>
                {movimientosPaginaActual.map(vwMovimiento => (
                  <tr key={vwMovimiento.id_activo_fijo}>
                    <td id='td_ID'>{vwMovimiento.id_activo_fijo}</td>
                    <td id='td_CodigoUnico'>{vwMovimiento.codigo_unico}</td>

                    <td id='td_NombreAF'>
                      <div className='divNombreAF'>
                        {vwMovimiento.nombre_af}
                      </div>
                    </td>

                    <td id='td_FechaUltimoMovimiento'>{formatDateHorasToFrontend(vwMovimiento.fecha_ultimo_movimiento)}</td>

                    <td id='td_EstadoAF'>

                      {estatusActivoFijo.map((estatusAF) => {
                        if (vwMovimiento.estado_actual !== estatusAF.descripcion_estatusaf) return null;

                        const getEstatusClass = (descripcion: string) => {
                          const estatus = descripcion.toLowerCase().trim();
                          if (estatus === 'activo') return 'estatus-activo';
                          if (estatus.includes('mantenimiento') || estatus.includes('revisión')) return 'estatus-mantenimiento-revision';
                          if (estatus.includes('baja') || estatus === 'perdido') return 'estatus-baja-perdido';
                          if (estatus === 'prestado') return 'estatus-prestado';
                          return 'estatus-default';
                        };

                        return (
                          <div key={estatusAF.id_estatusaf} className={`estatus-badge ${getEstatusClass(estatusAF.descripcion_estatusaf)}`}>
                            {estatusAF.descripcion_estatusaf}
                          </div>
                        );
                      })}

                    </td>

                    <td id='td_UbicacionActual'>{vwMovimiento.ubicacion_actual}</td>

                    <td id='td_ResponsableActual'>
                      <div className='divResponsableAF'>
                        {vwMovimiento.responsable_actual_completo}
                      </div>
                    </td>

                    <td id='td_TipoMovimiento'>{vwMovimiento.tipo_movimiento}</td>


                    <td id='td_DepartamentoResponsable'>{vwMovimiento.departamento_actual}</td>

                    <td id='td_UltimoMotivoMovimiento'>
                      <div className='divMotivoMovimiento'>
                        {vwMovimiento.ultimo_motivo_movimiento}
                      </div>
                    </td>



                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button
                          type='button'
                          className="pdfButton"
                          onClick={() => {

                            handleOpenPDF(vwMovimiento);
                          }}
                        >
                          <FaFilePdf />
                        </button>

                        <button className='button_viewDetails' onClick={() => openModalViewDetails(vwMovimiento)}>
                          <MdVisibility />
                        </button>
                        <button className='button_editEntity' onClick={() => openModalEditMovimiento(vwMovimiento)}>
                          <MdEdit />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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