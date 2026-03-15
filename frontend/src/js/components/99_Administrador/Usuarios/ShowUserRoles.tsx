import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';

import { User, Roles } from '@/@types/mainTypes';
import { getRoles } from '@/store/administrador/Roles/rolesActions';

import '@styles/99_Administrador/showSubModals.css'
import ModalButtons from '@/components/00_Utils/ModalButtons';

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
      className="modalShowListRoles"
      contentLabel="Listado de Roles"
    >
      <div className="mainDiv_modalShowRoles">

        <h3>Roles Asignados</h3>
        <h4>{usuarioToShow?.nombre_usuario}</h4>

      

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

    </Modal>
  );
};

export default ShowUserRoles;
 