/*
  PENDIENTE: 

  REALIZAR IMPLEMENTACIÓN CORRECTA EN BACKEND CON UN SISTEMA QUE GESTIONE LOS ACCESOS Y PERMISOS
  MEDIANTE EL ROL Y DEPARTAMENTO QUE CADA USUARIO PUEDE TENER, ESTO CON MIGRACIONES, CONTROLADORES Y MODELOS RESPECTIVOS
  CON LA FINALIDAD DE PODER COLOCAR MEDIANTE UNA INTERFAZ DE ADMINISTRACION LA ASIGNACIONES DE PERMISOS Y ACCESOS A LAS SECCIONES DEL MENU
  
*/



// Bibliotecas
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSelectedSection } from '@/store/sectionReducer';

// Icons
import { RiDashboardLine } from 'react-icons/ri';
import { BiSupport } from 'react-icons/bi';
import { FaHome } from "react-icons/fa";


// Permissions
import { hasPermission } from '@/utils/permissions.ts';

// SubMenus Components
import SubMenuOptions_Almacen from './SubMenuOptions_Almacen';
import SubMenuOptions_Administrador from './SubMenuOptions_Administrador';
import SubMenuOptions_Contabilidad from './SubMenuOptions_Contabilidad';

import '@styles/Home/PageHome.css';

interface Sidebar_OptionsListProps {
  role: string; // Propiedad del rol del usuario
  departamento: string;
}

const Sidebar_OptionsList: React.FC<Sidebar_OptionsListProps> = ({ role, departamento }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedSection = useSelector((state: RootState) => state.section.selectedSection); // Obtener sección seleccionada de Redux

  const userPermissionsFromStore = useSelector((s: RootState) => s.auth.permissions);
  const userPermissions = userPermissionsFromStore.length > 0
    ? userPermissionsFromStore
    : JSON.parse(localStorage.getItem('userRolPermissions') || '[]');


  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS
  const handleSelectSection = (section: string, path: string) => {
    dispatch(setSelectedSection(section)); // Actualizar sección seleccionada en Redux
    localStorage.setItem('selectedSection', section); // Actualizar sección en LocalStorage
    navigate(path); // Navegar a la URL correspondiente
  };


  return (

    <ul className='Sidebar_Options'>

      {/* Home */}
      {hasPermission(userPermissions, 'sidebar_menu_home') && (
        <li
          className={selectedSection === 'Home' ? 'sidebar_SectionSelected' : ''}
        >
          <div onClick={() => handleSelectSection('Home', '/home')} className="divOption_IconTitle">
            <FaHome className='iconOption_Sidebar' /> <span>Home</span>
          </div>
        </li>
      )}


      {/* Helpdesk */}
      {hasPermission(userPermissions, 'sidebar_menu_helpdesk') && (
        <li
          className={selectedSection === 'Helpdesk' ? 'sidebar_SectionSelected' : ''}
        >
          <div className="divOption_IconTitle">
            <BiSupport className='iconOption_Sidebar' /> <span>Helpdesk</span>

          </div>
        </li>
      )}


      {/* AdminDashboard */}
      {hasPermission(userPermissions, 'sidebar_menu_admindashboard') && (
        <li className={selectedSection === 'AdminDashboard' ? 'sidebar_SectionSelected' : ''}>
          <div onClick={() => handleSelectSection('AdminDashboard', '/admin')} className="divOption_IconTitle" >
            <RiDashboardLine className='iconOption_Sidebar' /> <span>Admin Dashboard</span>
          </div>
        </li>
      )}


      {/* Almacenes */}
      {hasPermission(userPermissions, 'sidebar_menu_almacenes') && (
        <li>
          {/* Almacenes */}
          <div className="divOption_IconTitle">
            <SubMenuOptions_Almacen selectedSection={selectedSection} departamento={departamento} />
          </div>

        </li>
      )}


      {/* Contabilidad */}
      {hasPermission(userPermissions, 'sidebar_menu_contabilidad') && (
        <li
        >
          <div className="divOption_IconTitle" >
            <SubMenuOptions_Contabilidad selectedSection={selectedSection} role={role} departamento={departamento} />
          </div>
        </li>
      )}


      {/* Administrador */}
      {hasPermission(userPermissions, 'sidebar_menu_administrador') && (
        <li>
          <div className="divOption_IconTitle">
            <SubMenuOptions_Administrador selectedSection={selectedSection} role={role} departamento={departamento} />
          </div>

        </li>
      )}









    </ul>
  );
};

export default Sidebar_OptionsList;
