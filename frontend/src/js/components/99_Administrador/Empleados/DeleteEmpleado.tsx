import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { bajaEmpleado, getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';
import { Empleados } from '@/@types/mainTypes';
import { formatDateHorasToFrontend, getFechaHoraActual } from '@/utils/dateFormat';

import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

interface DeleteEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoToDelete: Empleados | null;
}

Modal.setAppElement('#root');

const DeleteEmpleado: React.FC<DeleteEmpleadoProps> = ({ isOpen, onClose, empleadoToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [fechaBaja, setFechaBaja] = React.useState<string | null>(null);

  useEffect(() => {
    // Si el modal se abre, establecer la fecha de baja
    if (isOpen && empleadoToDelete) {
      setFechaBaja(getFechaHoraActual());
      const formattedDate = formatDateHorasToFrontend(getFechaHoraActual());
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Nueva Entity"
      className="modalEmpleados"
      id="modal_CRUD_AdminDeleteEntity"
    >
      <div className="mainDiv_modalDepartamentos">
        <h2>Baja de Empleado</h2>

        <div className="mainInputs_Delete_AdminEntity">
          <strong>
            {empleadoToDelete?.nombre_empleado} {empleadoToDelete?.apellido_paterno}{' '}
            {empleadoToDelete?.apellido_materno}
          </strong>

          <p>
            <small>¿Quieres dar de baja al empleado?</small>
            <br />
            <strong> Fecha de Baja Establecida: </strong> <small>{fechaBaja}</small>
          </p>
        </div>

        <ModalButtons
          buttons={[
            {
              text: 'Confirmar Baja',
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

export default DeleteEmpleado;
