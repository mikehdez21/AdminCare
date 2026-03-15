import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { Roles } from '@/@types/mainTypes';
import { editRol, getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Roles/modalRoles.css'

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  rolesToEdit: Roles | null;
}

Modal.setAppElement('#root');

const EditRol: React.FC<EditUserProps> = ({ isOpen, onClose, rolesToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();
  
  const [nombreRol, setNombreRol] = useState<string>('');

  useEffect(() => {
    if (rolesToEdit) {
      setNombreRol(rolesToEdit.name);
    }
  }, [rolesToEdit]); // Solo se ejecuta cuando departamentoToEdit cambia

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      if (!rolesToEdit) {
        return;
      }

      
      const rolesEditado: Roles = {
        id: rolesToEdit.id, // Mantener el ID del rol
        name: nombreRol
        
        
      };
    
      const formData = new FormData();
      
      formData.append('id_rol', rolesEditado.id!.toString());
      formData.append('name', rolesEditado.name);

  
      console.log('dataRol_Enviada: ', rolesEditado)
      const resultAction = await dispatch(editRol(rolesEditado)).unwrap();
      console.log('Respuesta del servidor:', resultAction);
  
      if (resultAction.success) {
        // Si el roles fue editado con éxito, recargar la lista de roles
        const rolesActualizados = await dispatch(getRoles()).unwrap();
        if (rolesActualizados.success) {
          dispatch(setListRoles(rolesActualizados.roles!)); // Actualiza la lista de roles en el estado
          setNombreRol('')

          console.log('Roles editado y lista recargada:', rolesActualizados.roles);

        }

        Swal.fire({
          icon: 'success',
          title: 'Rol Editado',
          text: 'El rol ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el rol.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el rol:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el rol. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modalRoles"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalRoles" >
        <h2>Editar Rol</h2>

        <form onSubmit={handleSubmit} className="formRoles">
          <div className='dataInputs_Roles'>

            <div className='leftDiv_Inputs'>

              <label>
                  *Nombre del Rol:
                <input 
                  type="text" 
                  value={nombreRol} 
                  id='nombreRol'
                  name='nombreRol'
                  onChange={(e) => setNombreRol(e.target.value)} 
                  placeholder='Nombre del rol'
                  required 
                />
              </label>
                
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

            </div>

          </div>

        </form>

      </div>
    </Modal>
  );
};

export default EditRol;
