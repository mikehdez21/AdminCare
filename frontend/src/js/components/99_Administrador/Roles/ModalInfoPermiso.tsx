import React from 'react';
import { GroupedPermission } from '@/@types/mainTypes';
import { ACCIONES_INFO } from '@/utils/permissions';
import Modal from '@/components/00_Utils/ui/Modal';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import '@styles/99_Administrador/Roles/modalInfoPermiso.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  grupo: GroupedPermission;
}

/**
 * Explica qué cubre un recurso y qué permite cada acción que existe en él.
 *
 * Describe el permiso, no quién lo tiene ni a qué área afecta: eso es el rol.
 * Las acciones que el recurso no declara no se muestran, en vez de explicar
 * una casilla deshabilitada.
 */
const ModalInfoPermiso: React.FC<Props> = ({ isOpen, onClose, grupo }) => {
  const acciones = ACCIONES_INFO.filter(({ clave }) => grupo.acciones.includes(clave));

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className='modalInfoPermiso' contentLabel='Información del permiso'>
      <div className='mainDiv_modalInfoPermiso'>
        <h2>
          {grupo.dominio_etiqueta ? `${grupo.dominio_etiqueta} › ` : ''}
          {grupo.etiqueta}
        </h2>

        <p className='permisoQueCubre'>{grupo.descripcion}</p>

        <div className='accionesPermiso'>
          {acciones.map(({ clave, etiqueta, descripcion }) => (
            <div key={clave} className={`accionPermiso accionPermiso_${clave}`}>
              <h3>{etiqueta}</h3>
              <p>{descripcion}</p>
            </div>
          ))}
        </div>

        <p className='permisoQueCubre'>
          El alcance sobre los registros —propio, departamento o global— se decide aparte del permiso.
        </p>

        <ModalButtons
          buttons={[{ text: 'Cerrar', type: 'button', className: 'button_close', onClick: onClose }]}
        />
      </div>
    </Modal>
  );
};

export default ModalInfoPermiso;
