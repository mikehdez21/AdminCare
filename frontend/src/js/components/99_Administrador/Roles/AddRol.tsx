import React, { useMemo, useState } from 'react'
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { Permission, Roles } from '@/@types/mainTypes';
import { addRol, getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Roles/modalRoles.css'


interface AddRolesProps {
  isOpen: boolean;
  onClose: () => void;
  permisos: Permission[];
}

Modal.setAppElement('#root');


const AddRolesControl: React.FC<AddRolesProps> = ({ isOpen, onClose, permisos }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombreRol, setNombreRol] = useState<string>('');
  const [searchPermiso, setSearchPermiso] = useState<string>('');
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

  const permisosFiltrados = useMemo(() => {
    const texto = searchPermiso.trim().toLowerCase();
    if (!texto) return permisos;
    return permisos.filter((permiso: any) =>
      (permiso?.name || permiso?.nombre || '').toLowerCase().includes(texto)
    );
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
      const nuevoRol: Roles = {
        name: nombreRol,
        guard_name: 'web'
      }

      const payload = {
        ...nuevoRol,
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

      const resultAction = await dispatch(addRol(payload as any)).unwrap();


      if (resultAction.success) {
        const rolesActualizados = await dispatch(getRoles()).unwrap();

        if (rolesActualizados.success) {
          dispatch(setListRoles(rolesActualizados.roles!));
          setNombreRol('')
          setSelectedPermisos([])
          setSearchPermiso('')

          console.log('Rol agregado y lista recargada:', rolesActualizados.roles);

          Swal.fire({
            icon: 'success',
            title: 'Rol Añadido',
            text: 'El Rol ha sido añadido exitosamente.',
            confirmButtonText: 'OK',
          });

          onClose();

        } else
          console.log('Error al agregar el rol: ', resultAction.message)
      }

    } catch (error) {
      console.error('Error al agregar el Rol: ', error);

      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el Rol. Por favor, inténtalo de nuevo.',
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

            <div className='divSearch_Permission'>
              <label>
                Buscar permiso:
                <input
                  type="text"
                  value={searchPermiso}
                  id='searchPermiso'
                  name='searchPermiso'
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
                {permisosFiltrados.map((permiso: any) => {
                  const permisoId = Number(permiso?.id);
                  const permisoName = permiso?.name || permiso?.nombre || '-';
                  const checked = selectedPermisos.includes(permisoId);

                  return (
                    <tr key={permisoId || permisoName}>
                      <td>{permisoName}</td>
                      <td>
                        <label htmlFor="">
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
  )
}

export default AddRolesControl