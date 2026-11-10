import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskSistemaProveedor, HelpdeskProveedorError } from '@/@types/HelpdeskTypes/ticketTypes';
import type { SistemaProveedorPayload } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';
import { actualizarSistemaProveedor, crearSistemaProveedor } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** `null` = alta. */
  sistema: HelpdeskSistemaProveedor | null;
  proveedores: HelpdeskProveedorError[];
  onGuardado: () => void;
}

/** Alta y edición de un sistema de proveedor (los de Reliv: SIHO, ECE, Surfing). */
const ModalSistemaProveedor: React.FC<Props> = ({ isOpen, onClose, sistema, proveedores, onGuardado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [idProveedor, setIdProveedor] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    setIdProveedor(sistema?.id_proveedor_error ?? null);
    setNombre(sistema?.nombre_sistema_proveedor ?? '');
    setActivo(sistema?.estatus_activo ?? true);
  }, [sistema, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (idProveedor === null) {
      Swal.fire({ icon: 'warning', title: 'Proveedor requerido', text: 'Seleccione a qué proveedor pertenece el sistema.' });

      return;
    }

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre del sistema.' });

      return;
    }

    const cuerpo: SistemaProveedorPayload = {
      id_proveedor_error: idProveedor,
      nombre_sistema_proveedor: nombre.trim(),
      estatus_activo: activo,
    };

    const resultado = sistema
      ? await dispatch(actualizarSistemaProveedor({ id: sistema.id_sistema_proveedor as number, cuerpo })).unwrap()
      : await dispatch(crearSistemaProveedor(cuerpo)).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar el sistema', text: resultado.message });

      return;
    }

    Swal.fire({
      icon: 'success',
      title: sistema ? 'Sistema actualizado' : 'Sistema creado',
      timer: 1000,
      showConfirmButton: false,
    });

    onGuardado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>{sistema ? 'Editar sistema' : 'Nuevo sistema'}</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Proveedor *
            <select value={idProveedor ?? ''} onChange={(e) => setIdProveedor(e.target.value === '' ? null : Number(e.target.value))}>
              <option value=''>Seleccione un proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id_proveedor_error} value={p.id_proveedor_error}>{p.nombre_proveedor_error}</option>
              ))}
            </select>
          </label>

          <label>
            Nombre *
            <input type='text' maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} />
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

export default ModalSistemaProveedor;
