// Bibliotecas
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// subComponentes
import AlmacenGeneral_Facturas from './Options/Facturas/FacturasControl';
import AlmacenGeneral_Etiquetas from './Options/Etiquetas';
import AlmacenGeneral_Activos from './Options/ActivosFijos/ActivosFijosControl';

import AlmacenGeneral_ControlProveedor from './Options/Proveedores/ProveedorControl';
import AlmacenGeneral_ControlClasificacion from './Options/Parametros/Clasificaciones/ClasificacionControl';

// Icons
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/AlmacenGeneral.css';

const Main_AlmacenGeneral: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtén la ruta actual

  const [isRotated, setIsRotated] = React.useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(false);
  const [isLocationSelected, setIsLocationSelected] = React.useState(true);

  const toggleSubMenu_Parametros = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
    setIsRotated(!isRotated);
  };

  const handleSelectSection = (url: string) => {
    navigate(url); // Cambia la ruta en lugar de cambiar el estado
    setIsLocationSelected(false); 
    setIsSubMenuOpen(false);
  };

  return (
    <div className='divMain_AlmacenGeneral'>

      <nav className='navbar_AlmacenGeneral'>
        <ul>

          <li
            onClick={() => handleSelectSection('/almacen_general/facturas')}
            className={location.pathname === '/almacen_general/facturas' ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Facturas</p>
          </li>

            
          <li
            onClick={() => handleSelectSection('/almacen_general/activos')}
            className={location.pathname === '/almacen_general/activos' ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Activos</p>
          </li>

            
          <li
            onClick={() => handleSelectSection('/almacen_general/etiquetas')}
            className={location.pathname === '/almacen_general/etiquetas' ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Etiquetas</p>
          </li>

          <li 
            onClick={() => handleSelectSection('/almacen_general/proveedores')}
            className={location.pathname === '/almacen_general/proveedores' ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Proveedores</p>
          </li>


          <li onClick={toggleSubMenu_Parametros}
            className={
              location.pathname.includes('/almacen_general/params') ? 'selectedNavbarAlmacen' : ''
            }
          >

            <div className='paramsTitle'>
              <p>Parámetros</p>
              <MdOutlineKeyboardArrowUp className={`IconSubMenu ${isRotated ? 'rotate' : ''}`} />
            </div>

            <div className='subMenu_Params'>
                
              {isSubMenuOpen && (
                <ul>
                  <li
                    id='subMenu1'
                    className={location.pathname === '/almacen_general/params/regClasificacion' ? 'selectedNavbarAlmacen_subMenu' : ''}
                    onClick={() => handleSelectSection('/almacen_general/params/regClasificacion')}
                  >
                      Clasificación AF
                  </li>
                  

                  
       

                </ul>
              )}

            </div>

          </li>

        </ul>
      </nav>

      { isLocationSelected ? 
        <div className='noLocationSelected'>
          <p>  Selecciona una opción del submenú superior </p> 
        </div>

        :

        <div className='div_Content'>
          {location.pathname === '/almacen_general/activos' && <AlmacenGeneral_Activos />}
          {location.pathname === '/almacen_general/facturas' && <AlmacenGeneral_Facturas />}
          {location.pathname === '/almacen_general/etiquetas' && <AlmacenGeneral_Etiquetas />}
          {location.pathname === '/almacen_general/proveedores' && <AlmacenGeneral_ControlProveedor />}

          {location.pathname === '/almacen_general/params/regClasificacion' && <AlmacenGeneral_ControlClasificacion />}
        </div>
      }  

    </div>
  );
};

export default Main_AlmacenGeneral;
