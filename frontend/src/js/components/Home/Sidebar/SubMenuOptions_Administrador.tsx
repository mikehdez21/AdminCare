
// Bibliotecas
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; 
import { setSelectedSection } from '@/store/sectionReducer'; 

// Icons
import { MdOutlineKeyboardArrowUp, MdOutlinePersonPin  } from 'react-icons/md';
import { RiUserSettingsFill  } from 'react-icons/ri';
import { FaUsersGear } from 'react-icons/fa6';
import { MdOutlineAdminPanelSettings, MdOutlineGroups3, MdPlace } from 'react-icons/md';



// Styles

interface MenuOptions_ParentProps {
    selectedSection: string;
    role: string;
    departamento: string;
  }


const SubMenuOptions_Administrador: React.FC<MenuOptions_ParentProps> = ({ selectedSection }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
    
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminRotated, setIsAdminRotated] = useState(false);
    
  // Manejo del submenú de Administrador
  const toggleSubMenus_Administrador = () => {
    setIsAdminOpen(!isAdminOpen);
    setIsAdminRotated(!isAdminRotated);
  };

  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS
  const handleSelectSection = (section: string, path: string) => {
    dispatch(setSelectedSection(section)); // Actualizar sección seleccionada en Redux
    localStorage.setItem('selectedSection', section); // Actualizar sección en LocalStorage
    navigate(path); // Navegar a la URL correspondiente
  };
  
  return (

    <div id='SubMenu_Administrador'>


      <div onClick={toggleSubMenus_Administrador} className='divMenu_SubMenus'>


        <div
          className={
            ['GestionUsuarios', 'GestionDepartamentos', 'GestionRoles', 'GestionEmpleados', 'GestionUbicaciones'].includes(selectedSection)
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

              <li
                onClick={() => handleSelectSection('GestionUsuarios', '/gestion_usuarios')}
                id='SubMenu_Option'
                className={`subMenuOption delayOption1 ${selectedSection === 'GestionUsuarios' ? 'sidebar_Section_SubMenuSelected' : ''}`}

              >
                <RiUserSettingsFill /> <p>Gestión de Usuarios</p>
              </li>


              <li
                onClick={() => handleSelectSection('GestionEmpleados', '/gestion_empleados')}
                id='SubMenu_Option'
                className={`subMenuOption delayOption2 ${selectedSection === 'GestionEmpleados' ? 'sidebar_Section_SubMenuSelected' : ''}`}

              >
                <MdOutlinePersonPin /> <p>Gestión de Empleados</p>
              </li>


              <li
                onClick={() => handleSelectSection('GestionRoles', '/gestion_roles')}
                id='SubMenu_Option'
                className={`subMenuOption delayOption3 ${selectedSection === 'GestionRoles' ? 'sidebar_Section_SubMenuSelected' : ''}`}

              >
                <FaUsersGear /> <p>Gestión de Roles</p>
              </li>


              <li
                onClick={() => handleSelectSection('GestionDepartamentos', '/gestion_departamentos')}
                id='SubMenu_Option'
                className={`subMenuOption delayOption4 ${selectedSection === 'GestionDepartamentos' ? 'sidebar_Section_SubMenuSelected' : ''}`}
              >
                <MdOutlineGroups3 /> <p>Gestión de Departamentos</p>  
              </li>

              <li
                onClick={() => handleSelectSection('GestionUbicaciones', '/gestion_ubicaciones')}
                id='SubMenu_Option'
                className={`subMenuOption delayOption5 ${selectedSection === 'GestionUbicaciones' ? 'sidebar_Section_SubMenuSelected' : ''}`}
              >
                <MdPlace/> <p>Gestión de Ubicaciones</p>  
              </li>


            </ul>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default SubMenuOptions_Administrador