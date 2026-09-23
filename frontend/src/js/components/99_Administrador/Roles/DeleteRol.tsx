import React from 'react';
import Modal from 'react-modal';
import { useDeleteRolMutation } from '@/store/api/rolesApi';
import { Roles } from '@/@types/mainTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Roles/modalRoles.css';

interface DeleteDepartamentoProps {
  isOpen: boolean;
  onClose: () => void;
  rolesToDelete: Roles | null;
}

Modal.setAppElement('#root');

const DeleteRoles: React.FC<DeleteDepartamentoProps> = ({ isOpen, onClose, rolesToDelete }) => {
  const [deleteRol] = useDeleteRolMutation();

  const handleDelete = async () => {
    try {
      await deleteRol(rolesToDelete!).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Rol Eliminado ',
        text: 'El rol ha sido eliminado exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose();
    } catch (error) {
      console.error('Error al eliminar el rol:', error);

      const mensaje =
        (error as { data?: { message?: string }; message?: string })?.data?.message ??
        'Hubo un problema al eliminar el rol. Por favor, inténtalo de nuevo.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
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


        <div className='mainInputs_Delete_AdminEntity'>
          <strong>
            {rolesToDelete?.name}
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
