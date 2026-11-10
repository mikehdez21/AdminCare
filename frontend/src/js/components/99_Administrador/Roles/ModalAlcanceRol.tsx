import React from 'react';
import type { AlcanceCatalogo, AlcanceValor } from '@/@types/mainTypes';
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { ALCANCES_LABEL } from '@/utils/alcances';
import '@styles/99_Administrador/Roles/modalRoles.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  catalogo: AlcanceCatalogo[];
  valores: Record<string, AlcanceValor | ''>;
  onChange: (recurso: string, valor: AlcanceValor | '') => void;
  disabled?: boolean;
}

/**
 * Modal de alcance del rol. Los cambios se aplican al formulario de alta/edición
 * al instante; el guardado real ocurre con el botón Guardar del rol.
 */
const ModalAlcanceRol: React.FC<Props> = ({ isOpen, onClose, catalogo, valores, onChange, disabled = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className='modalAlcanceRol'
      contentLabel='Alcance del rol'
    >
      <div className='mainDiv_modalAlcance'>
        <h2>Alcance del rol</h2>

        <p className='notaAlcance_Roles'>
          Solo aplica si el rol tiene permiso de lectura del recurso. El alcance recorta los registros; no da acceso.
        </p>

        <ul className='leyendaAlcance_Roles'>
          <li>
            <strong>Derivado (automático):</strong> usa el departamento del usuario si atiende Helpdesk; si no, solo sus propios registros.
          </li>
          <li>
            <strong>Propio:</strong> solo los registros que el usuario abrió o tiene asignados.
          </li>
          <li>
            <strong>Departamento:</strong> los registros de los departamentos que atiende, más los propios.
          </li>
          <li>
            <strong>Global:</strong> todos los registros del recurso, sin importar el área.
          </li>
        </ul>

        {catalogo.length === 0 ? (
          <p className='notaAlcance_Roles'>No hay recursos con alcance configurable.</p>
        ) : (
          <div className='alcancesModal_Roles'>
            {catalogo.map(({ recurso, etiqueta, valores: opciones }) => (
              <label key={recurso}>
                {etiqueta}
                <select
                  value={valores[recurso] ?? ''}
                  disabled={disabled}
                  onChange={(event) => onChange(recurso, event.target.value as AlcanceValor | '')}
                >
                  <option value=''>Derivado (automático)</option>
                  {opciones.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {ALCANCES_LABEL[opcion]}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        {disabled && <p className='notaAlcance_Roles'>El rol Admin siempre es global.</p>}

        <ModalButtons
          buttons={[
            {
              text: 'Listo',
              type: 'button',
              className: 'button_addedit',
              onClick: onClose,
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default ModalAlcanceRol;
