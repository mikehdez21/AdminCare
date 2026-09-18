import React, { useState } from 'react';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


// Types
import { Departamentos } from '@/@types/mainTypes';

// Componentes
import ListActivosFijos from './CRUD/ListActivoFijo';


import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/AFDepartamentos.css'

interface AFDepartamentosProps {
  departamentoSeleccionadoId: number | null;
  onSelectDepartamento: (id: number | null) => void;
}

const AFDepartamentos: React.FC<AFDepartamentosProps> = ({ departamentoSeleccionadoId, onSelectDepartamento }) => {
  const navigate = useNavigate();
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  const [busqueda, setBusqueda] = useState('');

  const handleDepartamentoSelected = (departamento: Departamentos) => {
    onSelectDepartamento(departamento.id_departamento ?? null);
    navigate(`/almacen-general/activos/departamento/${departamento.id_departamento}`);
  }


  const renderAFDepartamento = () => (
    <ListActivosFijos
      DepartamentoSeleccionado={departamentoSeleccionadoId ?? 0}
    />
  )


  const departamentosFiltrados = React.useMemo(() => {
    const ordenados = [...departamentos].sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento));
    if (!busqueda.trim()) return ordenados;
    const termino = busqueda.toLowerCase();
    return ordenados.filter(d => d.nombre_departamento.toLowerCase().includes(termino));
  }, [departamentos, busqueda]);

  const renderListadoDepartamentos = () => (

    <>
      {departamentos.length === 0 ? (
        <div className='noDepartamentos'>
          <p>No hay departamentos disponibles</p>
        </div>
      ) : (
        <>
          <div className='searchField'>
            <input
              type='text'
              placeholder='Buscar departamento...'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className='inputSearch'
            />
          </div>
          <div className='cardsDepartamentos'>
            {departamentosFiltrados.map((departamento) => (
              <article
                key={departamento.id_departamento ?? departamento.nombre_departamento}
                className='cardDepartamento'
                onClick={() => handleDepartamentoSelected(departamento)}
              >
                <h3>
                  <span className='nombreDepartamento'>{departamento.nombre_departamento}</span>
                </h3>
                <p>{departamento.descripcion}</p>
                <span className={departamento.estatus_activo ? 'estado activo' : 'estado inactivo'}>
                  {departamento.estatus_activo ? 'Activo' : 'Inactivo'}
                </span>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  )

  return (
    <div className='mainDiv_AFDepartamentos'>
      {departamentoSeleccionadoId !== null ? renderAFDepartamento() : renderListadoDepartamentos()}
    </div>
  )
}

export default AFDepartamentos;