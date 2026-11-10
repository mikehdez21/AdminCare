import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskModuloSIHO } from '@/@types/HelpdeskTypes/ticketTypes';
import type { ModuloSIHOPayload } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';
import { actualizarModuloSIHO, crearModuloSIHO } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** `null` = alta. */
  modulo: HelpdeskModuloSIHO | null;
  onGuardado: () => void;
}

/** Alta y edición de un módulo de SIHO, para el desplegable de "Módulo". */
const ModalModuloSIHO: React.FC<Props> = ({ isOpen, onClose, modulo, onGuardado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombre, setNombre] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    setNombre(modulo?.nombre_modulo ?? '');
    setActivo(modulo?.estatus_activo ?? true);
  }, [modulo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre del módulo.' });

      return;
    }

    const cuerpo: ModuloSIHOPayload = { nombre_modulo: nombre.trim(), estatus_activo: activo };

    const resultado = modulo
      ? await dispatch(actualizarModuloSIHO({ id: modulo.id_modulo_siho as number, cuerpo })).unwrap()
      : await dispatch(crearModuloSIHO(cuerpo)).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar el módulo', text: resultado.message });

      return;
    }

    Swal.fire({
      icon: 'success',
      title: modulo ? 'Módulo actualizado' : 'Módulo creado',
      timer: 1000,
      showConfirmButton: false,
    });

    onGuardado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>{modulo ? 'Editar módulo' : 'Nuevo módulo'}</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Nombre *
            <input type='text' maxLength={150} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label>
            Activo
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

export default ModalModuloSIHO;
