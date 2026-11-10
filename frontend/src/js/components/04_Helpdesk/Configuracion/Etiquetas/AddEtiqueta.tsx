import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskEtiquetaPayload } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';
import { crearEtiqueta } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreado: () => void;
}

const AddEtiqueta: React.FC<Props> = ({ isOpen, onClose, onCreado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#6C757D');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre de la etiqueta.' });

      return;
    }

    const cuerpo: HelpdeskEtiquetaPayload = { nombre_etiqueta: nombre.trim(), color };

    const resultado = await dispatch(crearEtiqueta(cuerpo)).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo crear la etiqueta', text: resultado.message });

      return;
    }

    Swal.fire({ icon: 'success', title: 'Etiqueta creada', timer: 1000, showConfirmButton: false });
    setNombre('');
    setColor('#6C757D');
    onCreado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Nueva etiqueta</h2>

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

export default AddEtiqueta;