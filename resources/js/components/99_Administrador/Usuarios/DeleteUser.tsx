import React, {useEffect} from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { bajaUsuario, getUsers } from '@/store/Users/usersActions';
import { setListUsuarios } from '@/store/Users/usersReducer';
import { User } from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';

import Swal from 'sweetalert2'; 
// 

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

interface DeleteUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToDelete: User | null;
}

Modal.setAppElement('#root');

const DeleteUser: React.FC<DeleteUsuarioProps> = ({ isOpen, onClose, usuarioToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [fechaBaja, setFechaBaja] = React.useState<string | null>(null);
  
  useEffect(() => {
    // Si el modal se abre, establecer la fecha de baja
    if (isOpen && usuarioToDelete) {
      const getLocalDateTime = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
      };
  
      setFechaBaja(getLocalDateTime);
      const formattedDate = formatDateHorasToFrontend(getLocalDateTime());
      setFechaBaja(formattedDate);
    }
  }, [isOpen, usuarioToDelete]);

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar el usuario (Solo se INACTIVA, el registro no se elimina)
      const resultAction = await dispatch(bajaUsuario(usuarioToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        // Si el USUARIO fue eliminado con éxito, recargar la lista de usuarios
        const usuariosActualizados = await dispatch(getUsers()).unwrap();
        if (usuariosActualizados.success) {
          dispatch(setListUsuarios(usuariosActualizados.users!)); // Actualiza la lista de usuarios en el estado

        }
          
      } else {
        console.log('Error al eliminar el usuario:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Usuario Inactivo',
        text: 'El usuario ha sido desactivado exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción
          
    } catch (error) {
      console.error('Error al desactivar el usuario:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al desactivar el usuario. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });

    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Nueva Entity"
      className="modal_CRUD_AdminEntity"
      id='modal_CRUD_AdminDeleteEntity'
      overlayClassName="modal_OverlayCRUD_AdminEntity"
    >
      <div className="modal_Content_Admin">
        <h2>Eliminar Usuario</h2>

        <div className='dataUserDelete'>
          <strong>{usuarioToDelete?.nombre_usuario } </strong>

          <p> 
            <small>
            ¿Quieres Eliminar el Usuario? - PERMANENTEMENTE
            </small>

            <br />
            
            <strong> Fecha de Eliminación Establecida: </strong> <small>{fechaBaja}</small>

          </p>
        </div>
        
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
export default DeleteUser;
