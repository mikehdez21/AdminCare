// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Proveedores
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';

// Almacen General Tipos
import { getTiposProveedores, getTiposDescuento, } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { getFormasPago, getTiposRegimen, getTiposMoneda, getTiposFacturacion } from '@/store/shared/fiscalActions';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import AddProveedor from './AddProveedor';
import EditProveedor from './EditProveedor';
import DeleteProveedor from './DeleteProveedor';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Proveedores/proveedoresControl.css';




const AlmacenGeneral_ControlProveedor: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const totalProveedores = proveedores.length;
  const [proveedorToEdit_Delete, setProveedorToEdit_Delete] = useState<Proveedores | null>(null); // Proveedor seleccionado para editar_eliminar

  const tiposProveedores = useSelector((state: RootState) => state.proveedor.tiposProveedores);
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);
  const regimenesFiscales = useSelector((state: RootState) => state.fiscal.regimenesFiscales);
  const descuentosProveedor = useSelector((state: RootState) => state.proveedor.descuentosProveedor);
  const tiposFacturacion = useSelector((state: RootState) => state.fiscal.tiposFacturacion);
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [proveedoresPorPagina, setProveedoresPorPagina] = useState<number>(5);

  const [isModalAddProveedorOpen, setModalAddProveedorOpen] = useState(false);
  const [isModalEditProveedorOpen, setModalEditProveedorOpen] = useState(false);
  const [isModalDeleteProveedorOpen, setModalDeleteProveedorOpen] = useState(false);


  // Añadir Proveedor
  const openModalAddProveedor = () => {
    setModalAddProveedorOpen(true);
  };
  const closeModalAddProveedor = () => {
    setModalAddProveedorOpen(false);
  };

  // Editar Proveedor
  const openModalEditProveedor = (proveedor: Proveedores) => {
    setProveedorToEdit_Delete(proveedor); // Establecer el proveedor seleccionado
    setModalEditProveedorOpen(true);
  };
  const closeModalEditProveedor = () => {
    setProveedorToEdit_Delete(null); // Establecer el proveedor seleccionado
    setModalEditProveedorOpen(false);

  };

  // Eliminar Proveedor
  const openAlertDeleteProveedor = (proveedor: Proveedores) => {
    setProveedorToEdit_Delete(proveedor); // Establecer el proveedor seleccionado
    setModalDeleteProveedorOpen(true);
  };
  const closeAlertDeleteProveedor = () => {
    setProveedorToEdit_Delete(null); // Establecer el proveedor seleccionado
    setModalDeleteProveedorOpen(false);

  };


  // Función para cargar los proveedores y tipos de datos desde la base de datos y Redux
  useEffect(() => {
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




  // Filtrar y ordenar proveedores basados en la búsqueda
  const proveedoresFiltrados = Array.isArray(proveedores)
    ? proveedores
      .filter(proveedor =>
        proveedor.nombre_proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
        proveedor.id_proveedor?.toString().includes(busqueda)
      )
      .sort((a, b) => a.id_proveedor! - b.id_proveedor!) // Orden ascendente por ID
    : [];

  // Obtener los proveedores para la página actual
  const indexUltimoProveedor = paginaActual * proveedoresPorPagina;
  const indexPrimerProveedor = indexUltimoProveedor - proveedoresPorPagina;
  const proveedoresPaginaActual = proveedoresFiltrados.slice(indexPrimerProveedor, indexUltimoProveedor);

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina);

  // Crear nuevos proveedores
  const handleNuevoProveedor = () => {
    openModalAddProveedor();
    console.log(proveedores)
  };

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de proveedores por página
  const handleChangeProveedoresPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProveedoresPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de proveedores por página
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

      {proveedoresFiltrados && proveedoresFiltrados.length === 0 ? (
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

          <div className='list_entitiesDiv'>
            <table>
              <thead>
                <tr>
                  <th id='th_ID'>ID</th>
                  <th id='th_Proveedor_Empresa'>Empresa/Proveedor</th>
                  <th id='th_RazonSocial'>Razón Social</th>
                  <th id='th_EmailProveedor'>Email</th>
                  <th id='th_Telefono'>Teléfono</th>
                  <th id='th_Proveedor_SitioWeb'>Sitio Web</th>
                  <th id='th_Proveedor_RFC'>RFC</th>
                  <th id='th_EstatusActivo'>Estatus</th>
                  <th id='th_tipoMoneda'>Moneda</th>
                  <th id='th_tipoProveedor'>Tipo Proveedor</th>
                  <th id='th_formaPago'>Forma de Pago</th>
                  <th id='th_tipoRegimen'>Régimen Fiscal</th>
                  <th id='th_tipoDescuento'>Tipo Descuento</th>
                  <th id='th_tipoFacturacion'>Tipo Facturación</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>
                  <th id='th_Acciones'>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresPaginaActual.map(proveedor => (
                  <tr key={proveedor.id_proveedor}>
                    <td id='td_ID'>{proveedor.id_proveedor}</td>
                    <td id='td_Proveedor_Empresa'>{proveedor.nombre_proveedor}</td>
                    <td id='td_RazonSocial'><p>{proveedor.razon_social}</p></td>
                    <td id='td_Email'>{proveedor.email_proveedor}</td>
                    <td id='td_Telefono'>{proveedor.telefono_proveedor}</td>
                    <td id='td_Proveedor_SitioWeb'>
                      {proveedor.sitioWeb ? (
                        <a href={`https://${proveedor.sitioWeb}`} target="_blank" rel="noopener noreferrer">
                          {proveedor.sitioWeb}
                        </a>
                      ) : 'No disponible'}
                    </td>
                    <td id='td_Proveedor_RFC'>{proveedor.rfc}</td>

                    <td id='td_EstatusActivo' className={proveedor.estatus_activo ? 'status-activo' : 'status-inactivo'}> {proveedor.estatus_activo ? 'Activo' : 'Inactivo'}</td>


                    <td id='td_tipoMoneda'>{tiposMoneda.map((tipoMoneda) => (
                      <div key={tipoMoneda.id_tipomoneda} className='divTipoMoneda'>
                        {proveedor.id_tipo_moneda === tipoMoneda.id_tipomoneda ? tipoMoneda.descripcion_tipomoneda : ''}
                      </div>
                    ))}</td>


                    <td id='td_tipoProveedor'>{tiposProveedores.map((tipoProveedor) => (
                      <div key={tipoProveedor.id_tipoproveedor} className='divTipoProveedor'>
                        {proveedor.id_tipo_proveedor === tipoProveedor.id_tipoproveedor ? tipoProveedor.descripcion_tipoproveedor : ''}
                      </div>
                    ))}</td>

                    <td id='td_formaPago'>{formasPago.map((formaPago) => (
                      <div key={formaPago.id_formapago} className='divTipoFormaPago'>
                        {proveedor.id_forma_pago === formaPago.id_formapago ? formaPago.descripcion_formaspago : ''}
                      </div>
                    ))}</td>

                    <td id='td_tipoRegimen'>{regimenesFiscales.map((regimenFiscal) => (
                      <div key={regimenFiscal.id_regimenfiscal} className='divTipoRegimen'>
                        {proveedor.id_tipo_regimen === regimenFiscal.id_regimenfiscal ? regimenFiscal.descripcion_regimenfiscal : ''}
                      </div>
                    ))}</td>

                    <td id='td_tipoDescuento'>{descuentosProveedor.map((descuentoProveedor) => (
                      <div key={descuentoProveedor.id_descuento_proveedor} className='divTipoDescuento'>
                        {proveedor.id_tipo_descuento === descuentoProveedor.id_descuento_proveedor ? descuentoProveedor.descripcion_descuentoproveedor : ''}
                      </div>
                    ))}</td>

                    <td id='td_tipoFacturacion'>{tiposFacturacion.map((tipoFacturacion) => (
                      <div key={tipoFacturacion.id_tipofacturacion} className='divTipoFacturacion'>
                        {proveedor.id_tipo_facturacion === tipoFacturacion.id_tipofacturacion ? tipoFacturacion.descripcion_tipofacturacion : ''}
                      </div>
                    ))}</td>

                    <td id='td_FechaCreacion'>{proveedor.created_at}</td>


                    <td id='td_FechaModificacion'> {proveedor.updated_at} </td>


                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditProveedor(proveedor)}> <MdEdit /> </button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteProveedor(proveedor)}><MdDeleteForever /> </button>
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
