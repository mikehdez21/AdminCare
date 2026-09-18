// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


// Icons
import { FaArrowCircleRight } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';

// Componentes
import ListActivosDepreciacion from '@/components/02_Almacenes/AlmacenGeneral/ActivosFijos/ListActivosDepreciacion';

// Activos Fijos
import { getActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';

// Styles
import '@styles/03_Contabilidad/DepreciacionAF/depreciacionControl.css'

const Main_DepreciacionControl: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const navigate = useNavigate();

  const [isOpenActivosSinDepreciar, setIsOpenActivosSinDepreciar] = useState(false);
  const [isOpenActivosEnDepreciacion, setIsOpenActivosEnDepreciacion] = useState(false);


  // Función para cargar los proveedores y tipos de datos desde la base de datos y Redux
  useEffect(() => {

    const cargarActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getActivosFijos()).unwrap();

        if (resultAction.success) {
          dispatch(setListActivosFijos(resultAction.activosFijos!)); // Establece los activos fijos en el estado

        } else {
          console.log('Error', resultAction.message)
        }


      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    cargarActivosFijos();

    const cargarEstatusActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getEstatusAF()).unwrap();

        if (resultAction.success) {
          dispatch(setListEstatusAF(resultAction.estatusAF!)); // Establece el estatus en el estado

        } else {
          console.log('Error', resultAction.message)
        }

      } catch (error) {
        console.error('Error al cargar estatus de activos fijos:', error);
      }
    };
    cargarEstatusActivosFijos();



  }, []); // Solo se ejecuta una vez al montar el componente


  const handleRegresarOpcionesDepreciacion = () => {
    navigate('/contabilidad/depreciacion-af');
    setIsOpenActivosEnDepreciacion(false);
    setIsOpenActivosSinDepreciar(false);

  }

  const handleOpcionAFenDepreciacion = () => {
    setIsOpenActivosEnDepreciacion(true);
    setIsOpenActivosSinDepreciar(false);

    navigate('/contabilidad/depreciacion-af/activos-en-depreciacion');
  }

  // Renders //

  const renderOpcionesDepreciacion = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenActivosEnDepreciacion || isOpenActivosSinDepreciar ?
            <button onClick={handleRegresarOpcionesDepreciacion}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null
          }
        </div>

        <h1>Depreciación de Activos Fijos</h1>

      </header>

      <hr />

      <section>
        <div className='divOption' onClick={() => handleOpcionAFenDepreciacion()}>
          <MdOutlineFileDownload className='iconFiltro' />
          <h2> Depreciación de AFs </h2>
          <p> Consultar activos que estan siendo depreciados </p>
        </div>


      </section>
    </>

  )

  const renderAFConDepreciacion = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenActivosEnDepreciacion || isOpenActivosSinDepreciar ?
            <button
              onClick={() => {
                handleRegresarOpcionesDepreciacion();
              }}
            >
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null
          }
        </div>

        <h1>Control de Depreciación</h1>

      </header>

      <hr />

      <ListActivosDepreciacion />


    </>
  )



  return (
    <div className='mainDiv_DepreciacionControl'>
      {isOpenActivosEnDepreciacion ? renderAFConDepreciacion() :
            renderOpcionesDepreciacion()}

    </div>

  )
};

export default Main_DepreciacionControl;
