import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { PrioridadTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { actualizarPrioridad } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prioridad: PrioridadTicket | null;
  onEditado: () => void;
}

const EditPrioridad: React.FC<Props> = ({ isOpen, onClose, prioridad, onEditado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState<number | ''>('');
  const [color, setColor] = useState('#6C757D');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (!prioridad) return;

    setNombre(prioridad.nombre_prioridad ?? '');
    setNivel(prioridad.nivel_prioridad ?? '');
    setColor(prioridad.color ?? '#6C757D');
    setActivo(prioridad.estatus_activo);
  }, [prioridad]);

  if (!prioridad) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre de la prioridad.' });

      return;
    }

    if (nivel === '') {
      Swal.fire({ icon: 'warning', title: 'Nivel requerido', text: 'El nivel ordena la lista de prioridades.' });

      return;
    }

    const resultado = await dispatch(
      actualizarPrioridad({
        id: prioridad.id_prioridad_ticket as number,
        cuerpo: {
          nombre_prioridad: nombre.trim(),
          nivel_prioridad: Number(nivel),
          color,
          estatus_activo: activo,
        },
      })
    ).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar la prioridad', text: resultado.message });

      return;
    }

    Swal.fire({ icon: 'success', title: 'Prioridad actualizada', timer: 1000, showConfirmButton: false });
    onEditado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Editar prioridad</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Nombre *
            <input type='text' maxLength={50} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label>
            Nivel *
            <input type='number' min={1} value={nivel} onChange={(e) => setNivel(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>

          <label>
            Color
            <input type='color' value={color} onChange={(e) => setColor(e.target.value)} />
          </label>

          <label>
            Activa
            <select value={activo ? '1' : '0'} onChange={(e) => setActivo(e.target.value === '1')}>
              <option value='1'>Sí</option>
              <option value='0'>No</option>
            </select>
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

export default EditPrioridad;