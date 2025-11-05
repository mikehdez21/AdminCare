import React, { useEffect } from 'react'
import Modal from 'react-modal'
import { AppDispatch } from '@/store/store'
import { useDispatch } from 'react-redux'
import { bajaEmpleado, getEmpleados } from '@/store/Empleados/empleadosActions'
import { setListEmpleados } from '@/store/Empleados/empleadosReducer'
import { Empleados } from '@/@types/mainTypes'
import { formatDateHorasToFrontend } from '@/utils/dateFormat';

import Swal from 'sweetalert2'

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

interface DeleteEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoToDelete: Empleados | null;
}

Modal.setAppElement('#root');


const DeleteEmpleado: React.FC<DeleteEmpleadoProps> = ({isOpen, onClose, empleadoToDelete}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [fechaBaja, setFechaBaja] = React.useState<string | null>(null);

  useEffect(() => {
    // Si el modal se abre, establecer la fecha de baja
    if (isOpen && empleadoToDelete) {
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
  }, [isOpen, empleadoToDelete]);

  const handleDelete = async () => {
    try {
      const resultAction = await dispatch(bajaEmpleado(empleadoToDelete!)).unwrap();

      if (resultAction.success) {
        // Si el EMPLEADO fue eliminado con éxito, recargar la lista de empleados
        const empleadosActualizados = await dispatch(getEmpleados()).unwrap();
        if (empleadosActualizados.success) {
          dispatch(setListEmpleados(empleadosActualizados.empleados!)); // Actualiza la lista de empleados en el estado
        }
      } else {
        console.log('Error al eliminar el empleado:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Baja de Empleado',
        text: 'El empleado ha sido dado de baja exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose(); // Cerrar el modal al completar cualquier acción

    } catch (error) {
      console.error('Error al eliminar el empleado:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el empleado. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  }
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
        <h2>Baja de Empleado</h2>
    
        <div className='dataEmpleadoDelete'>
          <strong>{empleadoToDelete?.nombre_empleado } </strong>
          <strong>{empleadoToDelete?.apellido_paterno} </strong>
          <strong>{empleadoToDelete?.apellido_materno} </strong>

          <p> 
            <small>
            ¿Quieres dar de baja al empleado?
            </small>

            <br />
            
            <strong> Fecha de Baja Establecida: </strong> <small>{fechaBaja}</small>

          </p>
        </div>
            
        <div className="modal_buttons">
          <button 
            type="button" 
            className="button_delete" 
            onClick={handleDelete}
          >
                Confirmar Baja
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
  )
}

export default DeleteEmpleado