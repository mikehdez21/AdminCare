import React, { useState } from 'react';
import Modal from 'react-modal';
import { AlcanceCatalogo, AlcanceValor, Permission } from '@/@types/mainTypes';
import { useAddRolMutation, type RolesPayload } from '@/store/api/rolesApi';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import TablaPermisosRol from './TablaPermisosRol';
import ModalAlcanceRol from './ModalAlcanceRol';

import '@styles/99_Administrador/Roles/modalRoles.css';

interface AddRolesProps {
  isOpen: boolean;
  onClose: () => void;
  permisos: Permission[];
  alcancesCatalogo: AlcanceCatalogo[];
}

Modal.setAppElement('#root');

const AddRolesControl: React.FC<AddRolesProps> = ({ isOpen, onClose, permisos, alcancesCatalogo }) => {
  const [addRol] = useAddRolMutation();

  const [nombreRol, setNombreRol] = useState<string>('');
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);
  const [alcances, setAlcances] = useState<Record<string, AlcanceValor | ''>>({});
  const [isModalAlcanceOpen, setIsModalAlcanceOpen] = useState(false);

  const handleTogglePermiso = (permisoId: number) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleAlcance = (recurso: string, valor: AlcanceValor | '') => {
    setAlcances((prev) => ({ ...prev, [recurso]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: RolesPayload = {
        name: nombreRol,
        guard_name: 'web',
        permissions: selectedPermisos,
        alcances,
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
        setAlcances({});
        setIsModalAlcanceOpen(false);

        Swal.fire({
          icon: 'success',
          title: 'Rol Añadido',
          text: 'El Rol ha sido añadido exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose();

        return;
      }

      // Antes el fallo solo iba a la consola y el modal se quedaba abierto sin
      // decir nada.
      Swal.fire({
        icon: 'error',
        title: 'No se pudo añadir el rol',
        text: resultAction.message || 'Hubo un problema al añadir el rol. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
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
        <div className='headerModalRol'>
          <h2>Añadir Rol</h2>
          {alcancesCatalogo.length > 0 && (
            <button
              type='button'
              className='button_ajustarAlcance'
              onClick={() => setIsModalAlcanceOpen(true)}
            >
              Ajustar Alcance
            </button>
          )}
        </div>


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

        <ModalAlcanceRol
          isOpen={isModalAlcanceOpen}
          onClose={() => setIsModalAlcanceOpen(false)}
          catalogo={alcancesCatalogo}
          valores={alcances}
          onChange={handleAlcance}
        />

      </div>

    </Modal>
  );
};

export default AddRolesControl;
