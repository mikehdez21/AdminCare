import React, { useState } from 'react';
import Swal from 'sweetalert2';

// Types & Store
import type { ResultadoEscritura } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** "proveedor", "sistema", "módulo". */
  singular: string;
  /** Texto de la fila que se va a borrar. */
  nombreElemento: string;
  /** Qué pasa si no se puede: el backend responde 422 con el motivo. */
  aviso: string;
  /** Ejecuta el borrado; el control es quien conoce su thunk. */
  onEliminar: () => Promise<ResultadoEscritura>;
  onEliminado: () => void;
}

/**
 * Confirmación de baja compartida por los tres catálogos de errores de proveedor.
 * Cada control trae su thunk, así que aquí no se conoce ninguno.
 */
const ModalEliminarCatalogoError: React.FC<Props> = ({
  isOpen,
  onClose,
  singular,
  nombreElemento,
  aviso,
  onEliminar,
  onEliminado,
}) => {
  const [enviando, setEnviando] = useState(false);

  const handleDelete = async () => {
    setEnviando(true);

    const resultado = await onEliminar();

    setEnviando(false);

    if (!resultado.success) {
      // Aquí el 422 es la norma, no la excepción: el histórico impide borrar lo que
      // ya está en uso.
      Swal.fire({ icon: 'warning', title: 'No se pudo eliminar', text: resultado.message });

      return;
    }

    Swal.fire({ icon: 'success', title: `${singular} eliminado`, timer: 1000, showConfirmButton: false });
    onEliminado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Eliminar {singular}</h2>

        <div className='divDelete_HelpdeskConfig'>
          <p>¿Seguro que desea eliminar <strong>{nombreElemento}</strong>?</p>
          <small>{aviso}</small>

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

export default ModalEliminarCatalogoError;
