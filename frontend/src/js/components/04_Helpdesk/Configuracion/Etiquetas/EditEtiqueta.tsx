import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskEtiqueta } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { actualizarEtiqueta } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  etiqueta: HelpdeskEtiqueta | null;
  onEditado: () => void;
}

const EditEtiqueta: React.FC<Props> = ({ isOpen, onClose, etiqueta, onEditado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#6C757D');

  useEffect(() => {
    if (!etiqueta) return;

    setNombre(etiqueta.nombre_etiqueta ?? '');
    setColor(etiqueta.color ?? '#6C757D');
  }, [etiqueta]);

  if (!etiqueta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre de la etiqueta.' });

      return;
    }

    const resultado = await dispatch(
      actualizarEtiqueta({
        id: etiqueta.id_etiqueta as number,
        cuerpo: { nombre_etiqueta: nombre.trim(), color },
      })
    ).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar la etiqueta', text: resultado.message });

      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Etiqueta actualizada',
      text: 'El nombre vive en el catálogo, así que también cambia en los tickets ya cerrados.',
      timer: 2400,
      showConfirmButton: false,
    });
    onEditado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Editar etiqueta</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Nombre *
            <input type='text' maxLength={50} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label>
            Color
            <input type='color' value={color} onChange={(e) => setColor(e.target.value)} />
          </label>

          <ModalButtons
            buttons={[
              { text: 'Guardar', type: 'submit', className: 'button_addedit' },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose },
            ]}
          />
        </form>
      </div>
    </Modal>
  );
};

export default EditEtiqueta;