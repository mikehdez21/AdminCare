import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskEtiqueta } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { eliminarEtiqueta } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  etiqueta: HelpdeskEtiqueta | null;
  onEliminado: () => void;
}

const DeleteEtiqueta: React.FC<Props> = ({ isOpen, onClose, etiqueta, onEliminado }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [enviando, setEnviando] = useState(false);

  if (!etiqueta) return null;

  const handleDelete = async () => {
    setEnviando(true);

    const resultado = await dispatch(eliminarEtiqueta(etiqueta.id_etiqueta as number)).unwrap();

    if (!resultado.success) {
      // Aquí el 422 es la norma, no la excepción: casi toda etiqueta usada tiene
      // tickets y el pivote está en cascada.
      Swal.fire({ icon: 'warning', title: 'No se pudo eliminar', text: resultado.message });
      setEnviando(false);

      return;
    }

    Swal.fire({ icon: 'success', title: 'Etiqueta eliminada', timer: 1000, showConfirmButton: false });
    setEnviando(false);
    onEliminado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Eliminar etiqueta</h2>

        <div className='divDelete_HelpdeskConfig'>
          <p>¿Seguro que desea eliminar <strong>{etiqueta.nombre_etiqueta}</strong>?</p>
          <small>
            Si hay tickets que la usan, el sistema lo impedirá. No se puede desactivar una etiqueta: su catálogo solo
            tiene nombre y color, así que la única forma de retirarla de los tickets abiertos es renombrarla.
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

export default DeleteEtiqueta;