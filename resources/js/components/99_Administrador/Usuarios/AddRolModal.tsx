import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { Roles } from '@/@types/mainTypes';
import { getRoles } from '@/store/Roles/rolesActions';

import { MdArrowForward, MdArrowBack } from 'react-icons/md';

import '@styles/99_Administrador/showSubModals.css'

interface addRolProps {
  isOpen: boolean;
  onClose: () => void;
  onRolesSelected: (selectedRoles: Roles[]) => void;
  initialSelectedRoles?: Roles[]; // Opcional: roles ya asociados al usuario

}

Modal.setAppElement('#root');

const addRol: React.FC<addRolProps> = ({ isOpen, onClose, onRolesSelected, initialSelectedRoles = [] }) => {

  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.roles.roles);
  const [availableRoles, setAvailableRoles] = useState<Roles[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Roles[]>(initialSelectedRoles);

  // Cargar roles y departamentos si no están disponibles
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(getRoles());
    }

  }, [dispatch, roles.length]);

  // Inicializar availableRoles cuando se carguen los roles
  useEffect(() => {
    if (roles.length > 0) {
      const filtered = roles.filter(
        (role) =>
          !selectedRoles.some((selected) => selected.id === role.id)
      );
      setAvailableRoles(filtered);
    }
  }, [roles, selectedRoles]);

  // Guardar y enviar roles seleccionados
  const handleSave = () => {
    onRolesSelected(selectedRoles);
    onClose();
  };

  // Agregar un rol de izquierda a derecha
  const handleAddRole = (role: Roles) => {
    setSelectedRoles([...selectedRoles, role]);
  };

  // Quitar un rol de derecha a izquierda
  const handleRemoveRole = (role: Roles) => {
    if (selectedRoles.length <= 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar al menos un rol.',
      });
      return;
    }
    const updatedRoles = selectedRoles.filter(
      (r) => r.id !== role.id
    );
    setSelectedRoles(updatedRoles);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal_Overlay_addRolesUsuario"
      className="modal_list_listRoles"
      contentLabel="Listado de Roles"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      
      <h2>Listado de Roles</h2>

      <div className="roles_table">
        <div className="roles_column">
          <h3>Rol Disponible</h3>
          <ul>
            {availableRoles.map((role) => (
              <li
                key={role.id}
                onClick={() => handleAddRole(role)}
                className="listRolesAdd"
              >
                {role.name}
                <MdArrowForward className="arrowIcon" />
              </li>
            ))}
          </ul>
        </div>

        <div className="roles_column">
          <h3>Rol Seleccionado</h3>
          <ul>
            {selectedRoles.map((role) => (
              <li
                key={role.id}
                onClick={() => handleRemoveRole(role)}
                className="listRolesAdd selected"
              >
                {role.name}
                <MdArrowBack className="arrowIcon" />
              </li>
            ))}
          </ul>
        </div>
      </div>


      <div className='buttons'>
        <button onClick={handleSave} className="button_save">
          Guardar
        </button>
        <button onClick={onClose} className="button_close">
        Cancelar
        </button>

      </div>

      


    </Modal>
  );
};

export default addRol;
 