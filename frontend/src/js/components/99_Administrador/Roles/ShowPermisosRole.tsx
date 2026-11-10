import React from 'react';
import Modal from 'react-modal';

import { AlcanceCatalogo, Permission, Roles } from '@/@types/mainTypes';
import { etiquetaAlcance } from '@/utils/alcances';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import TablaPermisosRol from './TablaPermisosRol';

import '@styles/99_Administrador/Roles/modalRoles.css';

interface showPermisosRoleProps {
  isOpen: boolean;
  onClose: () => void;
  rolToShow: Roles | null;
  /** Catálogo completo, con las etiquetas de `config/permisos.php`. */
  permisos: Permission[];
  alcancesCatalogo: AlcanceCatalogo[];
}

Modal.setAppElement('#root');

/**
 * Detalle de solo lectura de los permisos de un rol.
 *
 * Reusa `TablaPermisosRol` (la misma del alta y la edición) en modo `readOnly`: las casillas
 * se ven igual, apagadas, y sin buscador. Antes tenía su propia tabla y su propio CSS, en
 * `showSubModals.css`, que nadie importaba desde aquí —el modal salía sin estilos salvo que se
 * hubiera pasado antes por Usuarios, que sí importa ese archivo—.
 */
const ShowPermisosRole: React.FC<showPermisosRoleProps> = ({ isOpen, onClose, rolToShow, permisos, alcancesCatalogo }) => {
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

        {alcancesCatalogo.length > 0 && (
          <section className='alcancesResumen_Roles'>
            <h3>Alcance</h3>
            <ul>
              {alcancesCatalogo.map(({ recurso, etiqueta }) => (
                <li key={recurso}>
                  <strong>{etiqueta}:</strong>{' '}
                  {rolToShow?.name === 'Admin'
                    ? 'Global (fijo)'
                    : etiquetaAlcance(rolToShow?.alcances?.[recurso])}
                </li>
              ))}
            </ul>
            <p className='notaAlcance_Roles'>
              El alcance solo recorta los registros; no da acceso. El rol necesita los permisos del recurso.
            </p>
          </section>
        )}

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
