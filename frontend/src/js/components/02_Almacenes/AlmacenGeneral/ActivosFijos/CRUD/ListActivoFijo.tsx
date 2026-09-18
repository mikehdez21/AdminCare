// Bibliotecas
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RootState, AppDispatch } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


// Activos Fijos
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import {
  getActivosFijos,
  getActivosFijosDadosDeBaja,
  getActivosFijosNoPropios,
  getActivosFijosPorClasificacion,
  getActivosFijosPorDepartamento,
  getActivosFijosPorResponsable,
  getActivosFijosPorUbicacion,
  getActivosFijosMenores
} from '@/store/almacengeneral/Activos/activosActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddActivoFijo from './AddActivoFijo';
import EditActivoFijo from './EditActivoFijo';
import DeleteActivoFijo from './DeleteActivoFijo';
import CheckAF from '../CheckAFs';
import ResumenAF from '../ResumenAF';
import TablaActivosFijos from './subcomponents/TablaActivosFijos';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaListCheck } from 'react-icons/fa6';
import { FaChartBar } from 'react-icons/fa';



// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/listActivosFijos.css'

interface ListActivoFijoProps {
  DepartamentoSeleccionado?: number;
  UbicacionSeleccionada?: number;
  ClasificacionSeleccionada?: number;
  EmpleadoSeleccionado?: number;
  ActivosBajas?: boolean;
  ActivosNoPropios?: boolean;
  ActivosMenores?: boolean;
}


