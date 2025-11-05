import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteClasificacion, getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { setClasificacion } from '@/store/almacenGeneral/Clasificaciones/clasificacionesReducer';
import { Clasificaciones } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import Swal from 'sweetalert2'; 

import '@styles/00_Utils/addeditdelete_Entities.css'

interface DeleteClasificacionProps {
  isOpen: boolean;
  onClose: () => void;
  clasificacionToDelete: Clasificaciones | null;
}

Modal.setAppElement('#root');

const DeleteClasificacion: React.FC<DeleteClasificacionProps> = ({ isOpen, onClose, clasificacionToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar el proveedor
      const resultAction = await dispatch(deleteClasificacion(clasificacionToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        // Si el proveedor fue eliminado con éxito, recargar la lista de proveedores
        const clasificacionesActualizados = await dispatch(getClasificaciones()).unwrap();
        if (clasificacionesActualizados.success) {
          dispatch(setClasificacion(clasificacionesActualizados.clasificacion!)); // Actualiza la lista de proveedores en el estado

          console.log('Clasificación eliminada y lista recargada:', clasificacionesActualizados.clasificacion);

        }
          
      } else {
        console.log('Error al eliminar la clasificación:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Clasificación Eliminada',
        text: 'La clasificación ha sido eliminada exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción
          
    } catch (error) {
      console.error('Error al eliminar la clasificación:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar la clasificación. Por favor, inténtalo de nuevo.',
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
        <h2>Eliminar Clasificación</h2>
        <p>¿Quiere eliminar la clasificación <br /> <strong>{clasificacionToDelete?.descripcion_clasificacionaf}</strong>?</p>
        
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
export default DeleteClasificacion;
