// Bibliotecas
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Icons
import { RiDashboardLine } from 'react-icons/ri';


// Permissions
import { hasActionPermission } from '@/utils/permissions.ts';

// Sections helpers
import { isSectionActive } from '@/router/sections';

// SubMenus Components
import SubMenuOptions_Almacen from './SubMenuOptions_Almacen';
import SubMenuOptions_Administrador from './SubMenuOptions_Administrador';
import SubMenuOptions_Contabilidad from './SubMenuOptions_Contabilidad';

import '@styles/Home/Home.css';

interface Sidebar_OptionsListProps {
  role: string; // Propiedad del rol del usuario
  departamento: string;
}

const Sidebar_OptionsList: React.FC<Sidebar_OptionsListProps> = ({ role, departamento }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userPermissions = useSelector((s: RootState) => s.auth.permissions);


  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS — ahora solo navigate
  const handleSelectSection = (path: string) => {
    navigate(path); // Navegar a la URL correspondiente
  };


  return (

    <ul className='Sidebar_Options'>

      {/* AdminDashboard */}
      {hasActionPermission(userPermissions, 'sidebar_menu_admindashboard', 'lectura') && (
        <li className={isSectionActive(location.pathname, '/admin') ? 'sidebar_SectionSelected' : ''}>
          <div onClick={() => handleSelectSection('/admin')} className="divOption_IconTitle" >
            <RiDashboardLine className='iconOption_Sidebar' /> <span>Admin Dashboard</span>
          </div>
        </li>
      )}


      {/* Almacenes */}
      {hasActionPermission(userPermissions, 'sidebar_menu_almacenes', 'lectura') && (
        <li>
          {/* Almacenes */}
          <div className="divOption_IconTitle">
            <SubMenuOptions_Almacen pathname={location.pathname} departamento={departamento} />
          </div>

        </li>
      )}


      {/* Contabilidad */}
      {hasActionPermission(userPermissions, 'sidebar_menu_contabilidad', 'lectura') && (
        <li
        >
          <div className="divOption_IconTitle" >
            <SubMenuOptions_Contabilidad pathname={location.pathname} role={role} departamento={departamento} />
          </div>
        </li>
      )}


      {/* Administrador */}
      {hasActionPermission(userPermissions, 'sidebar_menu_administrador', 'lectura') && (
        <li>
          <div className="divOption_IconTitle">
            <SubMenuOptions_Administrador pathname={location.pathname} role={role} departamento={departamento} />
          </div>

        </li>
      )}

    </ul>
  );
};

export default Sidebar_OptionsList;
