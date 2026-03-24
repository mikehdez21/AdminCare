import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteProveedor, getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Proveedores/modalProveedores.css';


interface DeleteProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorToDelete: Proveedores | null;
}

Modal.setAppElement('#root');

const DeleteProveedor: React.FC<DeleteProveedorProps> = ({ isOpen, onClose, proveedorToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar el proveedor
      const resultAction = await dispatch(deleteProveedor(proveedorToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        // Si el proveedor fue eliminado con éxito, recargar la lista de proveedores
        const proveedoresActualizados = await dispatch(getProveedores()).unwrap();
        if (proveedoresActualizados.success) {
          dispatch(setListProveedor(proveedoresActualizados.proveedor!)); // Actualiza la lista de proveedores en el estado

          console.log('Proveedor eliminado y lista recargada:', proveedoresActualizados.proveedor);

        }

      } else {
        console.log('Error al eliminar el proveedor:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Proveedor Eliminado',
        text: 'El proveedor ha sido eliminado exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción

    } catch (error) {
      console.error('Error al eliminar el proveedor:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el proveedor. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });

    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Nueva Entity"
      className="modalProveedores"
    >
      <div className="mainDiv_modalProveedores">
        <h2>Eliminar Proveedor</h2>

        <div className='divDeleteProveedor'>

          <p>¿Quiere eliminar el proveedor <br /> <strong>{proveedorToDelete?.nombre_proveedor}</strong>?</p>

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
export default DeleteProveedor;
