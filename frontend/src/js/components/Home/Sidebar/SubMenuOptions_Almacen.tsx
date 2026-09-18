
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
import { MdInventory, MdWarehouse, MdOutlineKeyboardArrowUp } from 'react-icons/md';



interface MenuOptions_ParentProps {
  pathname: string;
  departamento: string;
}

const SubMenuOptions_Almacen: React.FC<MenuOptions_ParentProps> = ({ pathname }) => {
  const navigate = useNavigate();

  // Estados independientes para cada submenú
  const [isAlmacenSubMenuOpen, setIsAlmacenSubMenuOpen] = useState(false);
  const [isAlmacenRotated, setIsAlmacenRotated] = useState(false);

  const userPermissions = useSelector((s: RootState) => s.auth.permissions);

  // Manejo del submenú de Almacenes
  const toggleSubMenus_Almacen = () => {
    setIsAlmacenSubMenuOpen(!isAlmacenSubMenuOpen);
    setIsAlmacenRotated(!isAlmacenRotated);
  };

  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS — ahora solo navigate
  const handleSelectSection = (path: string) => {
    navigate(path); // Navegar a la URL correspondiente
  };

  return (

    <div id="SubMenu_Almacen">

      <div onClick={toggleSubMenus_Almacen} className='divMenu_SubMenus'>


        <div
          className={
            isSectionActive(pathname, '/almacen-general')
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


              {hasPermission(userPermissions, 'sidebar_submenu_almacenes_almacengeneral') && (
                <li
                  onClick={() => handleSelectSection('/almacen-general')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption1 ${isSectionActive(pathname, '/almacen-general') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >

                  <MdWarehouse /> <p>Almacen General</p>
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
