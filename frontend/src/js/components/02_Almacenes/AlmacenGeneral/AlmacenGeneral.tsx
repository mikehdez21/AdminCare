// Bibliotecas
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';



// subComponentes
import AlmacenGeneral_Facturas from './Facturas/FacturasControl';
import AlmacenGeneral_Etiquetas from './Etiquetas/EtiquetasControl';
import AlmacenGeneral_Activos from './ActivosFijos/ActivosFijosControl';
import AlmacenGeneral_MovimientosAF from './MovimientosAF/MovimientosAFControl';
import AlmacenGeneral_ControlProveedor from './Proveedores/ProveedorControl';
import AlmacenGeneralCharts from './AlmacenGeneralCharts';

// -- Parámetros --
import AlmacenGeneral_ControlClasificacion from './Parametros/Clasificaciones/ClasificacionControl';
import AlmacenGeneral_ControlTipoFactura from './Parametros/TipoFactura/TipoFacturaControl';
import AlmacenGeneral_ControlFormaPago from './Parametros/FormaPago/FormaPagoControl';
import AlmacenGeneral_ControlTipoMoneda from './Parametros/TipoMoneda/TipoMonedaControl';
import AlmacenGeneral_ControlEstatusAF from './Parametros/EstatusAF/EstatusAFControl';

// Permissions
import { hasPermission } from '@/utils/permissions.ts';

// Icons
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/AlmacenGeneral.css';

