
// Bibliotecas
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Permissions
import { hasPermission } from '@/utils/permissions.ts';

// Sections helpers
import { isSectionActive } from '@/router/sections';

// Icons
import { MdOutlineKeyboardArrowUp, MdOutlinePersonPin } from 'react-icons/md';
import { RiUserSettingsFill } from 'react-icons/ri';
import { FaUsersGear } from 'react-icons/fa6';
import { MdOutlineAdminPanelSettings, MdOutlineGroups3, MdPlace } from 'react-icons/md';



// Styles

interface MenuOptions_ParentProps {
  pathname: string;
  role: string;
  departamento: string;
}


const SubMenuOptions_Administrador: React.FC<MenuOptions_ParentProps> = ({ pathname }) => {
  const navigate = useNavigate();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminRotated, setIsAdminRotated] = useState(false);


  const userPermissions = useSelector((s: RootState) => s.auth.permissions);

  // Manejo del submenú de Administrador
  const toggleSubMenus_Administrador = () => {
    setIsAdminOpen(!isAdminOpen);
    setIsAdminRotated(!isAdminRotated);
  };

  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS — ahora solo navigate
  const handleSelectSection = (path: string) => {
    navigate(path); // Navegar a la URL correspondiente
  };

  // El padre "Administrador" está activo si la URL pertenece a cualquiera de sus hijos
  const isAdminActive =
    isSectionActive(pathname, '/gestion-usuarios') ||
    isSectionActive(pathname, '/gestion-empleados') ||
    isSectionActive(pathname, '/gestion-roles') ||
    isSectionActive(pathname, '/gestion-departamentos') ||
    isSectionActive(pathname, '/gestion-ubicaciones');

  return (

    <div id='SubMenu_Administrador'>


      <div onClick={toggleSubMenus_Administrador} className='divMenu_SubMenus'>


        <div
          className={
            isAdminActive
              ? 'SubMenu_IconTitle sidebar_SectionSelected'
              : 'SubMenu_IconTitle'
          }
        >
          <MdOutlineAdminPanelSettings className='iconOption_Sidebar' />
          <span>Administrador </span>
          <MdOutlineKeyboardArrowUp className={`IconSubMenuArrow ${isAdminRotated ? 'rotate' : ''}`} />
        </div>




        {/* Submenu Administrador */}
        <div className="SubMenu_Options">
          {isAdminOpen && (


            <ul>

              {hasPermission(userPermissions, 'sidebar_submenu_administrador_gestionusuarios') && (
                <li
                  onClick={() => handleSelectSection('/gestion-usuarios')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption1 ${isSectionActive(pathname, '/gestion-usuarios') ? 'sidebar_Section_SubMenuSelected' : ''}`}

                >
                  <RiUserSettingsFill /> <p>Gestión de Usuarios</p>
                </li>
              )}

              {hasPermission(userPermissions, 'sidebar_submenu_administrador_gestionempleados') && (
                <li
                  onClick={() => handleSelectSection('/gestion-empleados')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption2 ${isSectionActive(pathname, '/gestion-empleados') ? 'sidebar_Section_SubMenuSelected' : ''}`}

                >
                  <MdOutlinePersonPin /> <p>Gestión de Empleados</p>
                </li>
              )}

              {hasPermission(userPermissions, 'sidebar_submenu_administrador_gestionroles') && (
                <li
                  onClick={() => handleSelectSection('/gestion-roles')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption3 ${isSectionActive(pathname, '/gestion-roles') ? 'sidebar_Section_SubMenuSelected' : ''}`}

                >
                  <FaUsersGear /> <p>Gestión de Roles</p>
                </li>
              )}

              {hasPermission(userPermissions, 'sidebar_submenu_administrador_gestiondepartamentos') && (
                <li
                  onClick={() => handleSelectSection('/gestion-departamentos')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption4 ${isSectionActive(pathname, '/gestion-departamentos') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdOutlineGroups3 /> <p>Gestión de Departamentos</p>
                </li>
              )}

              {hasPermission(userPermissions, 'sidebar_submenu_administrador_gestionubicaciones') && (
                <li
                  onClick={() => handleSelectSection('/gestion-ubicaciones')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption5 ${isSectionActive(pathname, '/gestion-ubicaciones') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdPlace /> <p>Gestión de Ubicaciones</p>
                </li>
              )}


            </ul>
          )}

        </div>
      </div>
    </div>
  )
}

export default SubMenuOptions_Administrador
