import React from 'react';
import Modal from 'react-modal';

import { Permission, Roles } from '@/@types/mainTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import TablaPermisosRol from './TablaPermisosRol';

import '@styles/99_Administrador/Roles/modalRoles.css';

interface showPermisosRoleProps {
  isOpen: boolean;
  onClose: () => void;
  rolToShow: Roles | null;
  /** Catálogo completo, con las etiquetas de `config/permisos.php`. */
  permisos: Permission[];
}

Modal.setAppElement('#root');

/**
 * Detalle de solo lectura de los permisos de un rol.
 *
 * Reusa la misma tabla del alta/edición en modo `readOnly`, para que el
 * catálogo y los permisos fuera del catálogo se vean con el mismo criterio.
 */
const ShowPermisosRole: React.FC<showPermisosRoleProps> = ({ isOpen, onClose, rolToShow, permisos }) => {
  const idsDelRol = (rolToShow?.permissions ?? []).map((permiso) => Number(permiso.id));
  const ids = new Set(idsDelRol);
  const permisosDelRol = permisos.filter((permiso) => permiso.id != null && ids.has(Number(permiso.id)));

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalRoles"
      contentLabel="Permisos del Rol"
    >

      <div className="mainDiv_modalRoles">
        <h2>Permisos del Rol: <br /> {rolToShow?.name}</h2>

        <div className='formRoles'>

          <TablaPermisosRol
            permisos={permisosDelRol}
            selectedPermisos={idsDelRol}
            readOnly
          />

          <ModalButtons
            buttons={[
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose
              }
            ]}
          />

        </div>
      </div>

    </Modal >
  );
};

export default ShowPermisosRole;
