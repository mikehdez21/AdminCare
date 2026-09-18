// Bibliotecas
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

// Tipos de Facturas
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { getTiposFacturas } from '@/store/almacengeneral/TipoFactura/tiposFacturasActions';

// Componentes
import Paginacion from '../../../../00_Utils/Paginacion';
import AddTipoFactura from './AddTipoFactura';
import EditTipoFactura from './EditTipoFactura';
import DeleteTipoFactura from './DeleteTipoFactura';

// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoFactura/tipoFacturasControl.css'




const AlmacenGeneral_ControlTipoFactura: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const [tipoFacturaToEdit_Delete, setTipoFacturaToEdit_Delete] = useState<TiposFacturasAF | null>(null); // tipo factura seleccionado para editar_eliminar

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [tiposFacturasPorPagina, setTiposFacturasPorPagina] = useState<number>(5);

  const [isModalAddTipoFacturaOpen, setModalAddTipoFacturaOpen] = useState(false);
  const [isModalEditTipoFacturaOpen, setModalEditTipoFacturaOpen] = useState(false);
  const [isModalDeleteTipoFacturaOpen, setModalDeleteTipoFacturaOpen] = useState(false);

  // Añadir Tipo Factura
  const openModalAddTipoFactura = () => {
    setModalAddTipoFacturaOpen(true);
  };
  const closeModalAddTipoFactura = () => {
    setModalAddTipoFacturaOpen(false);
  };

  // Editar Tipo Factura
  const openModalEditTipoFactura = (tipoFactura: TiposFacturasAF) => {
    setTipoFacturaToEdit_Delete(tipoFactura); // Establecer el tipo factura seleccionado
    setModalEditTipoFacturaOpen(true);
  };
  const closeModalEditTipoFactura = () => {
    setModalEditTipoFacturaOpen(false);
    setTipoFacturaToEdit_Delete(null); // Establecer el tipo factura seleccionado

  };

  // Eliminar Tipo Factura
  const openAlertDeleteTipoFactura = (tipoFactura: TiposFacturasAF) => {
    setTipoFacturaToEdit_Delete(tipoFactura); // Establecer el tipo factura seleccionado
    setModalDeleteTipoFacturaOpen(true);
  };
  const closeAlertDeleteTipoFactura = () => {
    setModalDeleteTipoFacturaOpen(false);
    setTipoFacturaToEdit_Delete(null); // Establecer el tipo factura seleccionado

  };

  // Función para cargar los Tipos de Facturas desde la base de datos y Redux
  useEffect(() => {
    const cargarTiposFacturas = async () => {
      try {
        await dispatch(getTiposFacturas()).unwrap();
      } catch (error) {
        console.error('Error al cargar tipos de facturas:', error);
        void Swal.fire({ icon: 'error', title: 'Catálogo no disponible', text: 'No se pudo cargar el catálogo de tipos de factura.', confirmButtonText: 'OK' });
      }
    };
    cargarTiposFacturas();
  }, [dispatch]);

  const tiposFacturas = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const tiposFacturasLoading = useSelector((state: RootState) => state.facturasaf.tiposFacturasLoading);
  const tiposFacturasError = useSelector((state: RootState) => state.facturasaf.tiposFacturasError);
  useEffect(() => {
    if (tiposFacturasError) {
      void Swal.fire({ icon: 'error', title: 'Catálogo no disponible', text: tiposFacturasError, confirmButtonText: 'OK' });
    }
  }, [tiposFacturasError]);
  const safeTiposFacturas = Array.isArray(tiposFacturas) ? tiposFacturas : [];
  const totalTiposFacturas = safeTiposFacturas.length;

  // Filtrar y ordenar tipos de facturas basados en la búsqueda
  const tiposFacturasFiltradas = Array.isArray(tiposFacturas)
    ? safeTiposFacturas
      .filter(tipoFactura =>
        (tipoFactura.nombre_tipofactura || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                tipoFactura.id_tipofacturaaf?.toString().includes(busqueda)
      )
      .sort((a, b) => a.id_tipofacturaaf! - b.id_tipofacturaaf!) // Orden ascendente por ID
    : [];

  // Obtener los tipos de facturas para la página actual
  const indexUltimaTipoFactura = paginaActual * tiposFacturasPorPagina;
  const indexPrimeraTipoFactura = indexUltimaTipoFactura - tiposFacturasPorPagina;
  const tiposFacturasPaginaActual = tiposFacturasFiltradas.slice(indexPrimeraTipoFactura, indexUltimaTipoFactura);

  // Manejar cambio de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página al hacer una búsqueda
  };

  // Manejar cambio en el número de tipos de facturas por página
  const handleChangeTiposFacturasPorPagina = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTiposFacturasPorPagina(Number(e.target.value));
    setPaginaActual(1); // Reiniciar a la primera página al cambiar el número de tipos de facturas por página
  };

  // Calcular el número total de páginas
  const numeroTotalPaginas = Math.ceil(tiposFacturasFiltradas.length / tiposFacturasPorPagina);


  return (
    <div className='mainDiv_TipoFacturasControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Tipos de Facturas</h1>
          <p>Mostrando {tiposFacturasPaginaActual.length} de {totalTiposFacturas} tipos de facturas</p>
        </div>

        <div className='buttons_Div'>
          <select className='selectList' value={tiposFacturasPorPagina} onChange={handleChangeTiposFacturasPorPagina}>
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
          <button className='buttonAdd' onClick={openModalAddTipoFactura}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Tipo de Factura
          </button>
        </div>

      </div>

      <hr />

      {tiposFacturasLoading ? (
        <div className='noEntities' role='status'><p>Cargando tipos de facturas...</p></div>
      ) : tiposFacturasError ? (
        <div className='noEntities' role='alert'>
          <FiAlertTriangle /> <p>{tiposFacturasError}</p>
          <button type="button" onClick={() => void dispatch(getTiposFacturas())}>Reintentar</button>
        </div>
      ) : tiposFacturasFiltradas.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>No hay registros disponibles</p> <FiAlertTriangle />
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
                  <th id='th_TipoFacturaID'>ID</th>
                  <th id='th_TipoFactura'>Tipo de Factura</th>
                  <th id='th_Descripcion'>Descripción</th>
                  <th id='th_FechaCreacion'>Fecha Creación</th>
                  <th id='th_FechaModificacion'>Fecha Modificación</th>

                  <th id='th_Acciones'>ACCIONES</th>


                </tr>
              </thead>
              <tbody>
                {tiposFacturasPaginaActual.map(tipoFactura => (
                  <tr key={tipoFactura.id_tipofacturaaf}>
                    <td id='td_TipoFacturaID'>{tipoFactura.id_tipofacturaaf}</td>
                    <td id='td_TipoFactura'>{tipoFactura.nombre_tipofactura}</td>
                    <td id='td_Descripcion'>{tipoFactura.descripcion_tipofactura}</td>
                    <td id='td_FechaCreacion'>{tipoFactura.created_at}</td>
                    <td id='td_FechaModificacion'>{tipoFactura.updated_at}</td>

                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditTipoFactura(tipoFactura)}> <MdEdit /> </button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteTipoFactura(tipoFactura)}><MdDeleteForever /> </button>
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

      {isModalAddTipoFacturaOpen && (
        <AddTipoFactura isOpen={isModalAddTipoFacturaOpen} onClose={closeModalAddTipoFactura} />
      )}

      {isModalEditTipoFacturaOpen && tipoFacturaToEdit_Delete && (
        <EditTipoFactura isOpen={isModalEditTipoFacturaOpen} onClose={closeModalEditTipoFactura} tipoFacturaToEdit={tipoFacturaToEdit_Delete} />
      )}

      {isModalDeleteTipoFacturaOpen && tipoFacturaToEdit_Delete && (
        <DeleteTipoFactura isOpen={isModalDeleteTipoFacturaOpen} onClose={closeAlertDeleteTipoFactura} tipoFacturaToDelete={tipoFacturaToEdit_Delete} />
      )}

    </div>
  )
};

export default AlmacenGeneral_ControlTipoFactura;
