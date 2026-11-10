import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { SLANivel } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { eliminarSla } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sla: SLANivel | null;
  onEliminado: () => void;
}

const DeleteSLA: React.FC<Props> = ({ isOpen, onClose, sla, onEliminado }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [enviando, setEnviando] = useState(false);

  if (!sla) return null;

  const handleDelete = async () => {
    setEnviando(true);

    const resultado = await dispatch(eliminarSla(sla.id_sla_nivel as number)).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'warning', title: 'No se pudo eliminar', text: resultado.message });
      setEnviando(false);

      return;
    }

    Swal.fire({ icon: 'success', title: 'SLA eliminado', timer: 1000, showConfirmButton: false });
    setEnviando(false);
    onEliminado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Eliminar nivel de SLA</h2>

        <div className='divDelete_HelpdeskConfig'>
          <p>¿Seguro que desea eliminar el SLA de la prioridad <strong>{sla.prioridad?.nombre_prioridad ?? sla.id_prioridad_ticket}</strong>?</p>
          <small>
            Esta acción no afecta a los tickets ya creados: al abrirlos se copiaron sus fechas límite. Solo deja de aplicar
            a los tickets futuros. Para dejar de aplicarlo sin perder la referencia, desactívelo.
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

export default DeleteSLA;