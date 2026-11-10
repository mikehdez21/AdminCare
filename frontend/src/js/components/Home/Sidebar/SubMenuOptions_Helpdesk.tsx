// Bibliotecas
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Permissions
import { hasActionPermission } from '@/utils/permissions.ts';

// Sections helpers
import { isSectionActive } from '@/router/sections';

// Icons
import { BiSupport } from 'react-icons/bi';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { MdAddCircleOutline } from 'react-icons/md';
import { MdListAlt } from 'react-icons/md';
import { MdSupportAgent } from 'react-icons/md';
import { MdQueryStats } from 'react-icons/md';
import { MdSettings } from 'react-icons/md';

interface SubMenuOptions_HelpdeskProps {
  pathname: string;
}

/**
 * Submenú del Helpdesk.
 *
 * La cadena de acciones la resuelve `hasActionPermission`: `escritura` implica
 * `lectura` y `eliminar` implica ambas. El alcance de la mesa lo decide el
 * backend por departamento, no esta pantalla.
 */
const SubMenuOptions_Helpdesk: React.FC<SubMenuOptions_HelpdeskProps> = ({ pathname }) => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  const userPermissions = useSelector((s: RootState) => s.auth.permissions);

  const toggleSubMenus = () => {
    setIsOpen(!isOpen);
    setIsRotated(!isRotated);
  };

  const handleSelectSection = (path: string) => {
    navigate(path);
  };

  // El padre queda activo si la URL es la de cualquiera de sus hijos.
  const isHelpdeskActive =
    isSectionActive(pathname, '/helpdesk/mis-tickets') ||
    isSectionActive(pathname, '/helpdesk/ticket') ||
    isSectionActive(pathname, '/helpdesk/mesas') ||
    isSectionActive(pathname, '/helpdesk/admin') ||
    isSectionActive(pathname, '/helpdesk/dashboard') ||
    isSectionActive(pathname, '/helpdesk/configuracion');

  const puedeCrear = hasActionPermission(userPermissions, 'helpdesk.mis_tickets', 'escritura');
  const puedeVerMisTickets = hasActionPermission(userPermissions, 'helpdesk.mis_tickets', 'lectura');
  const puedeVerMesa = hasActionPermission(userPermissions, 'helpdesk.tickets', 'lectura');
  const puedeVerReportes = hasActionPermission(userPermissions, 'helpdesk.reportes', 'lectura');
  const puedeVerConfiguracion = hasActionPermission(userPermissions, 'helpdesk.configuracion', 'lectura');

  // Sin ningún permiso de lectura no hay nada que mostrar dentro del submenú.
  if (!puedeCrear && !puedeVerMisTickets && !puedeVerMesa && !puedeVerReportes && !puedeVerConfiguracion) {
    return null;
  }

  return (
    <div id='SubMenu_Helpdesk'>

      <div onClick={toggleSubMenus} className='divMenu_SubMenus'>

        <div
          className={
            isHelpdeskActive || isSectionActive(pathname, '/helpdesk')
              ? 'SubMenu_IconTitle sidebar_SectionSelected'
              : 'SubMenu_IconTitle'
          }
        >
          <BiSupport className='iconOption_Sidebar' />
          <span>Helpdesk </span>
          <MdOutlineKeyboardArrowUp className={`IconSubMenuArrow ${isRotated ? 'rotate' : ''}`} />
        </div>

        <div className="SubMenu_Options">
          {isOpen && (

            <ul>

              {puedeCrear && (
                <li
                  onClick={() => handleSelectSection('/helpdesk')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption1 ${isSectionActive(pathname, '/helpdesk') && !isHelpdeskActive ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdAddCircleOutline /> <p>Nuevo Ticket</p>
                </li>
              )}

              {puedeVerMisTickets && (
                <li
                  onClick={() => handleSelectSection('/helpdesk/mis-tickets')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption2 ${isSectionActive(pathname, '/helpdesk/mis-tickets') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdListAlt /> <p>Mis Tickets</p>
                </li>
              )}

              {puedeVerMesa && (
                <li
                  onClick={() => handleSelectSection('/helpdesk/mesas')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption3 ${isSectionActive(pathname, '/helpdesk/mesas') || isSectionActive(pathname, '/helpdesk/admin') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdSupportAgent /> <p>Mesas de Ayuda</p>
                </li>
              )}

              {puedeVerReportes && (
                <li
                  onClick={() => handleSelectSection('/helpdesk/dashboard')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption4 ${isSectionActive(pathname, '/helpdesk/dashboard') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdQueryStats /> <p>Dashboard</p>
                </li>
              )}

              {puedeVerConfiguracion && (
                <li
                  onClick={() => handleSelectSection('/helpdesk/configuracion')}
                  id='SubMenu_Option'
                  className={`subMenuOption delayOption5 ${isSectionActive(pathname, '/helpdesk/configuracion') ? 'sidebar_Section_SubMenuSelected' : ''}`}
                >
                  <MdSettings /> <p>Configuración</p>
                </li>
              )}

            </ul>
          )}

        </div>
      </div>
    </div>
  )
}

export default SubMenuOptions_Helpdesk;