import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { PrioridadTicket, SLANivel } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch } from '@/store/store';
import { actualizarSla } from '@/store/helpdesk/Configuracion/configuracionActions';

// Componentes
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Styles
import '@styles/04_Helpdesk/Configuracion/modalHelpdeskConfig.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sla: SLANivel | null;
  prioridades: PrioridadTicket[];
  onEditado: () => void;
}

const EditSLA: React.FC<Props> = ({ isOpen, onClose, sla, prioridades, onEditado }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [idPrioridad, setIdPrioridad] = useState<number | ''>('');
  const [respuesta, setRespuesta] = useState<number | ''>('');
  const [resolucion, setResolucion] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (!sla) return;

    setIdPrioridad(sla.id_prioridad_ticket);
    setRespuesta(sla.tiempo_respuesta_horas);
    setResolucion(sla.tiempo_resolucion_horas);
    setDescripcion(sla.descripcion_sla ?? '');
    setActivo(sla.estatus_activo);
  }, [sla]);

  if (!sla) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (respuesta === '' || resolucion === '') {
      Swal.fire({ icon: 'warning', title: 'Tiempos requeridos', text: 'Escriba el tiempo de respuesta y el de resolución.' });

      return;
    }

    const resultado = await dispatch(
      actualizarSla({
        id: sla.id_sla_nivel as number,
        cuerpo: {
          // Se reenvía la prioridad de la propia fila, que el selector tiene
          // deshabilitado. El backend la ignora al validar la unicidad (`ignore`),
          // y mandarla evita que un payload sin ese campo quede fuera de tipo.
          id_prioridad_ticket: sla.id_prioridad_ticket,
          tiempo_respuesta_horas: Number(respuesta),
          tiempo_resolucion_horas: Number(resolucion),
          descripcion_sla: descripcion.trim() || null,
          estatus_activo: activo,
        },
      })
    ).unwrap();

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar el SLA', text: resultado.message });

      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'SLA actualizado',
      text: 'Los tickets ya creados conservan sus fechas límite originales.',
      timer: 2200,
      showConfirmButton: false,
    });
    onEditado();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalComponent_HelpdeskConfig'>
      <div className='modalHelpdeskConfig'>
        <h2>Editar nivel de SLA</h2>
        <p className='notaModal'>Cambiar los tiempos solo afecta a los tickets que se creen después.</p>

        <form onSubmit={handleSubmit} className='divInputs_HelpdeskConfig'>
          <label>
            Prioridad
            <select value={idPrioridad} disabled onChange={(e) => setIdPrioridad(e.target.value === '' ? '' : Number(e.target.value))}>
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

export default EditSLA;