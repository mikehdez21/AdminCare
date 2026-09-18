// Bibliotecas
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Components
import Sidebar_OptionsList from './Sidebar_OptionsList';

// Icons
import { MdOutlineManageSearch } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';
import { SlLogout } from 'react-icons/sl';

// Interface
import { User } from '@/@types/mainTypes';

// Utils
import { getAppName } from '@/utils/getAppName';

interface SideBarProps {
  currentUser: User;
  onOpenLogoutModal: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ currentUser, onOpenLogoutModal }) => {
  const navigate = useNavigate();

  const rol = useSelector((state: RootState) => state.auth.rol);
  const departamento = useSelector((state: RootState) => state.auth.departamento);
  const rolSinComillas = rol ?? '';
  const deptoSinComillas = departamento ?? '';

  const handleSelectSection = () => {
    if (rolSinComillas) {
      switch (rolSinComillas) {
      case 'Admin':
        navigate('/admin');
        break;
      case 'JAlmacenGeneral':
        navigate('/app');
        break;
      default:
        navigate('/app');
        break;
      }
    }
  };

  return (
    <div className='Sidebar'>
      <div className="Sidebar_Header">
        <div className="navBarHeader_title">
          <h1 onClick={() => handleSelectSection()} className="navBarHeader_text">{getAppName()}</h1>
        </div>

        <hr className="navBarHeader_Divisor" />

        <div className="navBarHeader_avatarlogout">
          <div className='avatar'>
            <RxAvatar className="navBarHeader_avatar" />
            <p>{currentUser ? currentUser.nombre_usuario : 'Cargando usuario...'}</p>

          </div>

          <div className='logout' onClick={onOpenLogoutModal}>
            <SlLogout className="navBarHeader_logout" />
            <p>Cerrar Sesión</p>
          </div>
        </div>
      </div>

      <div className="Sidebar_OptionsSearch">
        <div className="navBar_Search">
          <MdOutlineManageSearch className="navBarSearch_icon" />
          <input
            className="navBarSearch_input"
            id="searchSection" // Added id
            name="searchSection"
            type='search'
            placeholder="  Buscar sección"
          />
        </div>
      </div>

      <div className="Sidebar_OptionsList">
        {currentUser && <Sidebar_OptionsList role={rolSinComillas} departamento={deptoSinComillas} />}
      </div>
    </div>
  );
}

export default SideBar;
