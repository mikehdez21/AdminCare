import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { PrioridadTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { eliminarPrioridad } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prioridad: PrioridadTicket | null;
  onEliminado: () => void;
}

const DeletePrioridad: React.FC<Props> = ({ isOpen, onClose, prioridad, onEliminado }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [enviando, setEnviando] = useState(false);

  if (!prioridad) return null;

  const handleDelete = async () => {
    setEnviando(true);

    const resultado = await dispatch(eliminarPrioridad(prioridad.id_prioridad_ticket as number)).unwrap();

    if (!resultado.success) {
      // Lo habitual es el 422 por dependencia: el mensaje del backend explica si
      // estorban tickets o el SLA asociado.
      Swal.fire({ icon: 'warning', title: 'No se pudo eliminar', text: resultado.message });
      setEnviando(false);

      return;
    }

    Swal.fire({ icon: 'success', title: 'Prioridad eliminada', timer: 1000, showConfirmButton: false });
    setEnviando(false);
    onEliminado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Eliminar prioridad</h2>

        <div className='divDelete_HelpdeskConfig'>
          <p>¿Seguro que desea eliminar <strong>{prioridad.nombre_prioridad}</strong>?</p>
          <small>
            Si tiene tickets o un nivel de SLA asociado, el sistema lo impedirá. Para retirarla de los formularios sin
            perder el histórico, desactívela.
          </small>

          <ModalButtons
            buttons={[
              { text: 'Eliminar', type: 'button', className: 'button_delete', onClick: handleDelete, disabled: enviando },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeletePrioridad;