// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';

// Movimientos Activos Fijos  
import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getVWmovimientosActivosFijos, getTipoMovimientosActivosFijos } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListvwMovimientosAF } from '@/store/almacenGeneral/Activos/vwMovimientosAFReducer';
import { setListTipoMovimientoAF } from '@/store/almacenGeneral/Activos/MovimientosActivos/movimientosAFReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import ModalAFDetails from './DetalleMovimientosAF';
import EditMovimientoAF from './EditMovifimientoAF';

// Icons
import { MdEdit, MdVisibility } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/MovimientosAFControl.css';
import { getEstatusActivosFijos } from '@/store/almacenGeneral/Activos/activosActions';
import { setListEstatusActivosFijos } from '@/store/almacenGeneral/Activos/activosReducer';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';

const AlmacenGeneral_MovimientosAF: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Cambiar a usar la vista de movimientos en lugar de movimientos simples
  const activosMovimientos = useSelector((state: RootState) => state.vwMovimientosAF.activosMovimientos);
  const estatusActivoFijo = useSelector((state: RootState) => state.activos.estatusActivoFijo);


  // Estados para el componente de movimientos
  const [movimientoAFToEditViewDetails, setMovimientoAFToEditViewDetails] = useState<VwMovimientosAF | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [movimientosPorPagina, setMovimientosPorPagina] = useState<number>(5);

  const [isModalViewDetailsOpen, setModalViewDetailsOpen] = useState(false);
  const [isModalEditMovimientoOpen, setModalEditMovimientoOpen] = useState(false);

  const totalMovimientos = activosMovimientos.length;


  // Filtrar movimientos basados en búsqueda
  const movimientosFiltrados = Array.isArray(activosMovimientos)
    ? activosMovimientos
      .filter(movimientoAF =>
        movimientoAF.id_activo_fijo?.toString().includes(busqueda)
        || movimientoAF.codigo_unico?.toLowerCase().includes(busqueda.toLowerCase())
        || movimientoAF.nombre_af?.toLowerCase().includes(busqueda.toLowerCase())
      )
      .sort((a, b) => {
        // Ordenar por fecha de último movimiento (más reciente primero)
        const fechaA = new Date(a.fecha_ultimo_movimiento || '').getTime();
        const fechaB = new Date(b.fecha_ultimo_movimiento || '').getTime();
        return fechaB - fechaA;
      })
    : [];



  // Paginación
  const indexUltimoMovimiento = paginaActual * movimientosPorPagina;
  const indexPrimerMovimiento = indexUltimoMovimiento - movimientosPorPagina;
  const movimientosPaginaActual = movimientosFiltrados.slice(indexPrimerMovimiento, indexUltimoMovimiento);
  const numeroTotalPaginas = Math.ceil(movimientosFiltrados.length / movimientosPorPagina);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const handleChangeMovimientosPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMovimientosPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

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
        const resultAction = await dispatch(getEstatusActivosFijos()).unwrap();

        if (resultAction.success) {
          dispatch(setListEstatusActivosFijos(resultAction.estatusAF!)); // Establece el estatus en el estado

        } else {
          console.log('Error', resultAction.message)
        }

      } catch (error) {
        console.error('Error al cargar estatus de activos fijos:', error);
      }
    };
    cargarEstatusActivosFijos();






  }, [dispatch]);

  return (
    <div className='mainDiv_MovimientosAFControl'>
      <div className='searchAdd_ButtonDiv'>
        <div className='text_Div'>
          <h1>Movimientos de Activos Fijos</h1>
          <p>Mostrando {movimientosPaginaActual.length} de {totalMovimientos} registros de trazabilidad</p>
        </div>

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

      <hr />

      {movimientosFiltrados && movimientosFiltrados.length === 0 ? (
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
                  <th id='th_TipoMovimiento'>Tipo de Movimiento</th>
                  <th id='th_ResponsableActual'>Responsable Actual</th>
                  <th id='th_UbicacionActual'>Ubicación Actual</th>
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

                    <td id='td_TipoMovimiento'>{vwMovimiento.tipo_movimiento}</td>

                    <td id='td_ResponsableActual'>
                      <div className='divResponsableAF'>
                        {vwMovimiento.responsable_actual_completo}
                      </div>
                    </td>

                    <td id='td_UbicacionActual'>{vwMovimiento.ubicacion_actual}</td>


                    <td id='td_DepartamentoResponsable'>{vwMovimiento.departamento_actual}</td>

                    <td id='td_UltimoMotivoMovimiento'>
                      <div className='divMotivoMovimiento'>
                        {vwMovimiento.ultimo_motivo_movimiento}
                      </div>
                    </td>



                    <td id='td_Acciones'>
                      <div className='divActions'>
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


    </div>
  );
};

export default AlmacenGeneral_MovimientosAF;