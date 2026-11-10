import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { EstatusTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { actualizarEstatus } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  estatus: EstatusTicket | null;
  onEditado: () => void;
}

/** Tope de `smallInteger`. */
const ORDEN_MAXIMO = 32767;

const EditEstatus: React.FC<Props> = ({ isOpen, onClose, estatus, onEditado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState('');
  const [esFinal, setEsFinal] = useState(false);
  const [color, setColor] = useState('#6C757D');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!estatus) return;

    setNombre(estatus.nombre_estatus ?? '');
    setDescripcion(estatus.descripcion_estatus ?? '');
    setOrden(String(estatus.orden_flujo ?? ''));
    setEsFinal(estatus.es_estado_final === true);
    setColor(estatus.color ?? '#6C757D');
  }, [estatus]);

  if (!estatus) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ordenNumero = Number(orden);

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre del estatus.' });

      return;
    }

    // La columna es `NOT NULL`, así que en la edición también es obligatorio: si se
    // dejara en blanco el backend devolvería el 422 del `required` en vez de un
    // mensaje propio desde el formulario.
    if (!Number.isInteger(ordenNumero) || ordenNumero < 1 || ordenNumero > ORDEN_MAXIMO) {
      Swal.fire({
        icon: 'warning',
        title: 'Orden de flujo inválido',
        text: `Escriba un entero entre 1 y ${ORDEN_MAXIMO}.`,
      });

      return;
    }

    setEnviando(true);

    const resultado = await dispatch(
      actualizarEstatus({
        id: estatus.id_estatus_ticket as number,
        cuerpo: {
          nombre_estatus: nombre.trim(),
          descripcion_estatus: descripcion.trim() || null,
          es_estado_final: esFinal,
          orden_flujo: ordenNumero,
          color,
        },
      })
    ).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar el estatus', text: resultado.message });
      setEnviando(false);

      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Estatus actualizado',
      text: 'El nombre vive en el catálogo, así que también cambia en los tickets que ya lo tienen.',
      timer: 2400,
      showConfirmButton: false,
    });
    setEnviando(false);
    onEditado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Editar estatus</h2>

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

export default EditEstatus;