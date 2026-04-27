// Bibliotecas
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedSection } from '@/store/sectionReducer'; // Acción para cambiar la sección

// Components
import Sidebar_OptionsList from './Sidebar_OptionsList';

// Icons
import { MdOutlineManageSearch } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';
import { SlLogout } from 'react-icons/sl';

// Interface
import { User } from '@/@types/mainTypes';

interface SideBarProps {
  currentUser: User;
  onOpenLogoutModal: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ currentUser, onOpenLogoutModal }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const storedRol = localStorage.getItem('userRol');
  const rolSinComillas = storedRol ? storedRol.replace(/"/g, '') : '';

  const storedDepto = localStorage.getItem('userDepartamento');
  const deptoSinComillas = storedDepto ? storedDepto.replace(/"/g, '') : '';



  const handleSelectSection = () => {
    if (rolSinComillas) {
      let defaultSection = ''; // Sección predeterminada

      switch (rolSinComillas) {
        case 'Admin':
          defaultSection = 'AdminDashboard';
          navigate('/admin');
          break;
        case 'JAlmacenGeneral':
          defaultSection = 'Home';
          navigate('/home');
          break;
        default:
          defaultSection = 'Home';
          navigate('/home');
          break;
      }

      dispatch(setSelectedSection(defaultSection));
      localStorage.setItem('selectedSection', defaultSection); // Actualizar sección en LocalStorage

    }
  };


  return (
    <div className='Sidebar'>
      <div className="Sidebar_Header">
        <div className="navBarHeader_title">
          <img
            onClick={() => handleSelectSection()}
            src='../../../../img/logo/design3Blanco_x512.png'
            alt="Logo en Sidebar"
            className="navBarHeader_img"
          />
          <h1 onClick={() => handleSelectSection()} className="navBarHeader_text">Hospital San Serafin</h1>
        </div>

        <hr className="navBarHeader_Divisor" />

        <div className="navBarHeader_avatarlogout">
          <div className='avatar'>
            <RxAvatar className="navBarHeader_avatar" />
            <p>{currentUser ? currentUser.nombre_usuario : 'Cargando...'}</p>

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
