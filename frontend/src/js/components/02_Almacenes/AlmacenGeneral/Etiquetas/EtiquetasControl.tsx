// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch } from 'react-redux';
import { FaBarcode, FaFileInvoiceDollar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


// Componentes
import ImpresionAF from './ImpresionAF';
import ImpresionFactura from './ImpresionFactura';

// Icons
import { FaArrowCircleRight } from 'react-icons/fa';

// Clasificaciones
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer';

// ActivosFijos
import { getActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { setListActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';

// Facturas
import { getFacturas } from '@/store/almacengeneral/Facturas/facturasActions';
import { setFacturas } from '@/store/almacengeneral/Facturas/facturasReducer';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Etiquetas/etiquetasControl.css';



const AlmacenGeneral_Etiquetas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isOpenImprAF, setOpenImprAF] = useState(false);
  const [isOpenImprFactura, setOpenImprFactura] = useState(false);

  const handleRegresarImpresiones = () => {
    navigate('/almacen_general/etiquetas');
    setOpenImprAF(false);
    setOpenImprFactura(false);
  }

  const handleOpcionImprAF = () => {
    setOpenImprAF(true);
    navigate('/almacen_general/etiquetas/activofijo');
  }

  const handleOpcionImprFactura = () => {
    setOpenImprAF(true);
    navigate('/almacen_general/etiquetas/factura');
  }

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

    const cargarFacturas = async () => {
      try {
        const resultAction = await dispatch(getFacturas()).unwrap();
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

    
  }, [])


  const renderOpcionesImpresion = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenImprAF || isOpenImprFactura ? 
            <button  onClick={handleRegresarImpresiones}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>

        
        
        
        <h1>Impresión de Etiquetas</h1>

      </header>

      <hr />

      <section>
        <div className='divImpr_PorAF' onClick={() => handleOpcionImprAF()}>
          <FaBarcode className='iconImpr' />
          <h2> Impresión por Activo Fijo </h2>
          <p>Seleccionar e imprimir activos específicos</p>
        </div>

        <div className='divImpr_PorFactura' onClick={() => handleOpcionImprFactura()}>
          <FaFileInvoiceDollar className='iconImpr' />
          <h2> Impresión por Factura </h2>
          <p> Imprimir todos los activos de una factura </p>
        </div>

      </section>
    </>
  )

  const renderImprAF = () => (

    <>
      <header>

        <div className='returnButton'>
          {isOpenImprAF || isOpenImprFactura ? 
            <button  onClick={handleRegresarImpresiones}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
        
        <h1>Impresión por Activo Fijo</h1>

      </header>

      <hr />
      <ImpresionAF />

    </>

  )

  const renderImprFactura = () => (
    
    <>
      <header>
        <div className='returnButton'>
          {isOpenImprAF || isOpenImprFactura ? 
            <button  onClick={handleRegresarImpresiones}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null    
          }
        </div>
        <h1>Impresión por Factura</h1>
      </header>

      <hr />
      <ImpresionFactura />

    </>
  )

  
    

  return (

    <div className='mainDiv_EtiquetasControl'>
      
      {isOpenImprAF ? renderImprAF() : 
        isOpenImprFactura ? renderImprFactura() : 
          renderOpcionesImpresion()}
      

    </div>

  )
};

export default AlmacenGeneral_Etiquetas;
