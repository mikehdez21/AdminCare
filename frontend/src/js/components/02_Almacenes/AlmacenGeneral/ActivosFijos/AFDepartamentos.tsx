import React from 'react';
import { RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useSelector } from 'react-redux';


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
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  const handleDepartamentoSelected = (departamento: Departamentos) => {
    onSelectDepartamento(departamento.id_departamento ?? null);

  }


  const renderAFDepartamento = () => (
    <ListActivosFijos 
      DepartamentoSeleccionado={departamentoSeleccionadoId ?? 0}
    />
      
  )

  const renderListadoDepartamentos = () => (

    <>
      {departamentos.length === 0 ? (
        <div className='noDepartamentos'>
          <p>No hay departamentos disponibles</p>
        </div>
      ) : (
        <div className='cardsDepartamentos'>
          {departamentos.map((departamento) => (
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