import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteActivoFijo, getActivosFijos } from '@/store/almacenGeneral/Activos/activosActions';
import { setListActivosFijos } from '@/store/almacenGeneral/Activos/activosReducer';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/modalActivosFijos.css';


interface DeleteActivoFijoProps {
  isOpen: boolean;
  onClose: () => void;
  activoFijoToDelete: ActivosFijos | null;
}

Modal.setAppElement('#root');

const DeleteActivoFijo: React.FC<DeleteActivoFijoProps> = ({ isOpen, onClose, activoFijoToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {
      // Llamada a la acción para eliminar el activo fijo
      const resultAction = await dispatch(deleteActivoFijo(activoFijoToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        const activosFijosActualizados = await dispatch(getActivosFijos()).unwrap();
        if (activosFijosActualizados.success) {
          dispatch(setListActivosFijos(activosFijosActualizados.activosFijos!));

          console.log('ActivoFijo eliminado y lista recargada:', activosFijosActualizados.activosFijos);
        }
      } else {
        console.log('Error al eliminar el activo fijo:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Activo Fijo Eliminado',
        text: 'El activo fijo ha sido eliminado exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción

    } catch (error) {
      console.error('Error al eliminar el activo fijo:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el activo fijo. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });

    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Nueva Entity"
      className="modalComponent_AlmacenAF"
    >
      <div className="modalActivosFijos">
        <h2>Eliminar ActivoFijo</h2>

        <div className='divDeleteActivoFijo'>

          <p> ¿Quiere eliminar el activo fijo? </p>
          <ul>
            <li> <strong>Código Único: </strong>{activoFijoToDelete?.codigo_unico} </li>
            <li> <strong>Nombre: </strong>{activoFijoToDelete?.nombre_af} </li>
            <li> <strong>Modelo: </strong>{activoFijoToDelete?.modelo_af} </li>
            <li> <strong>Marca: </strong>{activoFijoToDelete?.marca_af} </li>
            <li> <strong>Número de Serie: </strong>{activoFijoToDelete?.numero_serie_af} </li>
            <li> <strong>Precio Unitario: </strong>${activoFijoToDelete?.precio_unitario_af}</li>
          </ul>

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

export default DeleteActivoFijo;

