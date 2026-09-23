import React, { useMemo } from 'react';
import Modal from 'react-modal';

import { Roles } from '@/@types/mainTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { agruparPermisosPorModulo, formatearNombreModulo } from './TablaPermisosRol';

interface showPermisosRoleProps {
  isOpen: boolean;
  onClose: () => void;
  rolToShow: Roles | null;
}

type AccionPermiso = 'escritura' | 'lectura' | 'control';

const ACCIONES: AccionPermiso[] = ['escritura', 'lectura', 'control'];

Modal.setAppElement('#root');

const ShowPermisosRole: React.FC<showPermisosRoleProps> = ({ isOpen, onClose, rolToShow }) => {
  const permisos = rolToShow?.permissions ?? [];
  const grupos = useMemo(() => agruparPermisosPorModulo(permisos), [permisos]);
  const sinPermisos = permisos.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalPermisosRole"
      contentLabel="Permisos del Rol"
    >

      <div className="mainDiv_modalViewPermisos">
        <h2>Permisos del Rol: <br /> {rolToShow?.name}</h2>

        {sinPermisos ? (
          <p className="mensajeSinPermisos_Roles">Sin permisos asignados</p>
        ) : (
          <div className="contenedorTablaPermisos_Roles">
            <table className="tablaPermisosSoloLectura_Roles">
              <thead>
                <tr>
                  <th>Permiso</th>
                  <th>Escritura</th>
                  <th>Lectura</th>
                  <th>Control</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grupo) => (
                  <tr key={grupo.modulo}>
                    <td className="celdaNombreModulo_Roles" title={grupo.modulo}>
                      {formatearNombreModulo(grupo.modulo)}
                    </td>
                    {ACCIONES.map((accion) => (
                      <td key={accion} className="celdaAccion_Roles">
                        {grupo[accion] ? (
                          <span className="marcaAccionAsignada_Roles" title={accion}>✓</span>
                        ) : (
                          <span className="marcaAccionVacia_Roles">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

    </Modal >
  );
};

export default ShowPermisosRole;
