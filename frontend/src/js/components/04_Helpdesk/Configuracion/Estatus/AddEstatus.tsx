import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { EstatusTicketPayload } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';
import { crearEstatus } from '@/store/helpdesk/Configuracion/configuracionActions';

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

/** Último `orden_flujo` de la tabla. Como es `smallInteger`, el tope es 32767. */
const ORDEN_MAXIMO = 32767;

const AddEstatus: React.FC<Props> = ({ isOpen, onClose, onCreado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState('');
  const [esFinal, setEsFinal] = useState(false);
  const [color, setColor] = useState('#6C757D');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // `orden_flujo` es `smallInteger NOT NULL`: sin valor no hay alta posible.
    const ordenNumero = Number(orden);

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre del estatus.' });

      return;
    }

    if (!Number.isInteger(ordenNumero) || ordenNumero < 1 || ordenNumero > ORDEN_MAXIMO) {
      Swal.fire({
        icon: 'warning',
        title: 'Orden de flujo inválido',
        text: `Escriba un entero entre 1 y ${ORDEN_MAXIMO}.`,
      });

      return;
    }

    setEnviando(true);

    const cuerpo: EstatusTicketPayload = {
      nombre_estatus: nombre.trim(),
      descripcion_estatus: descripcion.trim() || null,
      es_estado_final: esFinal,
      orden_flujo: ordenNumero,
      color,
    };

    const resultado = await dispatch(crearEstatus(cuerpo)).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo crear el estatus', text: resultado.message });
      setEnviando(false);

      return;
    }

    Swal.fire({ icon: 'success', title: 'Estatus creado', timer: 1000, showConfirmButton: false });
    setNombre('');
    setDescripcion('');
    setOrden('');
    setEsFinal(false);
    setColor('#6C757D');
    setEnviando(false);
    onCreado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Nuevo estatus</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Nombre *
            <input type='text' maxLength={50} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label>
            Descripción
            <input type='text' maxLength={255} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>

          <label>
            Orden de flujo *
            <input type='number' min={1} max={ORDEN_MAXIMO} value={orden} onChange={(e) => setOrden(e.target.value)} />
          </label>

          <label>
            Es estado final
            <input type='checkbox' checked={esFinal} onChange={(e) => setEsFinal(e.target.checked)} />
          </label>

          <label>
            Color
            <input type='color' value={color} onChange={(e) => setColor(e.target.value)} />
          </label>

          <ModalButtons
            buttons={[
              { text: 'Guardar', type: 'submit', className: 'button_addedit', disabled: enviando },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose },
            ]}
          />
        </form>
      </div>
    </Modal>
  );
};

export default AddEstatus;