import React, { useState } from 'react';
import Modal from 'react-modal';
import { Permission } from '@/@types/mainTypes';
import { useAddRolMutation, type RolesPayload } from '@/store/api/rolesApi';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import TablaPermisosRol from './TablaPermisosRol';

import '@styles/99_Administrador/Roles/modalRoles.css';

interface AddRolesProps {
  isOpen: boolean;
  onClose: () => void;
  permisos: Permission[];
}

Modal.setAppElement('#root');

const AddRolesControl: React.FC<AddRolesProps> = ({ isOpen, onClose, permisos }) => {
  const [addRol] = useAddRolMutation();

  const [nombreRol, setNombreRol] = useState<string>('');
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

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
      const payload: RolesPayload = {
        name: nombreRol,
        guard_name: 'web',
        permissions: selectedPermisos,
      };

      if (selectedPermisos.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Permisos no seleccionados',
          text: 'Debes seleccionar al menos un permiso.',
          confirmButtonText: 'OK',
        });

        return;
      }

      const resultAction = await addRol(payload).unwrap();

      if (resultAction.success) {
        setNombreRol('');
        setSelectedPermisos([]);

        Swal.fire({
          icon: 'success',
          title: 'Rol Añadido',
          text: 'El Rol ha sido añadido exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose();
      } else {
        console.log('Error al agregar el rol: ', resultAction.message);
      }
    } catch (error) {
      console.error('Error al agregar el Rol: ', error);

      const mensaje =
        (error as { data?: { message?: string }; message?: string })?.data?.message ??
        'Hubo un problema al añadir el Rol. Por favor, inténtalo de nuevo.';

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
      contentLabel="Añadir Nueva Entity"
      className="modalRoles"
    >

      <div className="mainDiv_modalRoles" >
        <h2>Añadir Rol</h2>


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
                  placeholder='Nombre del Rol'
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

export default AddRolesControl;
