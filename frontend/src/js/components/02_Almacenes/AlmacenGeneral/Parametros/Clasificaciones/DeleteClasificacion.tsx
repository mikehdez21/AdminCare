import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteClasificacion, getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer';
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/Clasificaciones/modalClasificaciones.css';


interface DeleteClasificacionProps {
  isOpen: boolean;
  onClose: () => void;
  clasificacionToDelete: ClasificacionesAF | null;
}

Modal.setAppElement('#root');

const DeleteClasificacion: React.FC<DeleteClasificacionProps> = ({ isOpen, onClose, clasificacionToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar el proveedor
      const resultAction = await dispatch(deleteClasificacion(clasificacionToDelete!)).unwrap();

      if (resultAction.success) {
        // Si el proveedor fue eliminado con éxito, recargar la lista de proveedores
        const clasificacionesActualizados = await dispatch(getClasificaciones()).unwrap();
        if (clasificacionesActualizados.success) {
          dispatch(setListClasificacion(clasificacionesActualizados.clasificacion!)); // Actualiza la lista de proveedores en el estado

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
      className="modalClasificaciones"
    >
      <div className="mainDiv_modalClasificaciones">
        <h2>Eliminar Clasificación</h2>

        <div className='divDeleteClasificacion'>

          <p>¿Quiere eliminar la clasificación <br /> <strong>{clasificacionToDelete?.nombre_clasificacion}</strong>?</p>

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
export default DeleteClasificacion;
