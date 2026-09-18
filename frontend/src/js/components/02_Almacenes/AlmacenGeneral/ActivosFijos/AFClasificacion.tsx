import React, { useState } from 'react';
import { RootState } from '@/store/store';
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

  const [busqueda, setBusqueda] = useState('');

  const handleClasificacionSelected = (clasificacion: ClasificacionesAF) => {
    onSelectClasificacion(clasificacion.id_clasificacion ?? null);
    navigate(`/almacen-general/activos/clasificacion/${clasificacion.id_clasificacion}`);
  }

  const renderAFClasificacion = () => (
    <ListActivosFijos
      ClasificacionSeleccionada={clasificacionSeleccionadaId ?? 0}
    />
  )

  const clasificacionesFiltradas = React.useMemo(() => {
    const ordenadas = [...clasificaciones].sort((a, b) => a.nombre_clasificacion.localeCompare(b.nombre_clasificacion));
    if (!busqueda.trim()) return ordenadas;
    const termino = busqueda.toLowerCase();
    return ordenadas.filter(c => c.nombre_clasificacion.toLowerCase().includes(termino));
  }, [clasificaciones, busqueda]);

  const renderListadoClasificaciones = () => (
    <>
      {clasificaciones.length === 0 ? (
        <div className='noClasificaciones'>
          <p>No hay clasificaciones disponibles</p>
        </div>
      ) : (
        <>
          <div className='searchField'>
            <input
              type='text'
              placeholder='Buscar clasificación...'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className='inputSearch'
            />
          </div>
          <div className='cardsClasificaciones'>
            {clasificacionesFiltradas.map((clasificacion) => (
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
        </>
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