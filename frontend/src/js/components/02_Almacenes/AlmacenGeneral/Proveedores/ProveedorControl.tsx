// Bibliotecas
import React, { useState, useEffect, useCallback } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Proveedores
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';

// Almacen General Tipos
import { getTiposProveedores, getTiposDescuento, } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { getTiposRegimen, getTiposFacturacion } from '@/store/shared/fiscalActions';
import { getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import AddProveedor from './AddProveedor';
import EditProveedor from './EditProveedor';
import DeleteProveedor from './DeleteProveedor';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Proveedores/proveedoresControl.css';

function opcionesCatalogo<T>(
  items: T[],
  id: (item: T) => number | undefined,
  etiqueta: (item: T) => string,
): Array<{ valor: string; etiqueta: string }> {
  return items.reduce<Array<{ valor: string; etiqueta: string }>>((opciones, item) => {
    const valor = id(item);

    if (typeof valor === 'number') {
      opciones.push({ valor: String(valor), etiqueta: etiqueta(item) });
    }

    return opciones;
  }, []);
}

const AlmacenGeneral_ControlProveedor: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const [proveedorToEdit_Delete, setProveedorToEdit_Delete] = useState<Proveedores | null>(null); // Proveedor seleccionado para editar_eliminar

  const tiposProveedores = useSelector((state: RootState) => state.proveedor.tiposProveedores);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const regimenesFiscales = useSelector((state: RootState) => state.fiscal.regimenesFiscales);
  const descuentosProveedor = useSelector((state: RootState) => state.proveedor.descuentosProveedor);
  const tiposFacturacion = useSelector((state: RootState) => state.fiscal.tiposFacturacion);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);

  const [isModalAddProveedorOpen, setModalAddProveedorOpen] = useState(false);
  const [isModalEditProveedorOpen, setModalEditProveedorOpen] = useState(false);
  const [isModalDeleteProveedorOpen, setModalDeleteProveedorOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de proveedores con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los selectores y flujos que la requieren.
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: Proveedores[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getProveedores(params)).unwrap();
      if (resultAction.success && resultAction.proveedores) {
        return { data: resultAction.proveedores, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener los proveedores');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: proveedoresPorPagina,
    items: proveedoresPaginaActual,
    totalItems: totalProveedores,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeProveedoresPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<Proveedores>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<Proveedores>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'proveedores_th_ID',
      tdId: 'proveedores_td_ID',
      fija: 'izquierda',
      render: (proveedor) => proveedor.id_proveedor,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'nombre',
      encabezado: 'Empresa/Proveedor',
      thId: 'proveedores_th_Proveedor_Empresa',
      tdId: 'proveedores_td_Proveedor_Empresa',
      fija: 'izquierda',
      desplazamientoFijo: '80px',
      render: (proveedor) => proveedor.nombre_proveedor,
      filtro: { tipo: 'texto', placeholder: 'Empresa' },
    },
    {
      clave: 'razon_social',
      encabezado: 'Razón Social',
      thId: 'proveedores_th_RazonSocial',
      tdId: 'proveedores_td_RazonSocial',
      render: (proveedor) => <p>{proveedor.razon_social}</p>,
      filtro: { tipo: 'texto', placeholder: 'Razón Social' },
    },
    {
      clave: 'email',
      encabezado: 'Email',
      thId: 'proveedores_th_EmailProveedor',
      tdId: 'proveedores_td_Email',
      render: (proveedor) => proveedor.email_proveedor,
      filtro: { tipo: 'texto', placeholder: 'Email' },
    },
    {
      clave: 'telefono',
      encabezado: 'Teléfono',
      thId: 'proveedores_th_Telefono',
      tdId: 'proveedores_td_Telefono',
      render: (proveedor) => proveedor.telefono_proveedor,
      filtro: { tipo: 'texto', placeholder: 'Teléfono' },
    },
    {
      clave: 'sitio_web',
      encabezado: 'Sitio Web',
      thId: 'proveedores_th_Proveedor_SitioWeb',
      tdId: 'proveedores_td_Proveedor_SitioWeb',
      render: (proveedor) =>
        proveedor.sitioWeb ? (
          <a
            href={`https://${proveedor.sitioWeb}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {proveedor.sitioWeb}
          </a>
        ) : (
          'No disponible'
        ),
      filtro: { tipo: 'texto', placeholder: 'Sitio Web' },
    },
    {
      clave: 'rfc',
      encabezado: 'RFC',
      thId: 'proveedores_th_Proveedor_RFC',
      tdId: 'proveedores_td_Proveedor_RFC',
      render: (proveedor) => proveedor.rfc,
      filtro: { tipo: 'texto', placeholder: 'RFC' },
    },
    {
      clave: 'estatus',
      encabezado: 'Estatus',
      thId: 'proveedores_th_EstatusActivo',
      tdId: 'proveedores_td_EstatusActivo',
      render: (proveedor) => (
        <span className={proveedor.estatus_activo ? 'status-activo' : 'status-inactivo'}>
          {proveedor.estatus_activo ? 'Activo' : 'Inactivo'}
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
      clave: 'moneda',
      encabezado: 'Moneda',
      thId: 'proveedores_th_tipoMoneda',
      tdId: 'proveedores_td_tipoMoneda',
      render: (proveedor) => (
        <div className='divTipoMoneda'>
          {tiposMoneda.find((tipo) => tipo.id_tipomoneda === proveedor.id_tipo_moneda)
            ?.descripcion_tipomoneda ?? ''}
        </div>
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          tiposMoneda,
          (tipo) => tipo.id_tipomoneda,
          (tipo) => tipo.descripcion_tipomoneda,
        ),
      },
    },
    {
      clave: 'tipo_proveedor',
      encabezado: 'Tipo Proveedor',
      thId: 'proveedores_th_tipoProveedor',
      tdId: 'proveedores_td_tipoProveedor',
      render: (proveedor) => (
        <div className='divTipoProveedor'>
          {tiposProveedores.find((tipo) => tipo.id_tipoproveedor === proveedor.id_tipo_proveedor)
            ?.descripcion_tipoproveedor ?? ''}
        </div>
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          tiposProveedores,
          (tipo) => tipo.id_tipoproveedor,
          (tipo) => tipo.descripcion_tipoproveedor,
        ),
      },
    },
    {
      clave: 'forma_pago',
      encabezado: 'Forma de Pago',
      thId: 'proveedores_th_formaPago',
      tdId: 'proveedores_td_formaPago',
      render: (proveedor) => (
        <div className='divTipoFormaPago'>
          {formasPago.find((forma) => forma.id_formapago === proveedor.id_forma_pago)
            ?.descripcion_formaspago ?? ''}
        </div>
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          formasPago,
          (forma) => forma.id_formapago,
          (forma) => forma.descripcion_formaspago,
        ),
      },
    },
    {
      clave: 'regimen',
      encabezado: 'Régimen Fiscal',
      thId: 'proveedores_th_tipoRegimen',
      tdId: 'proveedores_td_tipoRegimen',
      render: (proveedor) => (
        <div className='divTipoRegimen'>
          {regimenesFiscales.find(
            (regimen) => regimen.id_regimenfiscal === proveedor.id_tipo_regimen,
          )?.descripcion_regimenfiscal ?? ''}
        </div>
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          regimenesFiscales,
          (regimen) => regimen.id_regimenfiscal,
          (regimen) => regimen.descripcion_regimenfiscal,
        ),
      },
    },
    {
      clave: 'descuento',
      encabezado: 'Tipo Descuento',
      thId: 'proveedores_th_tipoDescuento',
      tdId: 'proveedores_td_tipoDescuento',
      render: (proveedor) => (
        <div className='divTipoDescuento'>
          {descuentosProveedor.find(
            (descuento) => descuento.id_descuento_proveedor === proveedor.id_tipo_descuento,
          )?.descripcion_descuentoproveedor ?? ''}
        </div>
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          descuentosProveedor,
          (descuento) => descuento.id_descuento_proveedor,
          (descuento) => descuento.descripcion_descuentoproveedor,
        ),
      },
    },
    {
      clave: 'facturacion',
      encabezado: 'Tipo Facturación',
      thId: 'proveedores_th_tipoFacturacion',
      tdId: 'proveedores_td_tipoFacturacion',
      render: (proveedor) => (
        <div className='divTipoFacturacion'>
          {tiposFacturacion.find(
            (tipo) => tipo.id_tipofacturacion === proveedor.id_tipo_facturacion,
          )?.descripcion_tipofacturacion ?? ''}
        </div>
      ),
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          tiposFacturacion,
          (tipo) => tipo.id_tipofacturacion,
          (tipo) => tipo.descripcion_tipofacturacion,
        ),
      },
    },
    {
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'proveedores_th_FechaCreacion',
      tdId: 'proveedores_td_FechaCreacion',
      render: (proveedor) => proveedor.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'proveedores_th_FechaModificacion',
      tdId: 'proveedores_td_FechaModificacion',
      render: (proveedor) => proveedor.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'proveedores_th_Acciones',
      tdId: 'proveedores_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (proveedor) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => openModalEditProveedor(proveedor)}>
            <MdEdit />
          </button>
          <button className='button_deleteEntity' onClick={() => openAlertDeleteProveedor(proveedor)}>
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  // Añadir Proveedor
  const openModalAddProveedor = () => {
    setModalAddProveedorOpen(true);
  };
  const closeModalAddProveedor = () => {
    setModalAddProveedorOpen(false);
    // Recargar la tabla paginada tras crear un proveedor.
    refetch();
  };

  // Editar Proveedor
  const openModalEditProveedor = (proveedor: Proveedores) => {
    setProveedorToEdit_Delete(proveedor); // Establecer el proveedor seleccionado
    setModalEditProveedorOpen(true);
  };
  const closeModalEditProveedor = () => {
    setProveedorToEdit_Delete(null); // Establecer el proveedor seleccionado
    setModalEditProveedorOpen(false);
    // Recargar la tabla paginada tras editar un proveedor.
    refetch();
  };

  // Eliminar Proveedor
  const openAlertDeleteProveedor = (proveedor: Proveedores) => {
    setProveedorToEdit_Delete(proveedor); // Establecer el proveedor seleccionado
    setModalDeleteProveedorOpen(true);
  };
  const closeAlertDeleteProveedor = () => {
    setProveedorToEdit_Delete(null); // Establecer el proveedor seleccionado
    setModalDeleteProveedorOpen(false);
    // Recargar la tabla paginada tras eliminar un proveedor.
    refetch();
  };


  // Función para cargar los proveedores y tipos de datos desde la base de datos y Redux
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const resultAction = await dispatch(getProveedores()).unwrap();
        console.log('Proveedores cargados:', resultAction);

        if (resultAction.success) {
          dispatch(setListProveedor(resultAction.proveedores!)); // Establece el proveedor en el estado

        } else {
          console.log('Error', resultAction.message)
        }


      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    cargarProveedores();

    const cargarTiposProveedores = async () => {
      try {
        const resultAction = await dispatch(getTiposProveedores()).unwrap();
        if (resultAction.success) {
          // Aquí puedes manejar los tipos de proveedores obtenidos
          console.log('Tipos de proveedores cargados:', resultAction.tiposProveedores);
        } else {
          console.log('Error al cargar tipos de proveedores:', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar tipos de proveedores:', error);
      }
    };
    cargarTiposProveedores();

    const cargarFormasPago = async () => {
      try {
        const resultAction = await dispatch(getFormasPago()).unwrap();
        if (resultAction.success) {
          // Aquí puedes manejar las formas de pago obtenidas
          console.log('Formas de pago cargadas:', resultAction.formasPago);
        } else {
          console.log('Error al cargar formas de pago:', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar formas de pago:', error);
      }
    };
    cargarFormasPago();

    const cargarTiposRegimen = async () => {
      try {
        const resultAction = await dispatch(getTiposRegimen()).unwrap();
        if (resultAction.success) {
          // Aquí puedes manejar los tipos de regimenes fiscales obtenidos
          console.log('Tipos de regimenes fiscales cargados:', resultAction.regimenesFiscales);
        } else {
          console.log('Error al cargar tipos de regimenes fiscales:', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar tipos de regimenes fiscales:', error);
      }
    };
    cargarTiposRegimen();

    const cargarTiposDescuento = async () => {
      try {
        const resultAction = await dispatch(getTiposDescuento()).unwrap();
        if (resultAction.success) {
          // Aquí puedes manejar los tipos de descuentos obtenidos
          console.log('Tipos de descuentos cargados:', resultAction.descuentosProveedor);
        } else {
          console.log('Error al cargar tipos de descuentos:', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar tipos de descuentos:', error);
      }
    };
    cargarTiposDescuento();

    const cargarTiposFacturacion = async () => {
      try {
        const resultAction = await dispatch(getTiposFacturacion()).unwrap();
        if (resultAction.success) {
          // Aquí puedes manejar los tipos de facturación obtenidos
          console.log('Tipos de facturación cargados:', resultAction.tiposFacturacion);
        } else {
          console.log('Error al cargar tipos de facturación:', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar tipos de facturación:', error);
      }
    };
    cargarTiposFacturacion();

    const cargarTiposMoneda = async () => {
      try {
        const resultAction = await dispatch(getTiposMoneda()).unwrap();
        if (resultAction.success) {
          // Aquí puedes manejar los tipos de moneda obtenidos
          console.log('Tipos de moneda cargados:', resultAction.tiposMoneda);
        } else {
          console.log('Error al cargar tipos de moneda:', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar tipos de moneda:', error);
      }
    };
    cargarTiposMoneda();


  }, []); // Solo se ejecuta una vez al montar el componente




  // Crear nuevos proveedores
  const handleNuevoProveedor = () => {
    openModalAddProveedor();
    console.log(proveedores)
  };

  return (
    <div className='mainDiv_ProveedoresControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Proveedores </h1>
          <p>Mostrando {proveedoresPaginaActual.length} de {totalProveedores} proveedores</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={proveedoresPorPagina} onChange={handleChangeProveedoresPorPagina}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={busqueda}
            onChange={handleSearch}
          />
          <button className='buttonAdd' onClick={handleNuevoProveedor}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Proveedor
          </button>
        </div>

      </div>

      <hr />

      {!loading && proveedoresPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay proveedores registrados </p> <FiAlertTriangle />
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
            className='list_entitiesDiv_proveedores'
            filas={proveedoresPaginaActual}
            columnas={columnas}
            clave={(proveedor) => proveedor.id_proveedor ?? ''}
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

      {isModalAddProveedorOpen && (
        <AddProveedor isOpen={isModalAddProveedorOpen} onClose={closeModalAddProveedor} />
      )}

      {isModalEditProveedorOpen && proveedorToEdit_Delete && (
        <EditProveedor isOpen={isModalEditProveedorOpen} onClose={closeModalEditProveedor} proveedorToEdit={proveedorToEdit_Delete} />
      )}

      {isModalDeleteProveedorOpen && proveedorToEdit_Delete && (
        <DeleteProveedor isOpen={isModalDeleteProveedorOpen} onClose={closeAlertDeleteProveedor} proveedorToDelete={proveedorToEdit_Delete} />
      )}

    </div>
  );
};

export default AlmacenGeneral_ControlProveedor;
