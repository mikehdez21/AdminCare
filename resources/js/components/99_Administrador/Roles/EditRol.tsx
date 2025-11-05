import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';

import { Roles } from '@/@types/mainTypes';

import { editRol, getRoles } from '@/store/Roles/rolesActions';
import { setListRoles } from '@/store/Roles/rolesReducer';

import Swal from 'sweetalert2';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

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

  const customModalStyle_Rol = {
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
      style={customModalStyle_Rol}
    >
      <div className="modal_Content_Admin">
        <h2>Editar Rol</h2>
        <div className='mainInputs_addedit_AdminEntity'>
          <form onSubmit={handleSubmit} className="Form_AdminEntity">

            <div className='dataInputs'>

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

export default EditRol;
