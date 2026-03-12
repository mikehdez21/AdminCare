// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch } from 'react-redux';

// Icons
import {
  FaArrowCircleRight,
  FaBuilding,
  FaMapMarkerAlt,
  FaTags,
  FaTrashAlt
} from 'react-icons/fa';

// Componentes
import AFDepartamentos from './AFDepartamentos';
import AFUbicacion from './AFUbicacion';
import AFClasificaciones from './AFClasificacion';
import ListActivosFijos from './CRUD/ListActivoFijo';

// Activos Fijos
import { getActivosFijos, getEstatusActivosFijos } from '@/store/almacenGeneral/Activos/activosActions';
import { setListActivosFijos, setListEstatusActivosFijos } from '@/store/almacenGeneral/Activos/activosReducer';

// Clasificaciones
import { getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacenGeneral/Clasificaciones/clasificacionesReducer';

// Ubicaciones
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';

// Empleados
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';

// Departamentos
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/activosFijosControl.css'



const AlmacenGeneral_ActivosFijos: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí

  const [isOpenAFDepartamentos, setOpenAFDepartamentos] = useState(false);
  const [isOpenAFUbicacion, setOpenAFUbicacion] = useState(false);
  const [isOpenAFClasificacion, setOpenAFClasificacion] = useState(false);
  const [isOpenAFDeBaja, setOpenAFDeBaja] = useState(false);
  const [isOpenTodosAF, setOpenTodosAF] = useState(false);

  const [departamentoSeleccionadoId, setDepartamentoSeleccionadoId] = useState<number | null>(null);
  const [ubicacionSeleccionadaId, setUbicacionSeleccionadaId] = useState<number | null>(null);
  const [clasificacionSeleccionadaId, setClasificacionSeleccionadaId] = useState<number | null>(null);

  // Función para cargar los proveedores y tipos de datos desde la base de datos y Redux
  useEffect(() => {

    const cargarActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getActivosFijos()).unwrap();
  
        if(resultAction.success){
          dispatch(setListActivosFijos(resultAction.activosFijos!)); // Establece los activos fijos en el estado
  
        } else{
          console.log('Error', resultAction.message)
        }
  
  
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    cargarActivosFijos();

    const cargarEstatusActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getEstatusActivosFijos()).unwrap();
        
        if(resultAction.success){
          dispatch(setListEstatusActivosFijos(resultAction.estatusAF!)); // Establece el estatus en el estado
    
        } else{
          console.log('Error', resultAction.message)
        }
    
      } catch (error) {
        console.error('Error al cargar estatus de activos fijos:', error);
      }
    };
    cargarEstatusActivosFijos();

    const cargarClasificaciones = async () => {
      try {
        const resultAction = await dispatch(getClasificaciones()).unwrap();
    
        if(resultAction.success){
          dispatch(setListClasificacion(resultAction.clasificacion!)); // Establece el clasificacion en el estado
    
        } else{
          console.log('Error', resultAction.message)
        }
    
    
      } catch (error) {
        console.error('Error al cargar clasificaciones:', error);
      }
    };
    cargarClasificaciones();

    const cargarUbicaciones = async () => {
      try {
        const resultAction = await dispatch(getUbicaciones()).unwrap();

    
        if(resultAction.success){
          dispatch(setListUbicaciones(resultAction.ubicaciones!)); // Establece las ubicaciones en el estado
    
        } else{
          console.log('Error', resultAction.message)
        }

      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
      }
    };
    cargarUbicaciones();

    const cargarEmpleados = async () => {
      try {
        const resultAction = await dispatch(getEmpleados()).unwrap();
    
        if(resultAction.success){
          dispatch(setListEmpleados(resultAction.empleados!)); // Establece los empleados en el estado
        } else{
          console.log('Error', resultAction.message)
        }
        
      }
      catch (error) {
        console.error('Error al cargar empleados:', error);
      }
    }
    cargarEmpleados();

    const cargarDepartamentos = async () => {
      try {
        const resultAction = await dispatch(getDepartamentos()).unwrap();

        if(resultAction.success){
          dispatch(setListDepartamentos(resultAction.departamentos!)); // Establece los departamentos en el estado

        } else{
          console.log('Error', resultAction.message)
        }

      } catch (error) {
        console.error('Error al cargar departamentos:', error);
      }
    };
    cargarDepartamentos();
  
  }, []); // Solo se ejecuta una vez al montar el componente


  const handleRegresarFiltrosAF = () => {
    setOpenAFDepartamentos(false);
    setOpenAFUbicacion(false);
    setOpenAFClasificacion(false);
    setOpenAFDeBaja(false);
    setOpenTodosAF(false);

    setDepartamentoSeleccionadoId(null);

  }


  // Renders //

  const renderOpcionesFiltrosAF = () => (
    <>
      <header>
  
        <div className='returnButton'>
          {isOpenAFDepartamentos || isOpenAFUbicacion || isOpenAFClasificacion || isOpenAFDeBaja ? 
            <button  onClick={handleRegresarFiltrosAF}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
          
        <h1>Filtros de Activos Fijos</h1> 

        <small 
          className='verTodosAF'
        > 
          <p onClick={() => setOpenTodosAF(true)}>Ver todos los activos</p> 
        </small>
  
      </header>
  
      <hr />
  
      <section>
        <div className='divAFDepartamento' onClick={() => setOpenAFDepartamentos(true)}>
          <FaBuilding className='iconFiltro' />
          <h2> AF por Departamento </h2>
          <p>Consultar activos por departamento específico</p>
        </div>

        <div className='divAFUbicacion' onClick={() => setOpenAFUbicacion(true)}>
          <FaMapMarkerAlt className='iconFiltro' />
          <h2> AF por Ubicación </h2>
          <p>Consultar activos por ubicación específica</p>
  
        </div>

        <div className='divAFClasificacion' onClick={() => setOpenAFClasificacion(true)}>
          <FaTags className='iconFiltro' />
          <h2> AF por Clasificación </h2>
          <p>Consultar activos por clasificación específica</p>
        </div>
  
        <div className='divAFBajas' onClick={() => setOpenAFDeBaja(true)}>
          <FaTrashAlt className='iconFiltro' />
          <h2> Activos Dados de Baja </h2>
          <p>Consultar activos marcados como dados de baja</p>
        </div>
      </section>
    </>
  
  )

  const renderAFDepartamentos = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenAFClasificacion || isOpenAFDeBaja || isOpenAFUbicacion || isOpenAFDepartamentos ? 
            <button
              onClick={() => {
                // Si está en lista de activos por depto => regresa a cards de deptos
                if (departamentoSeleccionadoId !== null) {
                  setDepartamentoSeleccionadoId(null);
                  return;
                }
                // Si está en cards de deptos => regresa al principal
                handleRegresarFiltrosAF();
              }}
            >
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
        
        <h1>Activos Fijos por Departamento</h1>

      </header>

      <hr />


      <AFDepartamentos 
        departamentoSeleccionadoId={departamentoSeleccionadoId}
        onSelectDepartamento={setDepartamentoSeleccionadoId}
      />
      
      
    </>
  )

  const renderAFUbicacion = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenAFClasificacion || isOpenAFDeBaja || isOpenAFUbicacion || isOpenAFDepartamentos ? 
            <button onClick={() => {
              // Si está en lista de activos por ubicacion => regresa a cards de ubicaciones
              if (ubicacionSeleccionadaId !== null) {
                setUbicacionSeleccionadaId(null);
                return;
              }
              // Si está en cards de ubicaciones => regresa al principal
              handleRegresarFiltrosAF();
            }}
            >
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null      
          }
        </div>
        
        <h1>Activos Fijos por Ubicación</h1>

      </header>

      <hr />
      <AFUbicacion 
        ubicacionSeleccionadaId={ubicacionSeleccionadaId}
        onSelectUbicacion={setUbicacionSeleccionadaId}
      />

    </>
  )

  const renderAFClasificacion = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenAFClasificacion || isOpenAFDeBaja || isOpenAFUbicacion || isOpenAFDepartamentos ? 
            <button  onClick={() => {
              // Si está en lista de activos por clasificacion => regresa a cards de clasificaciones
              if (clasificacionSeleccionadaId !== null) {
                setClasificacionSeleccionadaId(null);
                return;
              }
              // Si está en cards de clasificaciones => regresa al principal
              handleRegresarFiltrosAF();
            }}
            >
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
        
        <h1>Activos Fijos por Clasificación</h1>

      </header>

      <hr />
      <AFClasificaciones 
        clasificacionSeleccionadaId={clasificacionSeleccionadaId}
        onSelectClasificacion={setClasificacionSeleccionadaId}
      />

    </>
  )

  const renderAFBajas = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenAFClasificacion || isOpenAFDeBaja || isOpenAFUbicacion || isOpenAFDepartamentos ? 
            <button  onClick={handleRegresarFiltrosAF}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
        
        <h1>Activos Fijos Dados de Baja</h1>

      </header>

      <hr />

      <div className='mainDiv_AF'>

        <ListActivosFijos ActivosBajas={true} />
      </div>

    </>
  )

  const renderTodosAF = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenAFClasificacion || isOpenAFDeBaja || isOpenAFUbicacion || isOpenAFDepartamentos || isOpenTodosAF ? 
            <button  onClick={handleRegresarFiltrosAF}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
        
        <h1>Todos los Activos Fijos</h1>

      </header>

      <hr />
      
      <div className='mainDiv_AF'>
        <ListActivosFijos DepartamentoSeleccionado={0} UbicacionSeleccionada={0} ClasificacionSeleccionada={0} />
      </div>

    </>
  )



  
  return (
    <div className='mainDiv_ActivosControl'>
      
      {isOpenAFDepartamentos ? renderAFDepartamentos() : 
        isOpenAFUbicacion ? renderAFUbicacion() : 
          isOpenAFClasificacion ? renderAFClasificacion() : 
            isOpenAFDeBaja ? renderAFBajas() :
              isOpenTodosAF ? renderTodosAF() :
                renderOpcionesFiltrosAF()}
 
    </div>

  )
};

export default AlmacenGeneral_ActivosFijos;
