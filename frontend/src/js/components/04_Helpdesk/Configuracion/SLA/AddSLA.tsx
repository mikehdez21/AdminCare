import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { PrioridadTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import type { SLANivelPayload } from '@/@types/HelpdeskTypes/configuracionTypes';
import { AppDispatch } from '@/store/store';
import { crearSla } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prioridades: PrioridadTicket[];
  onCreado: () => void;
}

const AddSLA: React.FC<Props> = ({ isOpen, onClose, prioridades, onCreado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [idPrioridad, setIdPrioridad] = useState<number | ''>('');
  const [respuesta, setRespuesta] = useState<number | ''>('');
  const [resolucion, setResolucion] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Las dos columnas son NOT NULL: el backend responde 422 si no llegan.
    if (idPrioridad === '') {
      Swal.fire({ icon: 'warning', title: 'Prioridad requerida', text: 'El SLA se define sobre una prioridad.' });

      return;
    }

    if (respuesta === '' || resolucion === '') {
      Swal.fire({ icon: 'warning', title: 'Tiempos requeridos', text: 'Escriba el tiempo de respuesta y el de resolución.' });

      return;
    }

    const cuerpo: SLANivelPayload = {
      id_prioridad_ticket: Number(idPrioridad),
      tiempo_respuesta_horas: Number(respuesta),
      tiempo_resolucion_horas: Number(resolucion),
      descripcion_sla: descripcion.trim() || null,
      estatus_activo: activo,
    };

    const resultado = await dispatch(crearSla(cuerpo)).unwrap();

    if (!resultado.success) {
      // Lo común es que esa prioridad ya tenga SLA: `uk_sla_prioridad` es único.
      Swal.fire({ icon: 'error', title: 'No se pudo crear el SLA', text: resultado.message });

      return;
    }

    Swal.fire({ icon: 'success', title: 'SLA creado', timer: 1000, showConfirmButton: false });
    setIdPrioridad('');
    setRespuesta('');
    setResolucion('');
    setDescripcion('');
    setActivo(true);
    onCreado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Nuevo nivel de SLA</h2>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Prioridad *
            <select value={idPrioridad} onChange={(e) => setIdPrioridad(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value=''>Seleccione�?�</option>
              {prioridades.map((p) => (
                <option key={p.id_prioridad_ticket} value={p.id_prioridad_ticket}>{p.nombre_prioridad}</option>
              ))}
            </select>
          </label>

          <label>
            Tiempo de respuesta (horas) *
            <input type='number' min={0} step='0.01' value={respuesta} onChange={(e) => setRespuesta(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>

          <label>
            Tiempo de resolución (horas) *
            <input type='number' min={0} step='0.01' value={resolucion} onChange={(e) => setResolucion(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>

          <label>
            Descripción
            <input type='text' maxLength={255} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
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

export default AddSLA;