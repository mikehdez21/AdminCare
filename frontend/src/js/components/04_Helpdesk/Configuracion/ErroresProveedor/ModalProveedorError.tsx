import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskDepartamento, HelpdeskProveedorError } from '@/@types/HelpdeskTypes/ticketTypes';
import type { ProveedorErrorPayload } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch, RootState } from '@/store/store';
import { actualizarProveedorError, crearProveedorError } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** `null` = alta. */
  proveedor: HelpdeskProveedorError | null;
  onGuardado: () => void;
}

/**
 * Alta y edición de un proveedor de error.
 *
 * El switch "¿Pide sistema…?" es el que decide si capturar el error de ese
 * proveedor pide sistema, no. de ticket externo, módulo y personal SAC.
 */
const ModalProveedorError: React.FC<Props> = ({ isOpen, onClose, proveedor, onGuardado }) => {
  const dispatch = useDispatch<AppDispatch>();
  const departamentos = useSelector((s: RootState) => s.departamentos.departamentos) as HelpdeskDepartamento[];

  const [nombre, setNombre] = useState('');
  const [idDepartamento, setIdDepartamento] = useState<number | null>(null);
  const [requiereSistema, setRequiereSistema] = useState(false);
  const [activo, setActivo] = useState(true);

  // Se rellena al abrir: el control reutiliza el modal para alta y edición.
  useEffect(() => {
    setNombre(proveedor?.nombre_proveedor_error ?? '');
    setIdDepartamento(proveedor?.id_departamento ?? null);
    setRequiereSistema(proveedor?.requiere_sistema ?? false);
    setActivo(proveedor?.estatus_activo ?? true);
  }, [proveedor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Escriba el nombre del proveedor.' });

      return;
    }

    const cuerpo: ProveedorErrorPayload = {
      nombre_proveedor_error: nombre.trim(),
      id_departamento: idDepartamento,
      requiere_sistema: requiereSistema,
      estatus_activo: activo,
    };

    const resultado = proveedor
      ? await dispatch(actualizarProveedorError({ id: proveedor.id_proveedor_error as number, cuerpo })).unwrap()
      : await dispatch(crearProveedorError(cuerpo)).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar el proveedor', text: resultado.message });

      return;
    }

    Swal.fire({
      icon: 'success',
      title: proveedor ? 'Proveedor actualizado' : 'Proveedor creado',
      timer: 1000,
      showConfirmButton: false,
    });

    onGuardado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>{proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Nombre *
            <input type='text' maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label>
            Departamento que lo administra
            <select value={idDepartamento ?? ''} onChange={(e) => setIdDepartamento(e.target.value === '' ? null : Number(e.target.value))}>
              <option value=''>Sin especificar</option>
              {departamentos.map((d) => (
                <option key={d.id_departamento} value={d.id_departamento}>{d.nombre_departamento}</option>
              ))}
            </select>
          </label>

          <label>
            ¿Pide sistema, no. de ticket, módulo y personal SAC?
            <select value={requiereSistema ? '1' : '0'} onChange={(e) => setRequiereSistema(e.target.value === '1')}>
              <option value='1'>Sí</option>
              <option value='0'>No</option>
            </select>
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

export default ModalProveedorError;
