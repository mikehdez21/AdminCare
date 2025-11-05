// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';


// Activos Fijos
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import { getActivosFijos } from '@/store/almacenGeneral/Activos/activosActions';
import { setActivosFijos } from '@/store/almacenGeneral/Activos/activosReducer';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';


// Icons
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdEdit, MdDeleteForever  } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/activosFijosControl.css'



const AlmacenGeneral_ActivosFijos: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const activosfijos = useSelector((state: RootState) => state.activos.activosfijos);
  const totalActivosFijos = activosfijos.length;
  const [activoFijoToEdit_Delete, setActivoFijoToEdit_Delete] = useState<ActivosFijos | null>(null);

  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [activosFijosPorPagina, setActivosFijosPorPagina] = useState<number>(5); 

  const [isModalAddActivoFijoOpen, setModalAddActivoFijoOpen] = useState(false);
  const [isModalEditActivoFijoOpen, setModalEditActivoFijoOpen] = useState(false);
  const [isModalDeleteActivoFijoOpen, setModalDeleteActivoFijoOpen] = useState(false);


  // Filtrar y ordenar activos fijos basados en la búsqueda
  const activosFijosFiltrados = Array.isArray(activosfijos) 
    ? activosfijos
      .filter(activo =>
        activo.descripcion_af.toLowerCase().includes(busqueda.toLowerCase()) ||
        activo.id_activo_fijo?.toString().includes(busqueda)
      )
      .sort((a, b) => a.id_activo_fijo! - b.id_activo_fijo!) // Orden ascendente por ID
    : [];

  // Obtener los activos para la página actual
  const indexUltimoActivoFijo = paginaActual * activosFijosPorPagina;
  const indexPrimeraClasificacion = indexUltimoActivoFijo - activosFijosPorPagina;
  const activosFijosPaginaActual = activosFijosFiltrados.slice(indexPrimeraClasificacion, indexUltimoActivoFijo);

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
  
  // Eliminar ActivoFijo
  const openAlertDeleteActivoFijo = (activo: ActivosFijos) => {
    setActivoFijoToEdit_Delete(activo); // Establecer el activo fijo seleccionado
    setModalDeleteActivoFijoOpen(true);
  };
  const closeAlertDeleteActivoFijo = () => {
    setActivoFijoToEdit_Delete(null); // Establecer el activo fijo seleccionado
    setModalDeleteActivoFijoOpen(false);
  
  };

  // Función para cargar los proveedores y tipos de datos desde la base de datos y Redux
  useEffect(() => {
    const cargarActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getActivosFijos()).unwrap();
        console.log('Proveedores cargados:', resultAction);
  
        if(resultAction.success){
          dispatch(setActivosFijos(resultAction.activos!)); // Establece los activos fijos en el estado
  
        } else{
          console.log('Error', resultAction.message)
        }
  
  
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    cargarActivosFijos();
  
  }, []); // Solo se ejecuta una vez al montar el componente

  return (
    <div className='mainDiv_ActivosControl'>
      <div className='searchAdd_ButtonDiv'>

        <div className='text_Div'>
          <h1>Activos Fijos</h1>
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
            placeholder="Buscar por nombre o ID"
            value={busqueda}
            onChange={handleSearch}
          />
          
          <button className='buttonAdd' onClick={openModalAddActivoFijo}>
            <IoAddCircleOutline className='iconAdd' /> Nuevo Activo Fijo
          </button>
        </div>

      </div>

      <hr />

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
                  <th id='th_NombreAF'>Nombre ActivoFijo</th>
                  <th id='th_Descripcion'>Descripción</th>
                  <th id='th_IDClasificacion'>Clasificación</th>
                  <th id='th_FechaAdquisicion'>Fecha Adquisición</th>
                  <th id='th_CostoAdquisicion'>Costo Adquisición</th>
                  <th id='th_VidaUtil'>Vida Util</th>
                  <th id='th_ValorResidual'>Valor Residual</th>
                  <th id='th_EstadoAF'>Estado del Activo</th>
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
                    <td id='td_NombreAF'>{activoFijo.nombre_af}</td>
                    <td id='td_Descripcion'>{activoFijo.descripcion_af}</td>
                    <td id='td_IDClasificacion'>{activoFijo.id_clasificacion}</td>
                    <td id='td_FechaAdquisicion'>{activoFijo.fecha_adquisicion_af}</td>
                    <td id='td_CostoAdquisicion'>{activoFijo.costo_adquisicion_af}</td>
                    <td id='td_VidaUtil'>{activoFijo.vida_util_meses}</td>
                    <td id='td_ValorResidual'>{activoFijo.valor_residual}</td>
                    <td id='td_EstadoAF'>{activoFijo.id_estado_af}</td>
                    <td id='td_FechaCreacion'>{activoFijo.created_at}</td>
                    <td id='td_FechaModificacion'>{activoFijo.updated_at}</td>
          
                    <td id='td_Acciones'>
                      <div className='divActions'>
                        <button className='button_editEntity' onClick={() => openModalEditActivoFijo(activoFijo)}> <MdEdit/> </button>
                        <button className='button_deleteEntity' onClick={() => openAlertDeleteActivoFijo(activoFijo)}><MdDeleteForever/> </button>
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

 
    </div>

  )
};

export default AlmacenGeneral_ActivosFijos;
