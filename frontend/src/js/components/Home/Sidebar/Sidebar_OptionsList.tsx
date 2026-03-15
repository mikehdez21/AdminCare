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

// SubMenus Components
import SubMenuOptions_Almacen from './SubMenuOptions_Almacen';
import SubMenuOptions_Administrador from './SubMenuOptions_Administrador';

import '@styles/Home/PageHome.css';

interface Sidebar_OptionsListProps {
  role: string; // Propiedad del rol del usuario
  departamento: string;
}

const Sidebar_OptionsList: React.FC<Sidebar_OptionsListProps> = ({ role, departamento }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedSection = useSelector((state: RootState) => state.section.selectedSection); // Obtener sección seleccionada de Redux


  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS
  const handleSelectSection = (section: string, path: string) => {
    dispatch(setSelectedSection(section)); // Actualizar sección seleccionada en Redux
    localStorage.setItem('selectedSection', section); // Actualizar sección en LocalStorage
    navigate(path); // Navegar a la URL correspondiente
  };


  return (

    <ul className='Sidebar_Options'>
      
      <li
        className={selectedSection === 'AdminDashboard' ? 'sidebar_SectionSelected' : ''}
      >
        {/* AdminDashboard */}
        {role === 'Admin' && (
          <div onClick={() => handleSelectSection('AdminDashboard', '/admin')} 
            className="divOption_IconTitle" >
            <RiDashboardLine className='iconOption_Sidebar'/> <span>Admin - Dashboard</span>
          </div>
        )}
      </li>


      <li
        className={selectedSection === 'JefaturaDashboard' ? 'sidebar_SectionSelected' : ''}
      >
        {/* JefaturaDashboard */}
        {(role === 'Admin' || role === 'JSistemas' || role === 'JAlmacenGeneral') && (
          <div onClick={() => handleSelectSection('JefaturaDashboard', '/dashboard')} className="divOption_IconTitle">
            <RiDashboardLine className='iconOption_Sidebar' /> <span>Jefatura - Dashboard</span>
          </div>
        )}
      </li>


      <li
        className={selectedSection === 'HomeUsuario' ? 'sidebar_SectionSelected' : ''}
      >
        {/* HomeUsuario */}
        {(role === 'Admin' || role === 'Usuario') && (
          <div onClick={() => handleSelectSection('HomeUsuario', '/home')} className="divOption_IconTitle">
            <RiDashboardLine className='iconOption_Sidebar' /> <span>Home - Dashboard</span>
          </div>
        )}
      </li>


      <li
        className={selectedSection === 'Helpdesk' ? 'sidebar_SectionSelected' : ''}
      >
        {/* Helpdesk */}
        <div className="divOption_IconTitle">
          <BiSupport className='iconOption_Sidebar' /> <span>Helpdesk</span>
        
        </div>
      </li>


      <li>
        {/* Almacenes */}
        <div className="divOption_IconTitle">
          {(role === 'Admin' || role === 'JSistemas' || role === 'JAlmacenGeneral' || role === 'Usuario') && (
            <SubMenuOptions_Almacen selectedSection = {selectedSection} role={role} departamento = {departamento} />
          )}
        </div>

      </li>


      <li>
        {/* Administrador */}
        <div className="divOption_IconTitle">
          {(role === 'Admin') && (
            <SubMenuOptions_Administrador selectedSection = {selectedSection} role={role} departamento = {departamento}/>
          )}
        </div>

      </li>

      

      

    </ul>
  );
};

export default Sidebar_OptionsList;
