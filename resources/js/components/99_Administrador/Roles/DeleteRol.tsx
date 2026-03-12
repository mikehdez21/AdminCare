import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteRol, getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';
import { Roles } from '@/@types/mainTypes';
import Swal from 'sweetalert2'; 
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Roles/modalRoles.css'

interface DeleteDepartamentoProps {
  isOpen: boolean;
  onClose: () => void;
  rolesToDelete: Roles | null;
}

Modal.setAppElement('#root');

const DeleteRoles: React.FC<DeleteDepartamentoProps> = ({ isOpen, onClose, rolesToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar el roles
      const resultAction = await dispatch(deleteRol(rolesToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        // Si el rol fue eliminado con éxito, recargar la lista de rol
        const rolesActualizados = await dispatch(getRoles()).unwrap();
        if (rolesActualizados.success) {
          dispatch(setListRoles(rolesActualizados.roles!)); // Actualiza la lista de roles en el estado

        }
          
      } else {
        console.log('Error al eliminar el rol:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Rol Eliminado ',
        text: 'El rol ha sido eliminado exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción
          
    } catch (error) {
      console.error('Error al eliminar el rol:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el rol. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });

    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Nueva Entity"
      className="modalRoles"
    >

      <div className="mainDiv_modalRoles" >
        <h2>Eliminar Rol</h2>
        <p>¿Quiere eliminar el rol? </p> 


        <div className='mainInputs_Delete_AdminEntity'>
          <strong>
            {rolesToDelete?.name } 
          </strong>

        </div>
        
        
        <ModalButtons
          buttons={[
            {
              text: 'Eliminar',
              type: 'button',
              className: 'button_delete',
              onClick: handleDelete
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

    </Modal>
  );
};
export default DeleteRoles;
