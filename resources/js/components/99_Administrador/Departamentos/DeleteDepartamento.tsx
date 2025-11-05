import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteDepartamento, getDepartamentos } from '@/store/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/Departamentos/departamentosReducer';
import { Departamentos } from '@/@types/mainTypes';
import Swal from 'sweetalert2'; 

import '@styles/00_Utils/addeditdelete_Entities.css'

interface DeleteDepartamentoProps {
  isOpen: boolean;
  onClose: () => void;
  departamentoToDelete: Departamentos | null;
}

Modal.setAppElement('#root');

const DeleteDepartamentos: React.FC<DeleteDepartamentoProps> = ({ isOpen, onClose, departamentoToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {

      // Llamada a la acción para eliminar el departamento
      const resultAction = await dispatch(deleteDepartamento(departamentoToDelete!)).unwrap();

      console.log(resultAction.success)

      if (resultAction.success) {
        // Si el departamento fue eliminado con éxito, recargar la lista de departamentos
        const departamentosActualizados = await dispatch(getDepartamentos()).unwrap();
        if (departamentosActualizados.success) {
          dispatch(setListDepartamentos(departamentosActualizados.departamentos!)); // Actualiza la lista de departamentos en el estado

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
          <h2>Eliminar Departamento</h2>
          <p>¿Quiere eliminar al departamento? </p>
        </div>

        <p>
          <strong>{departamentoToDelete?.nombre_departamento} <br /> </strong>
          <small>{departamentoToDelete?.descripcion}</small>

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
export default DeleteDepartamentos;
