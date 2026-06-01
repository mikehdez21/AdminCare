import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { Permission, Roles } from '@/@types/mainTypes';
import { editRol, getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';
import { refreshAuthPermissions } from '@/store/authActions';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Roles/modalRoles.css'

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  rolesToEdit: Roles | null;
  permisos: Permission[];
}

Modal.setAppElement('#root');

const EditRol: React.FC<EditUserProps> = ({ isOpen, onClose, rolesToEdit, permisos }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreRol, setNombreRol] = useState<string>('');
  const [searchPermiso, setSearchPermiso] = useState<string>('');
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

  useEffect(() => {
    if (rolesToEdit) {
      setNombreRol(rolesToEdit.name);
      setSelectedPermisos((rolesToEdit.permissions || [])
        .map((permiso) => Number(permiso.id))
        .filter((permisoId) => Number.isFinite(permisoId)));
    } else {
      setNombreRol('');
      setSearchPermiso('');
      setSelectedPermisos([]);
    }
  }, [rolesToEdit]);

  const permisosFiltrados = useMemo(() => {
    const texto = searchPermiso.trim().toLowerCase();
    if (!texto) return permisos;
    return permisos.filter((permiso) => permiso.name.toLowerCase().includes(texto));
  }, [permisos, searchPermiso]);

  const handleTogglePermiso = (permisoId: number) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      if (!rolesToEdit) {
        return;
      }


      const rolesEditado: Roles = {
        id: rolesToEdit.id, // Mantener el ID del rol
        name: nombreRol,
        guard_name: rolesToEdit.guard_name,
        permissions: selectedPermisos as any
      }


      console.log('dataRol_Enviada: ', rolesEditado)
      const resultAction = await dispatch(editRol(rolesEditado)).unwrap();
      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        // Si el roles fue editado con éxito, recargar la lista de roles
        const rolesActualizados = await dispatch(getRoles()).unwrap();
        if (rolesActualizados.success) {
          dispatch(setListRoles(rolesActualizados.roles!)); // Actualiza la lista de roles en el estado
          setNombreRol('')

          console.log('Roles editado y lista recargada:', rolesActualizados.roles);

        }

        // Refrescar permisos del usuario autenticado para reflejar sidebar/UI en tiempo real
        await dispatch(refreshAuthPermissions());

        Swal.fire({
          icon: 'success',
          title: 'Rol Editado',
          text: 'El rol ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el rol.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el rol:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el rol. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modalRoles"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalRoles" >
        <h2>Editar Rol</h2>

        <form onSubmit={handleSubmit} className="formRoles">
          <section className='dataInputs_Roles'>

            <div className='divInputs_Roles'>
              <label>
                *Nombre del Rol:
                <input
                  type="text"
                  value={nombreRol}
                  id='nombreRol'
                  name='nombreRol'
                  onChange={(e) => setNombreRol(e.target.value)}
                  placeholder='Nombre del rol'
                  required
                />
              </label>
            </div>

            <div className='divSearch_Permission'>
              <label>
                Buscar permiso:
                <input
                  type="text"
                  value={searchPermiso}
                  id='searchPermisoEdit'
                  name='searchPermisoEdit'
                  onChange={(e) => setSearchPermiso(e.target.value)}
                  placeholder='Buscar permiso...'
                />
              </label>
            </div>
          </section>

          <section className='tablePermisos_Roles'>
            <table>
              <thead>
                <tr>
                  <th>Permiso</th>
                  <th>Check</th>
                </tr>
              </thead>
              <tbody>
                {permisosFiltrados.map((permiso) => {
                  const permisoId = Number(permiso.id);
                  const checked = selectedPermisos.includes(permisoId);

                  return (
                    <tr key={permisoId}>
                      <td>{permiso.name}</td>
                      <td>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermiso(permisoId)}
                          />
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <ModalButtons
            buttons={[
              {
                text: 'Guardar',
                type: 'submit',
                className: 'button_addedit'
              },
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose
              }
            ]}
          />

        </form>

      </div>
    </Modal>
  );
};

export default EditRol;
