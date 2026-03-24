import React from 'react';
import { RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


// Types
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Componentes
import ListActivosFijos from './CRUD/ListActivoFijo';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/AFClasificaciones.css'

interface AFClasificacionesProps {
  clasificacionSeleccionadaId: number | null;
  onSelectClasificacion: (id: number | null) => void;
}

const AFClasificaciones: React.FC<AFClasificacionesProps> = ({ clasificacionSeleccionadaId, onSelectClasificacion }) => {
  const navigate = useNavigate();
  const clasificaciones = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);
  

  const handleClasificacionSelected = (clasificacion: ClasificacionesAF) => {
    onSelectClasificacion(clasificacion.id_clasificacion ?? null);
    navigate(`/almacen_general/activos/clasificacion/${clasificacion.id_clasificacion}`);
  
  }

  const renderAFClasificacion = () => (
    <ListActivosFijos
      ClasificacionSeleccionada={clasificacionSeleccionadaId ?? 0}

    />

  )

  const renderListadoClasificaciones = () => (
    <>
      {clasificaciones.length === 0 ? (
        <div className='noClasificaciones'>
          <p>No hay clasificaciones disponibles</p>
        </div>
      ) : (
        <div className='cardsClasificaciones'>
          {clasificaciones.map((clasificacion) => (
            <article
              key={clasificacion.id_clasificacion ?? clasificacion.nombre_clasificacion}
              className='cardClasificacion'
              onClick={() => handleClasificacionSelected(clasificacion)}
            >
              <h3>
                <span className='nombreClasificacion'>{clasificacion.nombre_clasificacion}</span>

              </h3>
              <p>{clasificacion.cuenta_contable}</p>
              <span className={clasificacion.estatus_activo ? 'estado activo' : 'estado inactivo'}>
                {clasificacion.estatus_activo ? 'Activo' : 'Inactivo'}
              </span>

            </article>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className='mainDiv_AFClasificaciones'>
      {clasificacionSeleccionadaId !== null ? renderAFClasificacion() : renderListadoClasificaciones()}
    </div>
  )
}

export default AFClasificaciones;