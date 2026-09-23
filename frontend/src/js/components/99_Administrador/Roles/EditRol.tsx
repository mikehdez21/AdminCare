import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { Permission, Roles } from '@/@types/mainTypes';
import { useEditRolMutation } from '@/store/api/rolesApi';
import { refreshAuthPermissions } from '@/store/authActions';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import TablaPermisosRol from './TablaPermisosRol';

import '@styles/99_Administrador/Roles/modalRoles.css';

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  rolesToEdit: Roles | null;
  permisos: Permission[];
}

Modal.setAppElement('#root');

const EditRol: React.FC<EditUserProps> = ({ isOpen, onClose, rolesToEdit, permisos }) => {

  const dispatch = useDispatch<AppDispatch>();
  const [editRol] = useEditRolMutation();

  const [nombreRol, setNombreRol] = useState<string>('');
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

  useEffect(() => {
    if (rolesToEdit) {
      setNombreRol(rolesToEdit.name);
      setSelectedPermisos((rolesToEdit.permissions || [])
        .map((permiso) => Number(permiso.id))
        .filter((permisoId) => Number.isFinite(permisoId)));
    } else {
      setNombreRol('');
      setSelectedPermisos([]);
    }
  }, [rolesToEdit]);

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
        id: rolesToEdit.id,
        name: nombreRol,
        guard_name: rolesToEdit.guard_name,
        permissions: selectedPermisos as unknown as Permission[]
      };

      console.log('dataRol_Enviada: ', rolesEditado);
      const resultAction = await editRol(rolesEditado).unwrap();
      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        setNombreRol('');

        // Refrescar permisos del usuario autenticado para reflejar sidebar/UI en tiempo real
        await dispatch(refreshAuthPermissions());

        Swal.fire({
          icon: 'success',
          title: 'Rol Editado',
          text: 'El rol ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose();
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

      const mensaje =
        (error as { data?: { message?: string }; message?: string })?.data?.message ??
        'Hubo un problema al editar el rol. Por favor, inténtalo de nuevo.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
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

          </section>

          <TablaPermisosRol
            permisos={permisos}
            selectedPermisos={selectedPermisos}
            onTogglePermiso={handleTogglePermiso}
          />

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
