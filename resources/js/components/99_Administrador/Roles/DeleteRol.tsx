import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteRol, getRoles } from '@/store/Roles/rolesActions';
import { setListRoles } from '@/store/Roles/rolesReducer';
import { Roles } from '@/@types/mainTypes';
import Swal from 'sweetalert2'; 

import '@styles/00_Utils/addeditdelete_Entities.css'

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
        console.log('Error al eliminar el departamento:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Departamento Eliminado (INACTIVO)',
        text: 'El departamento ha sido eliminada exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción
          
    } catch (error) {
      console.error('Error al eliminar el departamento:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el departamento. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });

    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Nueva Entity"
      className="modal_CRUD_Entity"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content">
        <div>
          <h2>Eliminar Rol</h2>
          <p>¿Quiere eliminar el rol? </p> 

        </div>
        <p> 
          <strong>{rolesToDelete?.name} <br /> </strong>

        </p>
        
        <div className="modal_buttons">
          <button 
            type="button" 
            className="button_delete" 
            onClick={handleDelete}
          >
            Confirmar Eliminación
          </button>
          <button 
            type="button" 
            className="button_close" 
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteRoles;
