// Bibliotecas
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
import { FaArrowCircleRight } from 'react-icons/fa';
import { FaBoxArchive, FaBoxesStacked } from 'react-icons/fa6';




// Styles
import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/movimientosAFControl.css';
import AlmacenGeneral_MovimientoIndividual from './MovimientoIndividual';
import AlmacenGeneral_MovimientoMasivo from './TraspasoAF';


const AlmacenGeneral_MovimientosAF: React.FC = () => {
  const navigate = useNavigate();

  const [isOpenMovimientoIndividual, setOpenMovimientoIndividual] = useState(false);
  const [isOpenMovimientoMasivo, setOpenMovimientoMasivo] = useState(false);

  const handleRegresarOpcionesMovimientos = () => {
    navigate('/almacen-general/movimientos-activos');
    setOpenMovimientoIndividual(false);
    setOpenMovimientoMasivo(false);

  }

  const handleOpcionMovimientoIndividual = () => {
    navigate('/almacen-general/movimientos-activos/individual');
    setOpenMovimientoIndividual(true);
    setOpenMovimientoMasivo(false);
  }

  const handleOpcionMovimientoMasivo = () => {
    navigate('/almacen-general/movimientos-activos/masivo');
    setOpenMovimientoIndividual(false);
    setOpenMovimientoMasivo(true);
  }

  const renderOpcionesMovimientos = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenMovimientoIndividual || isOpenMovimientoMasivo ?
            <button onClick={handleRegresarOpcionesMovimientos}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null
          }
        </div>

        <h1>Opciones de Movimientos de Activos</h1>


      </header>

      <hr />

      <section>
        <div className='divOption' onClick={() => handleOpcionMovimientoIndividual()}>
          <FaBoxArchive className='iconFiltro' />
          <h2> Movimiento Individual </h2>
          <p>Mover un solo activo (Traspaso, Reubicación, etc.)</p>
        </div>

        <div className='divOption' onClick={() => handleOpcionMovimientoMasivo()}>
          <FaBoxesStacked className='iconFiltro' />
          <h2> Traspaso Masivo de Activos </h2>
          <p>Traspasar todos los activos de un empleado a otro</p>
        </div>

      </section>
    </>

  )

  const renderMovimientoIndividual = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenMovimientoIndividual || isOpenMovimientoMasivo ?
            <button onClick={handleRegresarOpcionesMovimientos}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null
          }
        </div>

        <h1>Movimiento Individual de Activos Fijos</h1>

      </header>

      <hr />

      <div className='mainDiv_MovimientosIndividual'>
        <AlmacenGeneral_MovimientoIndividual />
      </div>

    </>
  );

  const renderMovimientoMasivo = () => (
    <>
      <header>

        <div className='returnButton'>
          {isOpenMovimientoIndividual || isOpenMovimientoMasivo ?
            <button onClick={handleRegresarOpcionesMovimientos}>
              <FaArrowCircleRight className='iconAdd' style={
                { transform: 'rotate(180deg)' }
              } /> Volver
            </button>
            : null
          }
        </div>

        <h1>Traspasar Activos Fijos a Otro Empleado</h1>

      </header>

      <hr />

      <div className='mainDiv_MovimientosMasivo'>
        <AlmacenGeneral_MovimientoMasivo />
      </div>

    </>
  );

  return (
    <div className='mainDiv_MovimientosAF'>
      {isOpenMovimientoIndividual ? renderMovimientoIndividual() :
        isOpenMovimientoMasivo ? renderMovimientoMasivo() :
          renderOpcionesMovimientos()}
    </div>
  );
};

export default AlmacenGeneral_MovimientosAF;