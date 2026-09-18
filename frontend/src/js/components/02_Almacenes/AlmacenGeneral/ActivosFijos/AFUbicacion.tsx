import React, { useState } from 'react';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Types
import { Ubicaciones } from '@/@types/mainTypes';

// Componentes
import ListActivosFijos from './CRUD/ListActivoFijo';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/AFUbicaciones.css'

interface AFUbicacionesProps {
  ubicacionSeleccionadaId: number | null;
  onSelectUbicacion: (id: number | null) => void;
}

const AFUbicacion: React.FC<AFUbicacionesProps> = ({ ubicacionSeleccionadaId, onSelectUbicacion }) => {
  const navigate = useNavigate();
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);

  const [busqueda, setBusqueda] = useState('');

  const handleUbicacionSelected = (ubicacion: Ubicaciones) => {
    onSelectUbicacion(ubicacion.id_ubicacion ?? null);
    navigate(`/almacen-general/activos/ubicacion/${ubicacion.id_ubicacion}`);
  }

  const renderAFUbicacion = () => (
    <ListActivosFijos
      UbicacionSeleccionada={ubicacionSeleccionadaId ?? 0}
    />
  )

  const ubicacionesFiltradas = React.useMemo(() => {
    const ordenadas = [...ubicaciones].sort((a, b) => a.nombre_ubicacion.localeCompare(b.nombre_ubicacion));
    if (!busqueda.trim()) return ordenadas;
    const termino = busqueda.toLowerCase();
    return ordenadas.filter(u => u.nombre_ubicacion.toLowerCase().includes(termino));
  }, [ubicaciones, busqueda]);

  const renderListadoUbicaciones = () => (
    <>
      {ubicaciones.length === 0 ? (
        <div className='noUbicaciones'>
          <p>No hay ubicaciones disponibles</p>
        </div>
      ) : (
        <>
          <div className='searchField'>
            <input
              type='text'
              placeholder='Buscar ubicación...'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className='inputSearch'
            />
          </div>
          <div className='cardsUbicaciones'>
            {ubicacionesFiltradas.map((ubicacion) => (
              <article
                key={ubicacion.id_ubicacion ?? ubicacion.nombre_ubicacion}
                className='cardUbicacion'
                onClick={() => handleUbicacionSelected(ubicacion)}
              >
                <h3>
                  <span className='nombreUbicacion'>{ubicacion.nombre_ubicacion}</span>
                </h3>
                <p>{ubicacion.descripcion_ubicacion}</p>
                <span className={ubicacion.estatus_activo ? 'estado activo' : 'estado inactivo'}>
                  {ubicacion.estatus_activo ? 'Activo' : 'Inactivo'}
                </span>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  )

  return (
    <div className='mainDiv_AFUbicaciones'>
      {ubicacionSeleccionadaId !== null ? renderAFUbicacion() : renderListadoUbicaciones()}
    </div>
  )
}

export default AFUbicacion;