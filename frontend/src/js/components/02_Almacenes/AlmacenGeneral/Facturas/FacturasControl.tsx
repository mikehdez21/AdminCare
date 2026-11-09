// Bibliotecas
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

// Facturas
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';
import { getFacturas } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';

// Proveedores
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';

// Clasificaciones
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer';

// Types
import { getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { getTiposFacturas } from '@/store/almacengeneral/Facturas/facturasActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import TablaEntidades, { type ColumnaTabla } from '@/components/00_Utils/TablaEntidades';
import { usePaginacionServidor } from '@/hooks/usePaginacionServidor';
import AddFactura from './AddFactura';
import EditFactura from './EditFactura';
import ImpresionFactura from '../Etiquetas/ImpresionFactura';
import ResponsivasAF from './ResponsivasAF';
import { formatDateHorasToFrontend, formatDateNacimientoToFrontend } from '@/utils/dateFormat';

// Icons
import { FaArrowCircleRight } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdEdit } from 'react-icons/md';
import { FaFilePdf } from 'react-icons/fa6';


Modal.setAppElement('#root');

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Facturas/facturasControl.css'

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

const AlmacenGeneral_Facturas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);

  const [facturaToEdit_Delete, setFacturaToEdit_Delete] = useState<FacturasAF | null>(null);
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsSeleccionada, setObsSeleccionada] = useState<string>('');


  const tiposFacturas = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);

  const [showAddFacturaForm, setShowAddFacturaForm] = useState<boolean>(false);
  const [showEditFacturaForm, setShowEditFacturaForm] = useState<boolean>(false);
  const [showImpresionFactura, setShowImpresionFactura] = useState<boolean>(false);
  const [showResponsivasAF, setShowResponsivasAF] = useState<boolean>(false);
  const [facturaCreadaId, setFacturaCreadaId] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Paginación servidor: fetcher que llama al thunk de facturas con
  // { page, per_page, search }. La tabla usa el estado local del hook; el
  // store sigue cargando la lista completa en el useEffect de montaje para
  // los flujos que la requieren (AddFactura, EditFactura, Impresion, charts).
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: PaginacionParams): Promise<{ data: FacturasAF[]; meta: PaginacionMeta | null }> => {
      const resultAction = await dispatch(getFacturas(params)).unwrap();
      if (resultAction.success && resultAction.facturas) {
        return { data: resultAction.facturas, meta: resultAction.meta ?? null };
      }
      throw new Error(resultAction.message || 'Error al obtener las facturas');
    },
    [dispatch],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage: facturasPorPagina,
    items: facturasPaginaActual,
    totalItems: totalFacturas,
    numeroTotalPaginas,
    loading,
    refetch,
    handleSearch,
    handleChangePerPage: handleChangeFacturasPorPagina,
    orden,
    alternarOrden,
    filtros,
    cambiarFiltro,
  } = usePaginacionServidor<FacturasAF>({
    fetcher,
    perPageDefault: 5,
  });

  const hayFiltrosActivos = Object.keys(filtros).length > 0;
  const hayBusqueda = busqueda.trim() !== '';

  const columnas: ColumnaTabla<FacturasAF>[] = [
    {
      clave: 'id',
      encabezado: 'ID',
      thId: 'facturas_th_ID',
      tdId: 'facturas_td_ID',
      fija: 'izquierda',
      render: (factura) => factura.id_factura,
      filtro: { tipo: 'texto', placeholder: 'ID' },
    },
    {
      clave: 'proveedor',
      encabezado: 'Proveedor',
      thId: 'facturas_th_ProveedorFactura',
      tdId: 'facturas_td_ProveedorFactura',
      fija: 'izquierda',
      desplazamientoFijo: '80px',
      render: (factura) =>
        proveedores.find((proveedor) => proveedor.id_proveedor === factura.id_proveedor)
          ?.razon_social ?? '',
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          proveedores,
          (proveedor) => proveedor.id_proveedor,
          (proveedor) => proveedor.razon_social,
        ),
      },
    },
    {
      clave: 'num_factura',
      encabezado: 'Número de Factura',
      thId: 'facturas_th_NumFactura',
      tdId: 'facturas_td_NumFactura',
      render: (factura) => factura.num_factura,
      filtro: { tipo: 'texto', placeholder: 'Número' },
    },
    {
      clave: 'fecha_recepcion',
      encabezado: 'Fecha Recepción',
      thId: 'facturas_th_FechaRecepcion',
      tdId: 'facturas_td_FechaRecepcion',
      render: (factura) => formatDateHorasToFrontend(factura.fecha_fac_recepcion),
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'fecha_compra',
      encabezado: 'Fecha Compra',
      thId: 'facturas_th_FechaCompra',
      tdId: 'facturas_td_FechaCompra',
      render: (factura) =>
        factura.fecha_fac_compra
          ? formatDateNacimientoToFrontend(factura.fecha_fac_compra)
          : '—',
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'tipo_factura',
      encabezado: 'Tipo de Factura',
      thId: 'facturas_th_TiposFactura',
      tdId: 'facturas_td_TiposFactura',
      render: (factura) =>
        tiposFacturas.find(
          (tipo) => tipo.id_tipofacturaaf === factura.id_tipo_factura,
        )?.nombre_tipofactura ?? '',
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          tiposFacturas,
          (tipo) => tipo.id_tipofacturaaf,
          (tipo) => tipo.nombre_tipofactura,
        ),
      },
    },
    {
      clave: 'forma_pago',
      encabezado: 'Forma de Pago',
      thId: 'facturas_th_FormaPago',
      tdId: 'facturas_td_FormaPago',
      render: (factura) =>
        formasPago.find((forma) => forma.id_formapago === factura.id_forma_pago)
          ?.descripcion_formaspago ?? '',
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
      clave: 'moneda',
      encabezado: 'Moneda de Pago',
      thId: 'facturas_th_TiposMoneda',
      tdId: 'facturas_td_TiposMoneda',
      render: (factura) =>
        tiposMoneda.find((moneda) => moneda.id_tipomoneda === factura.id_tipo_moneda)
          ?.descripcion_tipomoneda ?? '',
      filtro: {
        tipo: 'seleccion',
        opciones: opcionesCatalogo(
          tiposMoneda,
          (moneda) => moneda.id_tipomoneda,
          (moneda) => moneda.descripcion_tipomoneda,
        ),
      },
    },
    {
      clave: 'observaciones',
      encabezado: 'Observaciones',
      thId: 'facturas_th_ObservacionesFactura',
      tdId: 'facturas_td_ObservacionesFactura',
      render: (factura) => (
        <button
          className='btnObservacion'
          type='button'
          onClick={() => {
            setObsSeleccionada(factura.observaciones_factura || '');
            setShowObsModal(true);
          }}
        >
          {factura.observaciones_factura
            ? factura.observaciones_factura.length > 20
              ? factura.observaciones_factura.slice(0, 20) + '...'
              : factura.observaciones_factura
            : 'Sin observaciones'}
        </button>
      ),
      filtro: { tipo: 'texto', placeholder: 'Observaciones' },
    },
    {
      clave: 'creado',
      encabezado: 'Fecha Creación',
      thId: 'facturas_th_FechaCreacion',
      tdId: 'facturas_td_FechaCreacion',
      render: (factura) => factura.created_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'modificado',
      encabezado: 'Fecha Modificación',
      thId: 'facturas_th_FechaModificacion',
      tdId: 'facturas_td_FechaModificacion',
      render: (factura) => factura.updated_at,
      filtro: { tipo: 'fecha' },
    },
    {
      clave: 'acciones',
      encabezado: 'ACCIONES',
      thId: 'facturas_th_Acciones',
      tdId: 'facturas_td_Acciones',
      fija: 'derecha',
      ordenable: false,
      render: (factura) => (
        <div className='divActions'>
          <button className='button_editEntity' onClick={() => handleEditarFactura(factura)}>
            <MdEdit />
          </button>
          <button
            className='button_pdfResponsivas'
            onClick={() => handleImprimirResponsivas(factura)}
          >
            <FaFilePdf />
          </button>
        </div>
      ),
    },
  ];

  // Añadir Factura - Control de Rutas
  const handleNuevaFactura = () => {
    navigate('/almacen-general/facturas/nueva-factura');
  };


  // Editar Factura - Control de Rutas
  const handleEditarFactura = (factura: FacturasAF) => {
    navigate(`/almacen-general/facturas/editar-factura/${factura.id_factura}`);
    setFacturaToEdit_Delete(factura);
    setShowAddFacturaForm(false);
    setShowEditFacturaForm(true);
  }


  const handleRegresarAfterSubmit = (facturaId?: number) => {
    setShowAddFacturaForm(false);
    setShowEditFacturaForm(false);

    if (facturaId) {
      setFacturaCreadaId(facturaId);
      setShowImpresionFactura(true);
    }
  }

  const handleRegresarFacturas = () => {

    Swal.fire({
      title: '¿Cancelar transacción?',
      text: 'Se perderán todos los cambios no guardados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        setShowAddFacturaForm(false);
        setShowEditFacturaForm(false);
        setShowImpresionFactura(false);
        setShowResponsivasAF(false);
        setFacturaCreadaId(null);
        navigate('/almacen-general/facturas');
      }
    });
  };

  const handleRegresarDesdeImpresion = () => {

    Swal.fire({
      title: '¿Cancelar Impresión?',
      text: 'Es necesario imprimir las etiquetas de activos fijos de la nueva factura.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar e imprimir después',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        setShowImpresionFactura(false);
        setFacturaCreadaId(null);
        navigate('/almacen-general/facturas');
      }
    });


  }

  const handleRegresarDesdeResponsivas = () => {
    setShowResponsivasAF(false);
    setFacturaCreadaId(null);
    navigate('/almacen-general/facturas');
  }

  const handleImpresionCompletadaDesdeFactura = () => {
    setShowImpresionFactura(false);
    setFacturaCreadaId(null);
    setShowAddFacturaForm(false);
    setShowEditFacturaForm(false);
    navigate('/almacen-general/facturas');
  }

  const handleImprimirResponsivas = (factura: FacturasAF) => {
    navigate(`/almacen-general/facturas/impresion-responsivas/${factura.id_factura}`);
    setFacturaToEdit_Delete(factura);
    setShowAddFacturaForm(false);
    setShowEditFacturaForm(false);
    setShowImpresionFactura(false);
    setShowResponsivasAF(true);
  }


  // Recordar la ruta previa para refrescar la tabla paginada al regresar al
  // listado (después de crear/editar/imprimir/ver responsivas).
  const rutaPreviaRef = useRef<string>(location.pathname);

  useEffect(() => {
    const rutaPrevia = rutaPreviaRef.current;
    rutaPreviaRef.current = location.pathname;

    const isNuevaFacturaRoute = location.pathname === '/almacen-general/facturas/nueva-factura';
    setShowAddFacturaForm(isNuevaFacturaRoute);

    if (isNuevaFacturaRoute) {
      setShowEditFacturaForm(false);
      setShowImpresionFactura(false);
    }

    // Al volver al listado desde cualquier otra ruta, recargar la tabla paginada.
    const esListado = location.pathname === '/almacen-general/facturas';
    if (esListado && rutaPrevia !== location.pathname) {
      refetch();
    }
  }, [location.pathname, refetch]);

  useEffect(() => {
    const cargarFacturas = async () => {
      try {
        const resultAction = await dispatch(getFacturas()).unwrap();
        console.log('Facturas cargadas:', facturas);
        if (resultAction.success) {
          dispatch(setFacturas(resultAction.facturas!));
        } else {
          console.log('Error', resultAction.message)
        }

      } catch (error) {
        console.error('Error al cargar las facturas:', error);
      }
    };
    cargarFacturas();

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

    const cargarTiposFacturas = async () => {
      try {
        const resultAction = await dispatch(getTiposFacturas()).unwrap();
        console.log('Tipos de facturas cargados:', resultAction);

        if (resultAction.success) {
          console.log('Tipos de facturas establecidos en el estado:', resultAction.tiposFacturas);
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar tipos de facturas:', error);
      }
    };
    cargarTiposFacturas();

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

    const cargarClasificaciones = async () => {
      try {
        const resultAction = await dispatch(getClasificaciones()).unwrap();

        if (resultAction.success) {
          dispatch(setListClasificacion(resultAction.clasificacion!)); // Establece el clasificacion en el estado
        } else {
          console.log('Error', resultAction.message)
        }


      } catch (error) {
        console.error('Error al cargar clasificaciones:', error);
      }
    };
    cargarClasificaciones();

  }, [dispatch])

  // Vista de listado de facturas
  const renderListaFacturas = () => (
    <div className='mainDiv_FacturasControl'>
      <div className='searchAdd_ButtonDiv'>
        <div className='text_Div'>
          <h1> Facturas </h1>
          <p>Mostrando {facturasPaginaActual.length} de {totalFacturas} facturas</p>
        </div>
        <div className='buttons_Div'>
          <select className='selectList' value={facturasPorPagina} onChange={handleChangeFacturasPorPagina}>
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
          <button className='buttonAdd' onClick={handleNuevaFactura}>
            <FaArrowCircleRight className='iconAdd' /> Nueva Factura
          </button>
        </div>
      </div>

      <hr />

      {!loading && facturasPaginaActual.length === 0 && !hayFiltrosActivos && !hayBusqueda ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>  No hay facturas registradas </p> <FiAlertTriangle />
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
            className='list_entitiesDiv_facturas'
            filas={facturasPaginaActual}
            columnas={columnas}
            clave={(factura) => factura.id_factura ?? ''}
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

    </div>
  );

  // Vista de formulario de agregar factura
  const renderAddFactura = () => (
    <div className='mainDiv_AddFactura'>
      <div className='returnButton'>
        <button className='buttonAdd' onClick={handleRegresarFacturas}>
          <FaArrowCircleRight className='iconAdd' style={
            { transform: 'rotate(180deg)' }
          } /> Facturas
        </button>

        <h2>Agregar Nueva Factura</h2>

      </div>

      <hr />

      {/*Componente AddFactura - Maneja la lógica de agregar una nueva factura*/}
      <div className='addFacturaComponent'>
        <AddFactura onClose={handleRegresarFacturas} onSubmit={handleRegresarAfterSubmit} />
      </div>
    </div>
  );

  // Vista de formulario de editar factura
  const renderEditFactura = () => (
    <div className='mainDiv_EditFactura'>
      <div className='returnButton'>
        <button className='buttonAdd' onClick={handleRegresarFacturas}>
          <FaArrowCircleRight className='iconAdd' style={
            { transform: 'rotate(180deg)' }
          } /> Facturas
        </button>

        <h2>Editar Factura</h2>
      </div>
      <hr />

      {/* Componente EditFactura - Maneja la lógica de editar una factura existente */}
      {facturaToEdit_Delete && (
        <EditFactura onClose={handleRegresarFacturas} facturaToEdit={facturaToEdit_Delete} onSubmit={handleRegresarAfterSubmit} />
      )}
    </div>
  )

  // Vista de impresión de etiquetas al crear una factura
  const renderImpresionFactura = () => (
    <div className='mainDiv_EditFactura'>
      <div className='returnButton'>
        <button className='buttonAdd' onClick={handleRegresarDesdeImpresion}>
          <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Facturas
        </button>

        <h2>Impresión de Etiquetas por Factura</h2>
      </div>

      <hr />

      <div className='mainDiv_EtiquetasControl'>
        <ImpresionFactura
          facturaNuevaID={facturaCreadaId ?? undefined}
          onImpresionExit={handleImpresionCompletadaDesdeFactura}
        />
      </div>

    </div>
  )

  // Vista de impresión de Responsivas AF
  const renderResponsivasAF = () => (
    <div className='mainDiv_EditFactura'>
      <div className='returnButton'>
        <button className='buttonAdd' onClick={handleRegresarDesdeResponsivas}>
          <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Facturas
        </button>

        <h2>Impresión de Responsivas por Factura</h2>
      </div>

      <hr />

      <div className='mainDiv_EtiquetasControl'>
        <ResponsivasAF
          facturaToPDF={facturaToEdit_Delete}
        />
      </div>

    </div>
  )

  // Renderizar según el estado del formulario, ya sea para agregar o listar facturas
  return (
    <div className='mainDiv_FacturasControl'>
      {showAddFacturaForm
        ? renderAddFactura()
        : showEditFacturaForm
          ? renderEditFactura()
          : showImpresionFactura
            ? renderImpresionFactura()
            : showResponsivasAF
              ? renderResponsivasAF()
              : renderListaFacturas()
      }

      <Modal
        isOpen={showObsModal}
        onRequestClose={() => setShowObsModal(false)}
        contentLabel="Observación de Factura"

      >
        <h2>Observaciones de la Factura</h2>
        <div>
          <p>{obsSeleccionada}</p>
        </div>
        <button onClick={() => setShowObsModal(false)}>Cerrar</button>
      </Modal>
    </div>
  );
};

export default AlmacenGeneral_Facturas;
