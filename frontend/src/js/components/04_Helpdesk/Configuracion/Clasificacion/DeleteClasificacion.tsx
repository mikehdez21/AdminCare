import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { NivelClasificacion } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { accionesDe, esquemaDe } from './esquemaClasificacion';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nivel: NivelClasificacion;
  entidad: Record<string, unknown> | null;
  /** Avisa al control de qué nivel se borró, para limpiar su selección. */
  onEliminado?: (nivel: NivelClasificacion) => void;
}

const DeleteClasificacion: React.FC<Props> = ({ isOpen, onClose, nivel, entidad, onEliminado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const esquema = esquemaDe(nivel);
  const [enviando, setEnviando] = useState(false);

  if (!entidad) return null;

  const nombre = String(entidad[esquema.nombreCampo] ?? '');

  const handleDelete = async () => {
    setEnviando(true);

    try {
      const resultado = await accionesDe(nivel).eliminar(dispatch, Number(entidad[esquema.idCampo]));

      if (!resultado.success) {
        // Lo más común aquí es el 422 por dependencia: el backend explica cuál,
        // y se muestra tal cual en vez de un "no se pudo eliminar" genérico.
        Swal.fire({ icon: 'warning', title: 'No se pudo eliminar', text: resultado.message });

        return;
      }

      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1000, showConfirmButton: false });
      onEliminado?.(nivel);
      onClose();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error instanceof Error ? error.message : 'Error inesperado' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Eliminar {esquema.singular.toLowerCase()}</h2>

        <div className='divDelete_HelpdeskConfig'>
          <p>¿Seguro que desea eliminar <strong>{nombre}</strong>?</p>
          <small>
            Si tiene tickets o elementos dependientes, el sistema lo impedirá. La baja lógica (desactivar) siempre está
            disponible y conserva el histórico.
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

export default DeleteClasificacion;