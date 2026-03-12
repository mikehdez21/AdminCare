import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteUbicacion, getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';
import { Ubicaciones } from '@/@types/mainTypes';
import Swal from 'sweetalert2'; 
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Ubicaciones/modalUbicaciones.css';


interface DeleteUbicacionProps {
  isOpen: boolean;
  onClose: () => void;
  ubicacionToDelete: Ubicaciones | null;
}

Modal.setAppElement('#root');

const DeleteUbicacion: React.FC<DeleteUbicacionProps> = ({ isOpen, onClose, ubicacionToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar la ubicación
      const resultAction = await dispatch(deleteUbicacion(ubicacionToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        // Si la ubicación fue eliminada con éxito, recargar la lista de ubicaciones
        const ubicacionesActualizadas = await dispatch(getUbicaciones()).unwrap();
        if (ubicacionesActualizadas.success) {
          dispatch(setListUbicaciones(ubicacionesActualizadas.ubicaciones!)); // Actualiza la lista de ubicaciones en el estado
        }
          
      } else {
        console.log('Error al eliminar la ubicación:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Ubicación Eliminada',
        text: 'La ubicación ha sido eliminada exitosamente.',
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
      className="modalUbicaciones"
    >
      <div className="mainDiv_modalUbicaciones">
        <h2>Eliminar Ubicación</h2>

        <div className='mainInputs_Delete_AdminEntity'>
          <p>¿Quiere eliminar la ubicación? </p>    

          <p>
            <strong>{ubicacionToDelete?.nombre_ubicacion} <br /> </strong>
            <small>{ubicacionToDelete?.descripcion_ubicacion}</small>
          </p>
        
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

export default DeleteUbicacion;