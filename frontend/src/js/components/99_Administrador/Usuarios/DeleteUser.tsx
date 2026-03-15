import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { bajaUsuario, getUsers } from '@/store/administrador/Users/usersActions';
import { setListUsuarios } from '@/store/administrador/Users/usersReducer';
import { User } from '@/@types/mainTypes';
import { formatDateHorasToFrontend, getFechaHoraActual } from '@/utils/dateFormat';

import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

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
      setFechaBaja(getFechaHoraActual());
      const formattedDate = formatDateHorasToFrontend(getFechaHoraActual());
      setFechaBaja(formattedDate);
    }
  }, [isOpen, usuarioToDelete]);

  const handleDelete = async () => {
    try {
      // Llamada a la acción para eliminar el usuario (Solo se INACTIVA, el registro no se elimina)
      const resultAction = await dispatch(bajaUsuario(usuarioToDelete!)).unwrap();

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
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Desactivar Nueva Entity" className="modalUsuarios">
      <div className="mainDiv_modalUsuarios">
        <h2>Desactivar Usuario</h2>

        <div className="mainInputs_Delete_AdminEntity">
          <strong>{usuarioToDelete?.nombre_usuario}</strong>

          <p>
            <small>¿Quieres Desactivar el Usuario?</small>
            <br />
            <strong> Fecha de Desactivación: </strong> <small>{fechaBaja}</small>
          </p>
        </div>

        <ModalButtons
          buttons={[
            {
              text: 'Desactivar',
              type: 'button',
              className: 'button_delete',
              onClick: handleDelete,
            },
            {
              text: 'Cancelar',
              type: 'button',
              className: 'button_close',
              onClick: onClose,
            },
          ]}
        />
      </div>
    </Modal>
  );
};
export default DeleteUser;
