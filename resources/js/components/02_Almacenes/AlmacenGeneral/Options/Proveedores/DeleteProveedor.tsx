import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteProveedor, getProveedores } from '@/store/almacenGeneral/Proveedores/proveedoresActions';
import { setProveedor } from '@/store/almacenGeneral/Proveedores/proveedoresReducer';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import Swal from 'sweetalert2'; 

import '@styles/00_Utils/addeditdelete_Entities.css'

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
          dispatch(setProveedor(proveedoresActualizados.proveedor!)); // Actualiza la lista de proveedores en el estado

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
      className="modal_CRUD_Entity"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content">
        <h2>Eliminar Proveedor</h2>
        <p>¿Quiere eliminar el proveedor <br /> <strong>{proveedorToDelete?.nombre_proveedor}</strong>?</p>
        
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
export default DeleteProveedor;
