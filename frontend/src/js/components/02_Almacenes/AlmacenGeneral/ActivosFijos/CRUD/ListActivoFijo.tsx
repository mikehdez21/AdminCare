// Bibliotecas
import React, { useState, useEffect } from 'react';
import { RootState, AppDispatch } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


// Activos Fijos
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getActivosFijos, getActivosFijosDadosDeBaja, getActivosFijosPorClasificacion, getActivosFijosPorDepartamento, getActivosFijosPorUbicacion } from '@/store/almacenGeneral/Activos/activosActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddActivoFijo from './AddActivoFijo';
import EditActivoFijo from './EditActivoFijo';
import DeleteActivoFijo from './DeleteActivoFijo';

import { formatDateHorasToFrontend } from '@/utils/dateFormat';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/listActivosFijos.css'

interface ListActivoFijoProps {
  DepartamentoSeleccionado?: number;
  UbicacionSeleccionada?: number;
  ClasificacionSeleccionada?: number;
  ActivosBajas?: boolean;
}


const ListActivosFijos: React.FC<ListActivoFijoProps> = ({ DepartamentoSeleccionado, UbicacionSeleccionada, ClasificacionSeleccionada, ActivosBajas }) => {
  const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

  const [activosFiltrados, setActivosFiltrados] = useState<ActivosFijos[]>([]);
  const estatusActivoFijo = useSelector((state: RootState) => state.activos.estatusActivoFijo);
  const clasificacionActivoFijo = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);

  const [isModalAddActivoFijoOpen, setModalAddActivoFijoOpen] = useState(false);
  const [isModalEditActivoFijoOpen, setModalEditActivoFijoOpen] = useState(false);
  const [isModalDeleteActivoFijoOpen, setModalDeleteActivoFijoOpen] = useState(false);

  const [actualizarActivosFijos, setActualizarActivosFijos] = useState(false);


  useEffect(() => {

    if (DepartamentoSeleccionado) {
      navigate(`/almacen_general/activos/departamento/${DepartamentoSeleccionado}`);
      const cargarAFporDepartamento = async () => {
        try {
          const resultAction = await dispatch(getActivosFijosPorDepartamento(DepartamentoSeleccionado!)).unwrap();
          console.log('Activos Fijos por Departamento cargados:', resultAction.activosFijos);
          if (resultAction.success && resultAction.activosFijos) {
            setActivosFiltrados(resultAction.activosFijos);
          } else {
            setActivosFiltrados([]);
          }

        } catch (error) {
          console.error('Error al cargar los activos fijos por departamento:', error);
        }
      };
      cargarAFporDepartamento();

    } else if (UbicacionSeleccionada) {
      const cargarAFporUbicacion = async () => {
        try {
          const resultAction = await dispatch(getActivosFijosPorUbicacion(UbicacionSeleccionada!)).unwrap();
          console.log('Activos Fijos por Ubicación cargados:', resultAction.activosFijos);
          if (resultAction.success && resultAction.activosFijos) {
            setActivosFiltrados(resultAction.activosFijos);
          } else {
            setActivosFiltrados([]);
          }
        } catch (error) {
          console.error('Error al cargar los activos fijos por ubicación:', error);
        }
      };
      cargarAFporUbicacion();

    } else if (ClasificacionSeleccionada) {
      const cargarAFporClasificacion = async () => {
        try {
          const resultAction = await dispatch(getActivosFijosPorClasificacion(ClasificacionSeleccionada!)).unwrap();
          console.log('Activos Fijos por Clasificación cargados:', resultAction.activosFijos);
          if (resultAction.success && resultAction.activosFijos) {
            setActivosFiltrados(resultAction.activosFijos);
          } else {
            setActivosFiltrados([]);
          }
        } catch (error) {
          console.error('Error al cargar los activos fijos por clasificación:', error);
        }
      };
      cargarAFporClasificacion();

    } else if (ActivosBajas) {
      navigate('/almacen_general/activosfijos-bajas');
      const cargarAFBajas = async () => {
        try {
          const resultAction = await dispatch(getActivosFijosDadosDeBaja()).unwrap();
          console.log('Activos Fijos dados de baja cargados:', resultAction.activosFijos);
          if (resultAction.success && resultAction.activosFijos) {
            setActivosFiltrados(resultAction.activosFijos);
          } else {
            setActivosFiltrados([]);
          }
        } catch (error) {
          console.error('Error al cargar los activos fijos dados de baja:', error);
        }
      };
      cargarAFBajas();

    } else if (!DepartamentoSeleccionado && !UbicacionSeleccionada && !ClasificacionSeleccionada) {
      const cargarActivosFijos = async () => {
        navigate('/almacen_general/activosfijos');
        try {
          const resultAction = await dispatch(getActivosFijos()).unwrap();
          console.log('Todos los Activos Fijos cargados:', resultAction.activosFijos);
          if (resultAction.success && resultAction.activosFijos) {
            setActivosFiltrados(resultAction.activosFijos);
          } else {
            setActivosFiltrados([]);
          }
        } catch (error) {
          console.error('Error al cargar los activos fijos:', error);
        }
      };
      cargarActivosFijos();

    } else if (actualizarActivosFijos) {
      const cargarActivosFijos = async () => {
        try {
          const resultAction = await dispatch(getActivosFijos()).unwrap();
          console.log('Actualización: Todos los Activos Fijos cargados:', resultAction.activosFijos);
          if (resultAction.success && resultAction.activosFijos) {
            setActivosFiltrados(resultAction.activosFijos);
          } else {
            setActivosFiltrados([]);
          }
        } catch (error) {
          console.error('Error al cargar los activos fijos:', error);
        }
      };
      cargarActivosFijos();
    }

  }, [DepartamentoSeleccionado, UbicacionSeleccionada, ClasificacionSeleccionada, actualizarActivosFijos, dispatch]);


  const totalActivosFijos = activosFiltrados.length;
  const [activoFijoToEdit_Delete, setActivoFijoToEdit_Delete] = useState<ActivosFijos | null>(null);

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [activosFijosPorPagina, setActivosFijosPorPagina] = useState<number>(5);

  
  // Filtrar y ordenar activos fijos basados en la búsqueda
  const activosFijosFiltrados = Array.isArray(activosFiltrados)
    ? activosFiltrados
      .filter(activo =>
        activo.descripcion_af.toLowerCase().includes(busqueda.toLowerCase()) ||
        activo.id_activo_fijo?.toString().includes(busqueda) ||
        (activo.codigo_lote || '').toLowerCase().includes(busqueda.toLowerCase())
      )
      .sort((a, b) => a.id_activo_fijo! - b.id_activo_fijo!) // Orden ascendente por ID
    : [];


  // Obtener los activos para la página actual
  const indexUltimoActivoFijo = paginaActual * activosFijosPorPagina;
  const indexPrimerActivoFijo = indexUltimoActivoFijo - activosFijosPorPagina;
  const activosFijosPaginaActual = activosFijosFiltrados.slice(indexPrimerActivoFijo, indexUltimoActivoFijo);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(activosFijosFiltrados.length / activosFijosPorPagina);


  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de activos por página
  const handleChangeActivosFijosPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivosFijosPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de activos por página
  };

  // Añadir ActivoFijo
  const openModalAddActivoFijo = () => {
    setModalAddActivoFijoOpen(true);
  };
  const closeModalAddActivoFijo = () => {
    setModalAddActivoFijoOpen(false);
  };

  // Editar ActivoFijo
  const openModalEditActivoFijo = (activo: ActivosFijos) => {
    setActivoFijoToEdit_Delete(activo); // Establecer el activo fijo seleccionado
    setModalEditActivoFijoOpen(true);
  };

  const closeModalEditActivoFijo = () => {
    setActivoFijoToEdit_Delete(null); // Establecer el activo fijo seleccionado
    setModalEditActivoFijoOpen(false);

  };

  const handleActualizarActivosEditados = () => {
    setActivoFijoToEdit_Delete(null); // Limpiar el activo fijo seleccionado
    setModalEditActivoFijoOpen(false); // Cerrar el modal de edición
    setActualizarActivosFijos(true); // Indicar que se deben actualizar los activos fijos en el componente padre
  }

  // Eliminar ActivoFijo
  const openAlertDeleteActivoFijo = (activo: ActivosFijos) => {
    setActivoFijoToEdit_Delete(activo); // Establecer el activo fijo seleccionado
    setModalDeleteActivoFijoOpen(true);
  };
  const closeAlertDeleteActivoFijo = () => {
    setActivoFijoToEdit_Delete(null); // Establecer el activo fijo seleccionado
    setModalDeleteActivoFijoOpen(false);

  };

  return (
    <div className='mainDiv_ListActivosFijos'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <p>Mostrando {activosFijosPaginaActual.length} de {totalActivosFijos} activos fijos</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={activosFijosPorPagina} onChange={handleChangeActivosFijosPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por descripción, ID o lote"
            value={busqueda}
            onChange={handleSearch}
          />

          <button className='buttonAdd' onClick={openModalAddActivoFijo}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Activo Fijo
          </button>
        </div>

      </div>


      {activosFijosFiltrados && activosFijosFiltrados.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay activos fijos registrados </p> <FiAlertTriangle />
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
                  <th id='th_ID'>ID</th>
                  <th id='th_CodigoUnico'>Código Único</th>
                  <th id='th_CodigoLote'>Lote</th>
                  <th id='th_NombreAF'>Nombre ActivoFijo</th>
                  <th id='th_Descripcion'>Descripción</th>
                  <th id='th_Modelo'>Modelo</th>
                  <th id='th_Marca'>Marca</th>
                  <th id='th_NumeroSerie'>Número de Serie</th>
                  <th id='th_ValorCompra'>Valor de Compra</th>
                  <th id='th_FechaCompra'>Fecha Compra</th>
                  <th id='th_AFPropio'>Activo Propio</th>
                  <th id='th_EstadoAF'>Estado del Activo</th>
                  <th id='th_ClasificacionAF'>Clasificación</th>
                  <th id='th_FechaRegistro'>Fecha Registro</th>
                  <th id='th_Observaciones'>Observaciones</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
                  <th id='th_Acciones'>ACCIONES</th>

                </tr>
              </thead>

              <tbody>
                {activosFijosPaginaActual.map(activoFijo => (
                  <tr key={activoFijo.id_activo_fijo}>

                    <td id='td_ID'>{activoFijo.id_activo_fijo}</td>
                    <td id='td_CodigoUnico'>{activoFijo.codigo_unico}</td>
                    <td id='td_CodigoLote'>
                      <p className='CodigoLote'>
                        {activoFijo.codigo_lote
                          ? `${activoFijo.codigo_lote} (${activoFijo.lote_afconsecutivo || '-'} / ${activoFijo.lote_total || '-'})`
                          : '-'}

                      </p>
                    </td>


                    <td id='td_NombreAF'>
                      <p className='NombreAF'>
                        {activoFijo.nombre_af}
                      </p>
                    </td>

                    <td id='td_Descripcion'>
                      <div className='divDescripcionAF'>
                        {activoFijo.descripcion_af}
                      </div>
                    </td>

                    <td id='td_Modelo'>
                      <div className='divModeloAF'>
                        {activoFijo.modelo_af}
                      </div>
                    </td>
                    <td id='td_Marca'>{activoFijo.marca_af}</td>

                    <td id='td_NumeroSerie'>
                      <div className='divNumeroSerieAF'>
                        {activoFijo.numero_serie_af}
                      </div>
                    </td>
                    <td id='td_ValorCompra'>$ {activoFijo.valor_compra_af}</td>
                    <td id='td_FechaCompra'>{formatDateHorasToFrontend(activoFijo.fecha_compra_af)}</td>
                    <td id='td_AFPropio'>{activoFijo.af_propio ? 'Sí' : 'No'}</td>

                    <td id='td_EstadoAF'>
                      {estatusActivoFijo.map((estatusAF) => {
                        if (activoFijo.id_estado_af !== estatusAF.id_estatusaf) return null;

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

                    <td id='td_ClasificacionAF'>{clasificacionActivoFijo.map((clasificacionAF) => (
                      <div key={clasificacionAF.id_clasificacion} className='divClasificacionAF'>
                        {activoFijo.id_clasificacion === clasificacionAF.id_clasificacion ? clasificacionAF.nombre_clasificacion : ''}
                      </div>
                    ))}</td>


                    <td id='td_FechaRegistro'>{formatDateHorasToFrontend(activoFijo.fecha_registro_af)}</td>

                    <td id='td_Observaciones'>
                      <div className='divObservacionesAF'>
                        {activoFijo.observaciones_af}
                      </div>
                    </td>

                    <td id='td_FechaCreacion'>{activoFijo.created_at}</td>
                    <td id='td_FechaModificacion'>{activoFijo.updated_at}</td>

                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditActivoFijo(activoFijo)}> <MdEdit /> </button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteActivoFijo(activoFijo)}><MdDeleteForever /> </button>
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

      {isModalAddActivoFijoOpen && (
        <AddActivoFijo isOpen={isModalAddActivoFijoOpen} onClose={closeModalAddActivoFijo} onAddSinFactura={handleActualizarActivosEditados} />
      )}

      {isModalEditActivoFijoOpen && activoFijoToEdit_Delete && (
        <EditActivoFijo isOpen={isModalEditActivoFijoOpen} onClose={closeModalEditActivoFijo} activoFijoToEdit={activoFijoToEdit_Delete} onEdit={handleActualizarActivosEditados} />
      )}

      {isModalDeleteActivoFijoOpen && activoFijoToEdit_Delete && (
        <DeleteActivoFijo isOpen={isModalDeleteActivoFijoOpen} onClose={closeAlertDeleteActivoFijo} activoFijoToDelete={activoFijoToEdit_Delete} />
      )}

    </div>

  )
};

export default ListActivosFijos;