const ListActivosFijos: React.FC<ListActivoFijoProps> = ({ DepartamentoSeleccionado, UbicacionSeleccionada, ClasificacionSeleccionada, EmpleadoSeleccionado, ActivosBajas, ActivosNoPropios, ActivosMenores }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [activosFiltrados, setActivosFiltrados] = useState<ActivosFijos[]>([]);
  const estatusActivoFijo = useSelector((state: RootState) => state.estatusAF.estatusAF);
  const clasificacionActivoFijo = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);

  const [isModalAddActivoFijoOpen, setModalAddActivoFijoOpen] = useState(false);
  const [isModalEditActivoFijoOpen, setModalEditActivoFijoOpen] = useState(false);
  const [isModalDeleteActivoFijoOpen, setModalDeleteActivoFijoOpen] = useState(false);

  const [isCheckAFOpen, setCheckAFOpen] = useState<boolean>(false);
  const [isResumenAFOpen, setResumenAFOpen] = useState<boolean>(false);
  const [isListActivosOpen, setListActivosOpen] = useState<boolean>(true);

  const [actualizarActivosFijos, setActualizarActivosFijos] = useState(false);


  // -------------------------------------------------------------------------
  // Carga de la lista COMPLETA de la variante (para los modales de Inventario
  // y Resumen, y para poblar el store como se hacía antes de la paginación
  // servidor). La tabla usa la paginación servidor por separado.
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Helper único para el patrón dispatch(unwrap) + setActivosFiltrados de las 8 ramas,
    // conservando el mensaje de error original de cada rama.
    const ejecutarCargaActivos = async (
      cargar: () => Promise<{ success: boolean; activosFijos?: ActivosFijos[] }>,
      mensajeError: string,
    ) => {
      try {
        const resultAction = await cargar();
        if (resultAction.success && resultAction.activosFijos) {
          setActivosFiltrados(resultAction.activosFijos);
        } else {
          setActivosFiltrados([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(mensajeError, error);
        }
      }
    };

    if (DepartamentoSeleccionado) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosPorDepartamento(DepartamentoSeleccionado)).unwrap(),
        'Error al cargar los activos fijos por departamento:',
      );
    } else if (UbicacionSeleccionada) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosPorUbicacion(UbicacionSeleccionada)).unwrap(),
        'Error al cargar los activos fijos por ubicación:',
      );
    } else if (ClasificacionSeleccionada) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosPorClasificacion(ClasificacionSeleccionada)).unwrap(),
        'Error al cargar los activos fijos por clasificación:',
      );
    } else if (EmpleadoSeleccionado) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosPorResponsable(EmpleadoSeleccionado)).unwrap(),
        'Error al cargar los activos fijos por empleado:',
      );
    } else if (ActivosBajas) {
      navigate('/almacen-general/activos-fijos-bajas');
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosDadosDeBaja()).unwrap(),
        'Error al cargar los activos fijos dados de baja:',
      );
    } else if (ActivosNoPropios) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosNoPropios()).unwrap(),
        'Error al cargar los activos fijos no propios:',
      );
    } else if (ActivosMenores) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijosMenores()).unwrap(),
        'Error al cargar los activos fijos menores:',
      );
    } else if (!DepartamentoSeleccionado && !UbicacionSeleccionada && !ClasificacionSeleccionada && !EmpleadoSeleccionado && !ActivosBajas && !ActivosNoPropios && !ActivosMenores) {
      navigate('/almacen-general/activos-fijos');
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijos()).unwrap(),
        'Error al cargar los activos fijos:',
      );
    } else if (actualizarActivosFijos) {
      void ejecutarCargaActivos(
        () => dispatch(getActivosFijos()).unwrap(),
        'Error al cargar los activos fijos:',
      );
    }

  }, [
    DepartamentoSeleccionado,
    UbicacionSeleccionada,
    ClasificacionSeleccionada,
    EmpleadoSeleccionado,
    ActivosBajas,
    ActivosNoPropios,
    ActivosMenores,
    actualizarActivosFijos,
    dispatch,
    navigate,
  ]);

  // -------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de la variante activa con
  // { page, per_page, search } (mismo orden de prioridad que la carga completa).
  // -------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: ActivosFijos[]; meta: PaginacionMeta | null }> => {
      if (DepartamentoSeleccionado) {
        const resultAction = await dispatch(getActivosFijosPorDepartamento({ id: DepartamentoSeleccionado, ...params })).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos por departamento');
      }
      if (UbicacionSeleccionada) {
        const resultAction = await dispatch(getActivosFijosPorUbicacion({ id: UbicacionSeleccionada, ...params })).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos por ubicación');
      }
      if (ClasificacionSeleccionada) {
        const resultAction = await dispatch(getActivosFijosPorClasificacion({ id: ClasificacionSeleccionada, ...params })).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos por clasificación');
      }
      if (EmpleadoSeleccionado) {
        const resultAction = await dispatch(getActivosFijosPorResponsable({ id: EmpleadoSeleccionado, ...params })).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos por empleado');
      }
      if (ActivosBajas) {
        const resultAction = await dispatch(getActivosFijosDadosDeBaja(params)).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos dados de baja');
      }
      if (ActivosNoPropios) {
        const resultAction = await dispatch(getActivosFijosNoPropios(params)).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos no propios');
      }
      if (ActivosMenores) {
        const resultAction = await dispatch(getActivosFijosMenores(params)).unwrap();
        if (resultAction.success && resultAction.activosFijos) {
          return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
        }
        throw new Error(resultAction.message || 'Error al obtener los activos fijos menores');
      }

      const resultAction = await dispatch(getActivosFijos(params)).unwrap();
      if (resultAction.success && resultAction.activosFijos) {
        return { data: resultAction.activosFijos, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los activos fijos');
    },
    [
      DepartamentoSeleccionado,
      UbicacionSeleccionada,
      ClasificacionSeleccionada,
      EmpleadoSeleccionado,
      ActivosBajas,
      ActivosNoPropios,
      ActivosMenores,
      dispatch,
    ],
  );

  // Búsqueda + paginación servidor
  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: activosFijosPorPagina,
    items: activosFijosPaginaActual,
    totalItems: totalActivosFijos,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeActivosFijosPorPagina,
  } = usePaginacionServidor<ActivosFijos>({
    fetcher,
    perPageDefault: 5,
  });

  // Refrescar la página actual de la tabla tras crear/editar desde los modales.
  useEffect(() => {
    if (actualizarActivosFijos) {
      refetch();
    }
  }, [actualizarActivosFijos, refetch]);

  // Listas base del store (referencias estables) para derivar el título del filtro activo.
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);

  // Información del filtro activo. Se memoiza para no crear objetos nuevos en cada render
  // (antes eran selectores inline que retornaban objetos nuevos en cada render).
  const infoDepartamento = useMemo(() => {
    if (!DepartamentoSeleccionado) {
      return undefined;
    }

    const departamento = departamentos.find((depto) => depto.id_departamento === DepartamentoSeleccionado);

    return { ...departamento, nombre_departamento: departamento?.nombre_departamento };
  }, [DepartamentoSeleccionado, departamentos]);

  const infoUbicacion = useMemo(() => {
    if (!UbicacionSeleccionada) {
      return undefined;
    }

    const ubicacion = ubicaciones.find((ubic) => ubic.id_ubicacion === UbicacionSeleccionada);

    return { ...ubicacion, nombre_ubicacion: ubicacion?.nombre_ubicacion };
  }, [UbicacionSeleccionada, ubicaciones]);

  const infoClasificacion = useMemo(() => {
    if (!ClasificacionSeleccionada) {
      return undefined;
    }

    const clasificacion = clasificacionActivoFijo.find((clasif) => clasif.id_clasificacion === ClasificacionSeleccionada);

    return { ...clasificacion, nombre_clasificacion: clasificacion?.nombre_clasificacion };
  }, [ClasificacionSeleccionada, clasificacionActivoFijo]);

  const infoLugarSeleccionado = () => {
    if (DepartamentoSeleccionado && infoDepartamento) {
      return 'Activos del Departamento: ' + infoDepartamento.nombre_departamento;
    }
    if (UbicacionSeleccionada && infoUbicacion) {
      return 'Activos de la Ubicación: ' + infoUbicacion.nombre_ubicacion;
    }
    if (ClasificacionSeleccionada && infoClasificacion) {
      return 'Activos de la Clasificación: ' + infoClasificacion.nombre_clasificacion;
    }
    if (ActivosBajas) {
      return 'Activos Dados de Baja';
    }
    if (ActivosNoPropios) {
      return 'Activos que No son Propios';
    }
    if (ActivosMenores) {
      return 'Activos Menores';
    }
    return 'Todos los Activos';
  };


  const [activoFijoToEdit_Delete, setActivoFijoToEdit_Delete] = useState<ActivosFijos | null>(null);


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


  // Eliminar ActivoFijo
  const openAlertDeleteActivoFijo = (activo: ActivosFijos) => {
    setActivoFijoToEdit_Delete(activo); // Establecer el activo fijo seleccionado
    setModalDeleteActivoFijoOpen(true);
  };
  const closeAlertDeleteActivoFijo = () => {
    setActivoFijoToEdit_Delete(null); // Establecer el activo fijo seleccionado
    setModalDeleteActivoFijoOpen(false);

  };


  const handleActualizarActivosEditados = () => {
    setActivoFijoToEdit_Delete(null); // Limpiar el activo fijo seleccionado
    setModalEditActivoFijoOpen(false); // Cerrar el modal de edición
    setActualizarActivosFijos(true); // Indicar que se deben actualizar los activos fijos en el componente padre
  }

  // Checar ActivosFijos
  const openCheckAF = () => {
    setCheckAFOpen(true);
    setResumenAFOpen(false);
    setListActivosOpen(false);
  }

  const closeCheckAF = () => {
    setCheckAFOpen(false);
    setListActivosOpen(true);
  }

  const renderCheckAF = () => (

    <div className='mainDiv_CheckAF'>
      <CheckAF
        isOpen={isCheckAFOpen}
        onClose={closeCheckAF}
        listActivos={activosFiltrados}
        infoLugar={infoLugarSeleccionado()}
      />
    </div>

  );


  // Resumen de Activos
  const openResumenAF = () => {
    setResumenAFOpen(true);
    setCheckAFOpen(false);
    setListActivosOpen(false);
  }

  const closeResumenAF = () => {
    setResumenAFOpen(false);
    setListActivosOpen(true);
  }

  const renderResumenAF = () => (
    <div className='mainDiv_ResumenAF'>
      <ResumenAF isOpen={isResumenAFOpen} onClose={closeResumenAF} listActivos={activosFiltrados} infoLugar={infoLugarSeleccionado()} />
    </div>
  );


  const renderListActivosFijos = () => (
    <div className='mainDiv_ListActivosFijos'>

      <div className='searchAdd_ButtonDiv'>

        <div>
          <p>Mostrando {activosFijosPaginaActual.length} de {totalActivosFijos} activos fijos</p>

        </div>


        <div className='search_Div'>

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

        </div>

        <div className='buttons_Div'>


          {/* Mostrar solo cuando es ver todos los activos */}
          {(!DepartamentoSeleccionado && !UbicacionSeleccionada && !ClasificacionSeleccionada && !EmpleadoSeleccionado && !ActivosBajas && !ActivosNoPropios && !ActivosMenores) && (
            <button className='buttonAdd' onClick={openModalAddActivoFijo}>
              <IoAddCircleOutline className='iconAdd' /> <p>  Nuevo Activo Fijo </p>
            </button>
          )}

          <button className='checkAF' onClick={openCheckAF}>
            <FaListCheck className='iconCheck' /> <p> Inventario </p>
          </button>

          <button className='resumenAF' onClick={openResumenAF}>
            <FaChartBar className='iconResumen' /> <p> Resumen </p>
          </button>
        </div>

      </div>


      {!loading && activosFijosPaginaActual.length === 0 ? (
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

          <TablaActivosFijos
            activosFijosPaginaActual={activosFijosPaginaActual}
            estatusActivoFijo={estatusActivoFijo}
            clasificacionActivoFijo={clasificacionActivoFijo}
            onEdit={openModalEditActivoFijo}
            onDelete={openAlertDeleteActivoFijo}
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
      )
      }

      {
        isModalAddActivoFijoOpen && (
          <AddActivoFijo isOpen={isModalAddActivoFijoOpen} onClose={closeModalAddActivoFijo} onAddSinFactura={handleActualizarActivosEditados} />
        )
      }

      {
        isModalEditActivoFijoOpen && activoFijoToEdit_Delete && (
          <EditActivoFijo isOpen={isModalEditActivoFijoOpen} onClose={closeModalEditActivoFijo} activoFijoToEdit={activoFijoToEdit_Delete} onEdit={handleActualizarActivosEditados} />
        )
      }

      {
        isModalDeleteActivoFijoOpen && activoFijoToEdit_Delete && (
          <DeleteActivoFijo isOpen={isModalDeleteActivoFijoOpen} onClose={closeAlertDeleteActivoFijo} activoFijoToDelete={activoFijoToEdit_Delete} />
        )
      }


    </div >
  );

  return (
    <>
      {isListActivosOpen
        ? renderListActivosFijos()
        : isCheckAFOpen
          ? renderCheckAF()
          : renderResumenAF()}
    </>


  )
};

export default ListActivosFijos;