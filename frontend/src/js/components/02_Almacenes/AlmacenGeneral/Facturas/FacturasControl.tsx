// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

// Facturas
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { getFacturas } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';

// Proveedores
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';

// Clasificaciones
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer';

// Types
import { getFormasPago, getTiposMoneda } from '@/store/shared/fiscalActions';
import { getTiposFacturas } from '@/store/almacengeneral/Facturas/facturasActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddFactura from './AddFactura';
import EditFactura from './EditFactura';
import ImpresionFactura from '../Etiquetas/ImpresionFactura';
import ResponsivasAF from './ResponsivasAF';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
// import DeleteFactura from './DeleteFactura';

// Icons
import { FaArrowCircleRight } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdEdit } from 'react-icons/md';
import { FaFilePdf } from "react-icons/fa6";


Modal.setAppElement('#root');

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Facturas/facturasControl.css'


const AlmacenGeneral_Facturas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);

  const totalFacturas = facturas.length;
  const [facturaToEdit_Delete, setFacturaToEdit_Delete] = useState<FacturasAF | null>(null);
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsSeleccionada, setObsSeleccionada] = useState<string>('');


  const tiposFacturas = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [facturasPorPagina, setFacturasPorPagina] = useState<number>(5);

  const [showAddFacturaForm, setShowAddFacturaForm] = useState<boolean>(false);
  const [showEditFacturaForm, setShowEditFacturaForm] = useState<boolean>(false);
  const [showImpresionFactura, setShowImpresionFactura] = useState<boolean>(false);
  const [showResponsivasAF, setShowResponsivasAF] = useState<boolean>(false);
  const [facturaCreadaId, setFacturaCreadaId] = useState<number | null>(null);
  /*const [isModalDeleteFacturaOpen, setModalDeleteFacturaOpen] = useState<boolean>(false);*/


  // Filtrar y ordenar facturas basados en la búsqueda (memorizado)
  const facturasFiltradas = React.useMemo(() => {
    if (!Array.isArray(facturas)) return [];
    return facturas
      .filter(factura =>
        factura.id_factura?.toString().includes(busqueda)
      )
      .sort((a, b) => a.id_factura! - b.id_factura!);
  }, [facturas, busqueda]);

  // Obtener las facturas para la página actual (memorizado)
  const facturasPaginaActual = React.useMemo(() => {
    const indexUltimaFactura = paginaActual * facturasPorPagina;
    const indexPrimerFactura = indexUltimaFactura - facturasPorPagina;
    return facturasFiltradas.slice(indexPrimerFactura, indexUltimaFactura);
  }, [facturasFiltradas, paginaActual, facturasPorPagina]);

  // Calcular el número total de páginas
  const numeroTotalPaginas = React.useMemo(() => Math.ceil(facturasFiltradas.length / facturasPorPagina), [facturasFiltradas.length, facturasPorPagina]);

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Manejar cambio en el número de facturas por página
  const handleChangeFacturasPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFacturasPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  // Añadir Factura - Control de Rutas
  const handleNuevaFactura = () => {
    navigate('/almacen_general/facturas/nuevaFactura');
  };

  // Editar Factura - Control de Rutas
  const handleEditarFactura = (factura: FacturasAF) => {
    navigate(`/almacen_general/facturas/editarFactura/${factura.id_factura}`);
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
        navigate('/almacen_general/facturas');
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
        navigate('/almacen_general/facturas');
      }
    });


  }

  const handleRegresarDesdeResponsivas = () => {
    setShowResponsivasAF(false);
    setFacturaCreadaId(null);
    navigate('/almacen_general/facturas');
  }

  const handleImpresionCompletadaDesdeFactura = () => {
    setShowImpresionFactura(false);
    setFacturaCreadaId(null);
    setShowAddFacturaForm(false);
    setShowEditFacturaForm(false);
    navigate('/almacen_general/facturas');
  }

  const handleImprimirResponsivas = (factura: FacturasAF) => {
    navigate(`/almacen_general/facturas/impresionResponsivas/${factura.id_factura}`);
    setFacturaToEdit_Delete(factura);
    setShowAddFacturaForm(false);
    setShowEditFacturaForm(false);
    setShowImpresionFactura(false);
    setShowResponsivasAF(true);
  }


  /*
  // Eliminar Factura
  const openAlertDeleteFactura = (factura: FacturasAF) => {
    setFacturaToEdit_Delete(factura);
    setModalDeleteFacturaOpen(true);
  };
  const closeAlertDeleteFactura = () => {
    setFacturaToEdit_Delete(null);
    setModalDeleteFacturaOpen(false);
  };
  */

  useEffect(() => {
    const isNuevaFacturaRoute = location.pathname === '/almacen_general/facturas/nuevaFactura';
    setShowAddFacturaForm(isNuevaFacturaRoute);

    if (isNuevaFacturaRoute) {
      setShowEditFacturaForm(false);
      setShowImpresionFactura(false);
    }
  }, [location.pathname]);

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
          dispatch(setListProveedor(resultAction.proveedor!)); // Establece el proveedor en el estado

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

      {facturasFiltradas && facturasFiltradas.length === 0 ? (
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

          <div className='list_entitiesDiv'>
            <table>
              <thead>
                <tr>
                  <th id='th_ID'>ID</th>
                  <th id='th_ProveedorFactura'>Proveedor</th>
                  <th id='th_NumFactura'>Número de Factura</th>
                  <th id='th_FechaRecepcion'>Fecha Recepción</th>
                  <th id='th_TiposFactura'>Tipo de Factura</th>
                  <th id='th_FormaPago'>Forma de Pago</th>
                  <th id='th_TiposMoneda'>Moneda de Pago</th>
                  <th id='th_ObservacionesFactura'>Observaciones</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {facturasPaginaActual.map(factura => (
                  <tr key={factura.id_factura}>
                    <td id='td_ID'>{factura.id_factura}</td>

                    <td id='td_ProveedorFactura'>
                      {(() => {
                        const proveedor = proveedores.find(p => p.id_proveedor === factura.id_proveedor);
                        return proveedor ? proveedor.razon_social : '';
                      })()}
                    </td>

                    <td id='td_NumFactura'>{factura.num_factura}</td>
                    <td id='td_FechaRecepcion'>{formatDateHorasToFrontend(factura.fecha_fac_recepcion)}</td>

                    <td id='td_TiposFactura'>
                      {(() => {
                        const tipoFactura = tiposFacturas.find(t => t.id_tipofacturaaf === factura.id_tipo_factura);
                        return tipoFactura ? tipoFactura.nombre_tipofactura : '';
                      })()}
                    </td>

                    <td id='td_FormaPago'>
                      {(() => {
                        const formaPago = formasPago.find(f => f.id_formapago === factura.id_forma_pago);
                        return formaPago ? formaPago.descripcion_formaspago : '';
                      })()}
                    </td>

                    <td id='td_TiposMoneda'>
                      {(() => {
                        const tipoMoneda = tiposMoneda.find(m => m.id_tipomoneda === factura.id_tipo_moneda);
                        return tipoMoneda ? tipoMoneda.descripcion_tipomoneda : '';
                      })()}
                    </td>

                    <td id='td_ObservacionesFactura' onClick={() => {
                      setObsSeleccionada(factura.observaciones_factura || '');
                      setShowObsModal(true);
                    }}>
                      <button
                        className="btnObservacion"
                        type='button'

                      >
                        {factura.observaciones_factura
                          ? factura.observaciones_factura.length > 20
                            ? factura.observaciones_factura.slice(0, 20) + '...'
                            : factura.observaciones_factura
                          : 'Sin observaciones'}
                      </button>
                    </td>
                    <td id='td_FechaCreacion'>{factura.created_at}</td>
                    <td id='td_FechaModificacion'> {factura.updated_at} </td>
                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => handleEditarFactura(factura)}> <MdEdit /> </button>
                        <button className='button_pdfResponsivas' onClick={() => handleImprimirResponsivas(factura)}> <FaFilePdf /> </button>
                        {/*<button className='button_deleteEntity' disabled onClick={() => openAlertDeleteFactura(factura)}><MdDeleteForever/> </button>*/}
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

      {/* Modal solo para eliminar 
      {isModalDeleteFacturaOpen && (
        <DeleteFactura isOpen={isModalDeleteFacturaOpen} onClose={closeAlertDeleteFactura} facturaToDelete={facturaToEdit_Delete}/>
      )}
      */}

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
