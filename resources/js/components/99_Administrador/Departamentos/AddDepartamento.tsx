import React, { useState } from 'react'
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { Departamentos } from '@/@types/mainTypes';
import { addDepartamento, getDepartamentos } from '@/store/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/Departamentos/departamentosReducer';
import Swal from 'sweetalert2';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'


interface AddDepartamentoProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');


const AddDepartamentoControl: React.FC<AddDepartamentoProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [nombreDepartamento, setNombreDepartamento] = useState<string>('');
  const [descripcionDepartamento, setDescripcionDepartamento] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const nuevoDepartamento: Departamentos = {
        nombre_departamento: nombreDepartamento,
        descripcion: descripcionDepartamento
      }

      const formData = new FormData();

      formData.append('nombre_departamento', nuevoDepartamento.nombre_departamento);
      formData.append('descripcion', nuevoDepartamento.descripcion);

      const resultAction = await dispatch(addDepartamento(nuevoDepartamento)).unwrap();

      if (resultAction.success){
        const departamentosActualizados = await dispatch(getDepartamentos()).unwrap();

        if(departamentosActualizados.success){
          dispatch(setListDepartamentos(departamentosActualizados.departamentos!));
          setNombreDepartamento('')
          setDescripcionDepartamento('')

          console.log('Departamento agregado y lista recargada:', departamentosActualizados.departamentos);

        } else 
          console.log('Error al agregar el departamento: ', resultAction.message)
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Departamento Añadida',
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

  const customModalStyle_Departamento = {
    content: {
      width: '600px'
    }
  }
      
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modal_CRUD_AdminEntity"
      overlayClassName="modal_OverlayCRUD_AdminEntity"
      style={customModalStyle_Departamento}
    >

      <div className="modal_Content_Admin" >
        <h2>Añadir Departamento</h2>

        <div className='mainInputs_addedit_AdminEntity'>
        
          <form onSubmit={handleSubmit} className="Form_AdminEntity">
                    
            <div className='dataInputs'>
                    
              <div className='leftDiv_Inputs'>
        
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
              </div>
        
            </div>
        
        
            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Añadir</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>
        
          </form>
        
        
        </div>

      </div>

    </Modal>
  )
}

export default AddDepartamentoControl