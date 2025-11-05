import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';

import { Departamentos } from '@/@types/mainTypes';


import { editDepartamento, getDepartamentos } from '@/store/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/Departamentos/departamentosReducer';

import Swal from 'sweetalert2';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  departamentoToEdit: Departamentos | null;
}

Modal.setAppElement('#root');

const EditDepartamento: React.FC<EditUserProps> = ({ isOpen, onClose, departamentoToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreDepartamento, setNombreDepartamento] = useState<string>('');
  const [descripcionDepartamento, setDescripcionDepartamento] = useState<string>('');

  useEffect(() => {
    if (departamentoToEdit) {
      setNombreDepartamento(departamentoToEdit.nombre_departamento);
      setDescripcionDepartamento(departamentoToEdit.descripcion);
    }
  }, [departamentoToEdit]); // Solo se ejecuta cuando departamentoToEdit cambia

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      if (!departamentoToEdit) {
        return;
      }

      
      const departamentoEditado: Departamentos = {
        id_departamento: departamentoToEdit.id_departamento, // Mantener el ID del departamento
        nombre_departamento: nombreDepartamento,
        descripcion: descripcionDepartamento,
        
        
      };
    
      const formData = new FormData();
      
      formData.append('id_departamento', departamentoEditado.id_departamento!.toString());
      formData.append('nombre_departamento', departamentoEditado.nombre_departamento);
      formData.append('descripcion', departamentoEditado.descripcion);

  
      console.log('dataDepartamento_Enviada: ', departamentoToEdit)
      const resultAction = await dispatch(editDepartamento(departamentoToEdit)).unwrap();
      console.log('Respuesta del servidor:', resultAction);
  
      if (resultAction.success) {
        // Si el departamento fue editado con éxito, recargar la lista de departamentos
        const departamentosActualizados = await dispatch(getDepartamentos()).unwrap();
        if (departamentosActualizados.success) {
          dispatch(setListDepartamentos(departamentosActualizados.departamentos!)); // Actualiza la lista de departamentos en el estado
          setNombreDepartamento('')
          setDescripcionDepartamento('')     

          console.log('Departamento editado y lista recargada:', departamentosActualizados.departamentos);

        }

        Swal.fire({
          icon: 'success',
          title: 'Departamento Editado',
          text: 'El departamento ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el departamento.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el departamento:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el departamento. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  const customModalStyle_Departamento = {
    content: {
      width: '600px',
    }

  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modal_CRUD_AdminEntity"
      overlayClassName="modal_OverlayCRUD_AdminEntity"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      style={customModalStyle_Departamento}
    >
      <div className="modal_Content_Admin">
        <h2>Editar Departamento</h2>
        <div className='mainInputs_addedit_AdminEntity'>
          <form onSubmit={handleSubmit} className="Form_AdminEntity">

            <div className='dataInputs'>

              <div className='leftDiv_Inputs'>

                <label>
                  *Nombre de Departamento:
                  <input 
                    type="text" 
                    value={nombreDepartamento} 
                    id='nombreDepartamento'
                    name='nombreDepartamento'
                    onChange={(e) => setNombreDepartamento(e.target.value)} 
                    placeholder='Nombre del departamento'
                    required 
                  />
                </label>

                <label>
                  *Descripción:
                  <input 
                    type="text" 
                    value={descripcionDepartamento} 
                    id='descripcionDepartamento'
                    name='descripcionDepartamento'
                    onChange={(e) => setDescripcionDepartamento(e.target.value)} 
                    placeholder='Descripción general del departamento'
                    required 
                  />
                </label>
                
                <div className="modal_buttons">
                  <button type="submit" className="button_addedit">Guardar Cambios</button>
                  <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
                </div>

              </div>

            </div>

          </form>
        </div>

      </div>
    </Modal>
  );
};

export default EditDepartamento;
