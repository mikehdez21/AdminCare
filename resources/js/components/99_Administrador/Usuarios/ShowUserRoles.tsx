import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';

import { User, Roles } from '@/@types/mainTypes';
import { getRoles } from '@/store/Roles/rolesActions';

import '@styles/99_Administrador/showSubModals.css'

interface showUserRolesProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToShow: User | null;
}

Modal.setAppElement('#root');

const ShowUserRoles: React.FC<showUserRolesProps> = ({ isOpen, onClose, usuarioToShow }) => {
  console.log(usuarioToShow)

  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.roles.roles);
  const [rolesUsuario, setRolesUsuario] = useState<Roles[]>(usuarioToShow?.roles || []);
  
  // Cargar roles y departamentos si no están disponibles
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(getRoles());
    }

  }, [dispatch, roles.length]);

  useEffect(() => {
    if (usuarioToShow) {
  
      setRolesUsuario(usuarioToShow.roles || []);
  
    } else {

      setRolesUsuario([]);
    }
  }, [usuarioToShow]);
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal_Overlay_showRolesUsuario"
      className="modal_list_listRoles"
      contentLabel="Listado de Roles"
    >
      <h3>Roles Asignados al usuario {usuarioToShow?.nombre_usuario}</h3>

      

      <div className="list">
        <ul>
          {rolesUsuario.length > 0 ? (
            rolesUsuario.map((rol, index) => (
              <li className='listRolesShowOnly' key={index}>
                {rol.name}
              </li>
            ))
          ) : (
            <p>No tiene roles asignados.</p>
          )}
        </ul>
      </div>

      <div className='buttons'>
        <button onClick={onClose} className="button_close">
        Cerrar
        </button>

      </div>


      


    </Modal>
  );
};

export default ShowUserRoles;
 