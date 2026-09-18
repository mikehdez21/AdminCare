
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
import { TbReportMoney } from 'react-icons/tb';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';
import { FaGears } from 'react-icons/fa6';




// Styles

interface MenuOptions_ParentProps {
    pathname: string;
    role: string;
    departamento: string;
}


const SubMenuOptions_Contabilidad: React.FC<MenuOptions_ParentProps> = ({ pathname }) => {
  const navigate = useNavigate();

  const [isContabilidadOpen, setIsContabilidadOpen] = useState(false);
  const [isContabilidadRotated, setIsContabilidadRotated] = useState(false);

  const userPermissions = useSelector((s: RootState) => s.auth.permissions);

  // Manejo del submenú de Contabilidad
  const toggleSubMenus_Contabilidad = () => {
    setIsContabilidadOpen(!isContabilidadOpen);
    setIsContabilidadRotated(!isContabilidadRotated);
  };

  // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS — ahora solo navigate
  const handleSelectSection = (path: string) => {
    navigate(path); // Navegar a la URL correspondiente
  };

  // El padre "Contabilidad" está activo si la URL pertenece a cualquiera de sus hijos
  const isContabilidadActive =
    isSectionActive(pathname, '/contabilidad/depreciacion-af') ||
    isSectionActive(pathname, '/contabilidad/configuracion') ||
    isSectionActive(pathname, '/contabilidad/auditoria');

  return (

    <div id='SubMenu_Contabilidad'>


      <div onClick={toggleSubMenus_Contabilidad} className='divMenu_SubMenus'>

        <div
          className={
            isContabilidadActive
              ? 'SubMenu_IconTitle sidebar_SectionSelected'
              : 'SubMenu_IconTitle'
          }
        >
          <TbReportMoney className='iconOption_Sidebar' />
          <span>Contabilidad </span>
          <MdOutlineKeyboardArrowUp className={`IconSubMenuArrow ${isContabilidadRotated ? 'rotate' : ''}`} />
        </div>


        {/* Submenu Contabilidad */}
        <div className="SubMenu_Options">
          {isContabilidadOpen && (


            <ul>

              {hasPermission(userPermissions, 'sidebar_submenu_contabilidad_depreciacionaf') && (
                <li
                  onClick={() => handleSelectSection('/contabilidad/depreciacion-af')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption1 ${isSectionActive(pathname, '/contabilidad/depreciacion-af') ? 'sidebar_Section_SubMenuSelected' : ''}`}

                >
                  <HiArchiveBoxArrowDown /> <p>Depreciación de ActivosFijos</p>
                </li>
              )}

              {hasPermission(userPermissions, 'sidebar_submenu_contabilidad_configuracion') && (
                <li
                  onClick={() => handleSelectSection('/contabilidad/configuracion')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption2 ${isSectionActive(pathname, '/contabilidad/configuracion') ? 'sidebar_Section_SubMenuSelected' : ''}`}

                >
                  <FaGears /> <p>Configuración</p>
                </li>
              )}


            </ul>
          )}

        </div>
      </div>
    </div>
  )
}

export default SubMenuOptions_Contabilidad;
