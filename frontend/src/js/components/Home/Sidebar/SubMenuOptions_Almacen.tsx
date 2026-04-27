
// Bibliotecas
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedSection } from '@/store/sectionReducer';

// Icons
import { MdInventory, MdWarehouse, MdCleanHands, MdOutlineKeyboardArrowUp } from 'react-icons/md';



interface MenuOptions_ParentProps {
  selectedSection: string;
  role: string;
  departamento: string;
}

const SubMenuOptions_Almacen: React.FC<MenuOptions_ParentProps> = ({ selectedSection, role, departamento }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados independientes para cada submenú
  const [isAlmacenSubMenuOpen, setIsAlmacenSubMenuOpen] = useState(false);
  const [isAlmacenRotated, setIsAlmacenRotated] = useState(false);

  // Manejo del submenú de Almacenes
  const toggleSubMenus_Almacen = () => {
    setIsAlmacenSubMenuOpen(!isAlmacenSubMenuOpen);
    setIsAlmacenRotated(!isAlmacenRotated);
  };

  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS
  const handleSelectSection = (section: string, path: string) => {
    dispatch(setSelectedSection(section)); // Actualizar sección seleccionada en Redux
    localStorage.setItem('selectedSection', section); // Actualizar sección en LocalStorage
    navigate(path); // Navegar a la URL correspondiente
  };

  return (

    <div id="SubMenu_Almacen">

      <div onClick={toggleSubMenus_Almacen} className='divMenu_SubMenus'>


        <div
          className={
            ['Almacen', 'ServiciosGenerales', 'FarmaciaInterna'].includes(selectedSection)
              ? 'SubMenu_IconTitle sidebar_SectionSelected'
              : 'SubMenu_IconTitle'
          }
        >
          <MdInventory className='iconOption_Sidebar' />
          <span>Almacenes </span>
          <MdOutlineKeyboardArrowUp className={`IconSubMenuArrow ${isAlmacenRotated ? 'rotate' : ''}`} />
        </div>


        {/* Submenu Inventarios */}
        <div className="SubMenu_Options">
          {isAlmacenSubMenuOpen && (

            <ul>


              {(role === 'Admin' || role === 'JAlmacenGeneral') && (
                <li
                  onClick={() => handleSelectSection('Almacen', '/almacen_general')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption1 ${selectedSection === 'Almacen' ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >

                  <MdWarehouse /> <p>Almacen General</p>
                </li>
              )}


              {(role === 'Admin' || departamento === 'ServiciosGenerales') && (
                <li
                  onClick={() => handleSelectSection('ServiciosGenerales', '/servicios_generales')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption2 ${selectedSection === 'ServiciosGenerales' ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >

                  <MdCleanHands /> <p>Servicios Generales</p>
                </li>
              )}


            </ul>
          )}

        </div>
      </div>
    </div>
  )
}

export default SubMenuOptions_Almacen