const Main_AlmacenGeneral: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtén la ruta actual

  const [isRotated, setIsRotated] = React.useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(false);

  const userPermissions = useSelector((s: RootState) => s.auth.permissions);

  const isKnownSection =
    location.pathname.startsWith('/almacen-general/facturas') ||
    location.pathname.startsWith('/almacen-general/activos') ||
    location.pathname.startsWith('/almacen-general/movimientos-activos') ||
    location.pathname.startsWith('/almacen-general/etiquetas') ||
    location.pathname.startsWith('/almacen-general/proveedores') ||
    location.pathname.startsWith('/almacen-general/params/clasificacion-af') ||
    location.pathname.startsWith('/almacen-general/params/tipo-factura') ||
    location.pathname.startsWith('/almacen-general/params/forma-pago') ||
    location.pathname.startsWith('/almacen-general/params/tipo-moneda') ||
    location.pathname.startsWith('/almacen-general/params/estatus-af');


  const handleOpenSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
    setIsRotated(!isRotated);
  };

  const handleSelectSection = (url: string) => {
    setIsSubMenuOpen(false);
    setIsRotated(false);
    navigate(url); // Cambia la ruta en lugar de cambiar el estado

  };


  return (
    <div className='divMain_AlmacenGeneral'>

      <nav className='navbar_AlmacenGeneral'>
        <ul>

          {hasPermission(userPermissions, 'almacengeneral_navbar_inicio') && (
            <li
              onClick={() => handleSelectSection('/almacen-general')}
              className={location.pathname === '/almacen-general' ? 'selectedNavbarAlmacen' : ''}
            >
              <p>Inicio</p>

            </li>
          )}

          {hasPermission(userPermissions, 'almacengeneral_navbar_facturas') && (
            <li
              onClick={() => handleSelectSection('/almacen-general/facturas')}
              className={location.pathname.startsWith('/almacen-general/facturas') ? 'selectedNavbarAlmacen' : ''}
            >
              <p>Facturas</p>
            </li>
          )}


          {hasPermission(userPermissions, 'almacengeneral_navbar_activos') && (
            <li
              onClick={() => handleSelectSection('/almacen-general/activos')}
              className={location.pathname.startsWith('/almacen-general/activos') ? 'selectedNavbarAlmacen' : ''}
            >
              <p>Activos</p>
            </li>
          )}

          {hasPermission(userPermissions, 'almacengeneral_navbar_movimientosactivos') && (
            <li
              onClick={() => handleSelectSection('/almacen-general/movimientos-activos')}
              className={location.pathname.startsWith('/almacen-general/movimientos-activos') ? 'selectedNavbarAlmacen' : ''}
            >

              <p>Movimientos de Activos</p>
            </li>
          )}


          {hasPermission(userPermissions, 'almacengeneral_navbar_etiquetas') && (
            <li
              onClick={() => handleSelectSection('/almacen-general/etiquetas')}
              className={location.pathname.startsWith('/almacen-general/etiquetas') ? 'selectedNavbarAlmacen' : ''}
            >
              <p>Etiquetas</p>
            </li>
          )}

          {hasPermission(userPermissions, 'almacengeneral_navbar_proveedores') && (
            <li
              onClick={() => handleSelectSection('/almacen-general/proveedores')}

              className={location.pathname.startsWith('/almacen-general/proveedores') ? 'selectedNavbarAlmacen' : ''}
            >
              <p>Proveedores</p>
            </li>
          )}


          {hasPermission(userPermissions, 'almacengeneral_navbar_parametros') && (
            <li onClick={handleOpenSubMenu}

              className={
                location.pathname.startsWith('/almacen-general/params') ? 'selectedNavbarAlmacen' : ''
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
                      className={location.pathname.startsWith('/almacen-general/params/clasificacion-af') ? 'selectedNavbarAlmacen_subMenu' : ''}
                      onClick={() => handleSelectSection('/almacen-general/params/clasificacion-af')}
                    >
                      Clasificación AF
                    </li>

                    <li
                      id='subMenu1'
                      className={location.pathname.startsWith('/almacen-general/params/tipo-factura') ? 'selectedNavbarAlmacen_subMenu' : ''}
                      onClick={() => handleSelectSection('/almacen-general/params/tipo-factura')}
                    >
                      Tipo de Factura
                    </li>

                    <li
                      id='subMenu1'
                      className={location.pathname.startsWith('/almacen-general/params/forma-pago') ? 'selectedNavbarAlmacen_subMenu' : ''}
                      onClick={() => handleSelectSection('/almacen-general/params/forma-pago')}
                    >
                      Forma de Pago
                    </li>

                    <li
                      id='subMenu1'
                      className={location.pathname.startsWith('/almacen-general/params/tipo-moneda') ? 'selectedNavbarAlmacen_subMenu' : ''}
                      onClick={() => handleSelectSection('/almacen-general/params/tipo-moneda')}
                    >
                      Tipo de Moneda
                    </li>

                    <li
                      id='subMenu1'
                      className={location.pathname.startsWith('/almacen-general/params/estatus-af') ? 'selectedNavbarAlmacen_subMenu' : ''}
                      onClick={() => handleSelectSection('/almacen-general/params/estatus-af')}
                    >
                      Estatus de Activos
                    </li>





                  </ul>
                )}

              </div>

            </li>
          )}

        </ul>
      </nav>

      {!isKnownSection && hasPermission(userPermissions, 'almacengeneral_navbar_inicio') ?

        <div className='noLocationSelected'>

          {location.pathname.startsWith('/almacen-general') && <AlmacenGeneralCharts />}

        </div>

        :

        <div className='div_Content'>
          {location.pathname.startsWith('/almacen-general/facturas') && <AlmacenGeneral_Facturas />}
          {location.pathname.startsWith('/almacen-general/activos') && <AlmacenGeneral_Activos />}
          {location.pathname.startsWith('/almacen-general/movimientos-activos') && <AlmacenGeneral_MovimientosAF />}
          {location.pathname.startsWith('/almacen-general/etiquetas') && <AlmacenGeneral_Etiquetas />}
          {location.pathname.startsWith('/almacen-general/proveedores') && <AlmacenGeneral_ControlProveedor />}
          {location.pathname.startsWith('/almacen-general/params/clasificacion-af') && <AlmacenGeneral_ControlClasificacion />}
          {location.pathname.startsWith('/almacen-general/params/tipo-factura') && <AlmacenGeneral_ControlTipoFactura />}
          {location.pathname.startsWith('/almacen-general/params/forma-pago') && <AlmacenGeneral_ControlFormaPago />}
          {location.pathname.startsWith('/almacen-general/params/tipo-moneda') && <AlmacenGeneral_ControlTipoMoneda />}
          {location.pathname.startsWith('/almacen-general/params/estatus-af') && <AlmacenGeneral_ControlEstatusAF />}


        </div>
      }

    </div>
  );
};

export default Main_AlmacenGeneral;
