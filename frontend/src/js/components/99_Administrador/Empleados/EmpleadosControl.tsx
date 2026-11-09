// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';

// Empleados
import { Empleados } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';

// Departamentos
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';


// Componentes
import AddEmpleado from './AddEmpleado';
import EditEmpleado from './EditEmpleado';
import DeleteEmpleado from './DeleteEmpleado';
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import ShowPhotoEmpleado from './ShowPhotoEmpleado';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaImagePortrait } from 'react-icons/fa6';

import { formatDateHorasToFrontend } from '@/utils/dateFormat';

// Styles
import '@styles/99_Administrador/Empleados/empleadosControl.css';

const Main_EmpleadosControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  const [isModalFotoEmpleadoOpen, setIsFotoEmpleadoOpen] = useState(false);
  const [empleadoToShow, setEmpleadoToShow] = useState<Empleados | null>(null);
  const [empleadoToEdit_Delete, setEmpleadoToEdit_Delete] = useState<Empleados | null>(null);

  const [isModalAddEmpleadoOpen, setModalAddEmpleadoOpen] = useState(false);
  const [isModalEditEmpleadoOpen, setModalEditEmpleadoOpen] = useState(false);
  const [isModalDeleteEmpeladoOpen, setModalDeleteEmpleadoOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de empleados con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren (reportes, charts, etc.).
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: Empleados[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getEmpleados(params)).unwrap();
      if (resultAction.success && resultAction.empleados) {
        return { data: resultAction.empleados, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los empleados');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: empleadosPorPagina,
    items: empleadosPaginaActual,
    totalItems: totalEmpleados,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeEmpleadosPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<Empleados>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<Empleados>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'empleados_th_EmpleadoID',
      tdId: 'empleados_td_EmpleadoID',
      fija: 'izquierda',
      render: (empleado) => empleado.id_empleado,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'nombre',
      encabezado: 'Nombre',
      thId: 'empleados_th_NombreEmpleado',
      tdId: 'empleados_td_NombreEmpleado',
      fija: 'izquierda',
      desplazamientoFijo: '50px',
      render: (empleado) => (
        <p>
          {empleado.nombre_empleado} {empleado.apellido_paterno} {empleado.apellido_materno}
        </p>
      ),
      filtro: { tipo: 'texto', placeholder: 'Nombre' },
    },
    {
      clave: 'genero',
      encabezado: 'Género',
      thId: 'empleados_th_Genero',
      tdId: 'empleados_td_Genero',
      render: (empleado) => empleado.genero,
      filtro: {
        tipo: 'seleccion',
        opciones: [
          { valor: 'Masculino', etiqueta: 'Masculino' },
          { valor: 'Femenino', etiqueta: 'Femenino' },
        ],
      },
    },
    {
      clave: 'fecha_nacimiento',
      encabezado: 'Fecha Nacimiento',
      thId: 'empleados_th_FechaNacimiento',
      tdId: 'empleados_td_FechaNacimiento',
      render: (empleado) => empleado.fecha_nacimiento,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'estatus',
      encabezado: 'Estatus',
      thId: 'empleados_th_EstatusActivo',
      tdId: 'empleados_td_EstatusActivo',
      render: (empleado) => (
        <span className={empleado.estatus_activo ? 'status-activo' : 'status-inactivo'}>
          {empleado.estatus_activo ? 'Activo' : 'Inactivo'}
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
      clave: 'jefatura',
      encabezado: 'Jefatura',
      thId: 'empleados_th_JefaturaEmpleado',
      tdId: 'empleados_td_JefaturaEmpleado',
      render: (empleado) => (
        <span className={empleado.jefatura_empleado ? 'status-jefe' : 'status-no-jefe'}>
          {empleado.jefatura_empleado ? 'Si' : 'No'}
        </span>
      ),
      filtro: {
        tipo: 'booleano',
        opciones: [
          { valor: '1', etiqueta: 'Sí' },
          { valor: '0', etiqueta: 'No' },
        ],
      },
    },
    {
      clave: 'fecha_alta',
      encabezado: 'Fecha Alta',
      thId: 'empleados_th_FechaAlta',
      tdId: 'empleados_td_FechaAlta',
      render: (empleado) => formatDateHorasToFrontend(empleado.fecha_alta) || 'Sin Registro',
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'fecha_baja',
      encabezado: 'Fecha Baja',
      thId: 'empleados_th_FechaBaja',
      tdId: 'empleados_td_FechaBaja',
      render: (empleado) => (
        <span className={empleado.estatus_activo ? '' : 'status-inactivo'}>
          {formatDateHorasToFrontend(empleado.fecha_baja) || 'Sin Registro'}
        </span>
      ),
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'departamento',
      encabezado: 'Departamento',
      thId: 'empleados_th_Departamento',
      tdId: 'empleados_td_Departamento',
      render: (empleado) =>
        departamentos.find(
          (departamento) => departamento.id_departamento === empleado.id_departamento,
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
      clave: 'foto',
      encabezado: 'Foto',
      thId: 'empleados_th_Foto',
      tdId: 'empleados_td_Foto',
      ordenable: false,
      render: (empleado) => (
        <FaImagePortrait
          id='empleados_imageIcon'
          onClick={() => openModalFotoEmpleado(empleado)}
        />
      ),
    },
    {
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'empleados_th_FechaCreacion',
      tdId: 'empleados_td_FechaCreacion',
      render: (empleado) => empleado.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'empleados_th_FechaModificacion',
      tdId: 'empleados_td_FechaModificacion',
      render: (empleado) => empleado.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'empleados_th_Acciones',
      tdId: 'empleados_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (empleado) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => openModalEditEmpleado(empleado)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => openModalDeleteEmpleado(empleado)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  // Abrir y cerrar modal de foto de empleado
  const openModalFotoEmpleado = (empleado: Empleados) => {
    setEmpleadoToShow(empleado);
    setIsFotoEmpleadoOpen(true);
  }

  const cerrarModalFotoEmpleado = () => {
    setIsFotoEmpleadoOpen(false);
  }

  // Añadir Empleado
  const openModalAddEmpleado = () => {
    setModalAddEmpleadoOpen(true);
  }
  const closeModalAddEmpleado = () => {
    setModalAddEmpleadoOpen(false);
    // Recargar la tabla paginada tras crear un empleado.
    refetch();
  }

  // Editar Empleado
  const openModalEditEmpleado = (empleado: Empleados) => {
    setModalEditEmpleadoOpen(true);
    setEmpleadoToEdit_Delete(empleado);
  }
  const closeModalEditEmpleado = () => {
    setModalEditEmpleadoOpen(false);
    setEmpleadoToEdit_Delete(null);
    // Recargar la tabla paginada tras editar un empleado.
    refetch();
  }

  // Eliminar Empleado
  const openModalDeleteEmpleado = (empleado: Empleados) => {
    setModalDeleteEmpleadoOpen(true);
    setEmpleadoToEdit_Delete(empleado);
  }
  const closeAlertDeleteEmpleado = () => {
    setModalDeleteEmpleadoOpen(false);
    setEmpleadoToEdit_Delete(null); // Limpiar el empleado seleccionado
    // Recargar la tabla paginada tras eliminar un empleado.
    refetch();
  }


  const empleados = useSelector((state: RootState) => state.empleados.empleados || []);

  // Cargar los empleados desde la API solo si no están cargados en el store
  useEffect(() => {
    if (empleados.length === 0) {
      const cargarEmpleados = async () => {
        try {
          const resultAction = await dispatch(getEmpleados()).unwrap();
          console.log('Empleados cargados:', resultAction);
          if (resultAction.success) {
            dispatch(setListEmpleados(resultAction.empleados!));
          } else {
            console.log('Error al cargar empleados:', resultAction.message);
          }
        } catch (error) {
          console.log('Error inesperado:', error);
        }
      };
      cargarEmpleados();
    }

    if (departamentos.length === 0) { // Si no hay departamentos en el store
      const cargarDepartamentos = async () => {
        try {
          const resultAction = await dispatch(getDepartamentos()).unwrap();
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
  }, [dispatch, empleados.length]);

  // Crear nuevos empleados
  const handleNuevoEmpleado = () => {
    openModalAddEmpleado();
  }

  return (
    <div className='mainDiv_EmpleadosControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Empleados</h1>
          <p>Mostrando {empleadosPaginaActual.length} de {totalEmpleados} empleados</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={empleadosPorPagina} name='selectList' onChange={handleChangeEmpleadosPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevoEmpleado}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Empleado
          </button>
        </div>

      </div>

      <hr />

      {!loading && empleadosPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay empleados registrados </p> <FiAlertTriangle />
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
            className='list_entitiesDiv_empleados'
            filas={empleadosPaginaActual}
            columnas={columnas}
            clave={(empleado) => empleado.id_empleado ?? ''}
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

      {isModalFotoEmpleadoOpen && (
        <ShowPhotoEmpleado isOpen={isModalFotoEmpleadoOpen} onClose={cerrarModalFotoEmpleado} empleadoToShow={empleadoToShow} />
      )}

      {isModalAddEmpleadoOpen && (
        <AddEmpleado isOpen={isModalAddEmpleadoOpen} onClose={closeModalAddEmpleado} />
      )}

      {isModalEditEmpleadoOpen && (
        <EditEmpleado isOpen={isModalEditEmpleadoOpen} onClose={closeModalEditEmpleado} empleadoToEdit={empleadoToEdit_Delete} />
      )}

      {isModalDeleteEmpeladoOpen && (
        <DeleteEmpleado isOpen={isModalDeleteEmpeladoOpen} onClose={closeAlertDeleteEmpleado} empleadoToDelete={empleadoToEdit_Delete} />
      )}

    </div>


  )


};

export default Main_EmpleadosControl;
