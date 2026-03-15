import React, { useState } from 'react'
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { Departamentos } from '@/@types/mainTypes';
import { addDepartamento, getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Departamentos/modalDepartamentos.css'

interface AddDepartamentoProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');


const AddDepartamento: React.FC<AddDepartamentoProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [nombreDepartamento, setNombreDepartamento] = useState<string>('');
  const [descripcionDepartamento, setDescripcionDepartamento] = useState<string>('');
  const [atiendePacientes, setAtiendePacientes] = useState<boolean>(false); 
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const nuevoDepartamento: Departamentos = {
        nombre_departamento: nombreDepartamento,
        descripcion: descripcionDepartamento,
        atiende_pacientes: atiendePacientes,
        estatus_activo: estatusActivo

      }

      const formData = new FormData();

      formData.append('nombre_departamento', nuevoDepartamento.nombre_departamento);
      formData.append('descripcion', nuevoDepartamento.descripcion);
      formData.append('atiende_pacientes', nuevoDepartamento.atiende_pacientes.toString());
      formData.append('estatus_activo', nuevoDepartamento.estatus_activo.toString());

      const resultAction = await dispatch(addDepartamento(nuevoDepartamento)).unwrap();

      if (resultAction.success){
        const departamentosActualizados = await dispatch(getDepartamentos()).unwrap();

        if(departamentosActualizados.success){
          dispatch(setListDepartamentos(departamentosActualizados.departamentos!));
          setNombreDepartamento('')
          setDescripcionDepartamento('')
          setAtiendePacientes(false)
          setEstatusActivo(true)

          console.log('Departamento agregado y lista recargada:', departamentosActualizados.departamentos);

        } else 
          console.log('Error al agregar el departamento: ', resultAction.message)
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Departamento Añadido',
        text: 'El Departamento ha sido añadido exitosamente.',
        confirmButtonText: 'OK',
    
      });
      onClose(); // Cerrar modal al completar el envío

    } catch (error) {
      console.error('Error al agregar el departamento: ', error);
        
      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el departamento. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
          
  };

  
      
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modalDepartamentos"
    >

      <div className="mainDiv_modalDepartamentos" >
        <h2>Añadir Departamento</h2>

        <form onSubmit={handleSubmit} className="formDepartamentos">
                    
          <div className='dataInputs_Departamentos'>
                    
            <section className='leftDiv_Inputs'>
        
              <label>
                      *Departamento:
                <input 
                  type="text" 
                  value={nombreDepartamento} 
                  id='nombreDepartamento'
                  name='nombreDepartamento'
                  onChange={(e) => setNombreDepartamento(e.target.value)} 
                  placeholder='Nombre del Departamento'
                  required 
                />
              </label>

              <label>
                  *Descripción
                <input 
                  type="text" 
                  value={descripcionDepartamento}
                  id='descripcionDepartamento'
                  name='descripcionDepartamento'
                  onChange={(e) => setDescripcionDepartamento(e.target.value)}
                  placeholder='Descripción del Departamento'
                  required
                />
              </label>

            </section>

            <section className='rightDiv_Inputs'>

              <label>
                  *Atiende Pacientes
                <input 
                  type="checkbox" 
                  checked={atiendePacientes}
                  id='atiendePacientes'
                  name='atiendePacientes'
                  onChange={(e) => setAtiendePacientes(e.target.checked)}
                  placeholder='Atiende Pacientes'
                  
                />
              </label>

              <label>
                  *Estatus Activo
                <input 
                  type="checkbox" 
                  checked={estatusActivo}
                  id='estatusActivo'
                  name='estatusActivo'
                  onChange={(e) => setEstatusActivo(e.target.checked)}
                  placeholder='Estatus Activo'
                />
              </label>

            </section>
        
          </div>
        
          <ModalButtons 
            buttons={[
              {
                text: 'Guardar',
                type: 'submit',
                className: 'button_addedit'
              },
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose
              }
            ]}
          />
        
        </form>
        
        

      </div>

    </Modal>
  )
}

export default AddDepartamento