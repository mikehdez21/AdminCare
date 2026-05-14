// Bibliotecas
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

// Icons
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';


// Styles
import '@styles/02_Almacenes/AlmacenGeneral/AlmacenGeneral.css';
import AlmacenGeneral_ControlTipoMoneda from './Parametros/TipoMoneda/TipoMonedaControl';

const Main_AlmacenGeneral: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtén la ruta actual

  const [isRotated, setIsRotated] = React.useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(false);

  const isKnownSection =
    location.pathname.startsWith('/almacen_general/facturas') ||
    location.pathname.startsWith('/almacen_general/activos') ||
    location.pathname.startsWith('/almacen_general/movimientos_activos') ||
    location.pathname.startsWith('/almacen_general/etiquetas') ||
    location.pathname.startsWith('/almacen_general/proveedores') ||
    location.pathname.startsWith('/almacen_general/params/clasificacionAF') ||
    location.pathname.startsWith('/almacen_general/params/tipoFactura') ||
    location.pathname.startsWith('/almacen_general/params/formaPago') ||
    location.pathname.startsWith('/almacen_general/params/tipoMoneda');


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

          <li
            onClick={() => handleSelectSection('/almacen_general')}
            className={location.pathname === '/almacen_general' ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Inicio</p>

          </li>

          <li
            onClick={() => handleSelectSection('/almacen_general/facturas')}
            className={location.pathname.startsWith('/almacen_general/facturas') ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Facturas</p>
          </li>


          <li
            onClick={() => handleSelectSection('/almacen_general/activos')}
            className={location.pathname.startsWith('/almacen_general/activos') ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Activos</p>
          </li>

          <li
            onClick={() => handleSelectSection('/almacen_general/movimientos_activos')}
            className={location.pathname.startsWith('/almacen_general/movimientos_activos') ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Movimientos de Activos</p>
          </li>


          <li
            onClick={() => handleSelectSection('/almacen_general/etiquetas')}
            className={location.pathname.startsWith('/almacen_general/etiquetas') ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Etiquetas</p>
          </li>

          <li
            onClick={() => handleSelectSection('/almacen_general/proveedores')}

            className={location.pathname.startsWith('/almacen_general/proveedores') ? 'selectedNavbarAlmacen' : ''}
          >
            <p>Proveedores</p>
          </li>


          <li onClick={handleOpenSubMenu}

            className={
              location.pathname.startsWith('/almacen_general/params') ? 'selectedNavbarAlmacen' : ''
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
                    className={location.pathname.startsWith('/almacen_general/params/clasificacionAF') ? 'selectedNavbarAlmacen_subMenu' : ''}
                    onClick={() => handleSelectSection('/almacen_general/params/clasificacionAF')}
                  >
                    Clasificación AF
                  </li>

                  <li
                    id='subMenu1'
                    className={location.pathname.startsWith('/almacen_general/params/tipoFactura') ? 'selectedNavbarAlmacen_subMenu' : ''}
                    onClick={() => handleSelectSection('/almacen_general/params/tipoFactura ')}
                  >
                    Tipo de Factura
                  </li>

                  <li
                    id='subMenu1'
                    className={location.pathname.startsWith('/almacen_general/params/formaPago') ? 'selectedNavbarAlmacen_subMenu' : ''}
                    onClick={() => handleSelectSection('/almacen_general/params/formaPago ')}
                  >
                    Forma de Pago
                  </li>

                  <li
                    id='subMenu1'
                    className={location.pathname.startsWith('/almacen_general/params/tipoMoneda') ? 'selectedNavbarAlmacen_subMenu' : ''}
                    onClick={() => handleSelectSection('/almacen_general/params/tipoMoneda ')}
                  >
                    Tipo de Moneda
                  </li>





                </ul>
              )}

            </div>

          </li>

        </ul>
      </nav>

      {!isKnownSection ?
        <div className='noLocationSelected'>
          {location.pathname.startsWith('/almacen_general') && <AlmacenGeneralCharts />}

        </div>

        :

        <div className='div_Content'>
          {location.pathname.startsWith('/almacen_general/facturas') && <AlmacenGeneral_Facturas />}
          {location.pathname.startsWith('/almacen_general/activos') && <AlmacenGeneral_Activos />}
          {location.pathname.startsWith('/almacen_general/movimientos_activos') && <AlmacenGeneral_MovimientosAF />}
          {location.pathname.startsWith('/almacen_general/etiquetas') && <AlmacenGeneral_Etiquetas />}
          {location.pathname.startsWith('/almacen_general/proveedores') && <AlmacenGeneral_ControlProveedor />}
          {location.pathname.startsWith('/almacen_general/params/clasificacionAF') && <AlmacenGeneral_ControlClasificacion />}
          {location.pathname.startsWith('/almacen_general/params/tipoFactura') && <AlmacenGeneral_ControlTipoFactura />}
          {location.pathname.startsWith('/almacen_general/params/formaPago') && <AlmacenGeneral_ControlFormaPago />}
          {location.pathname.startsWith('/almacen_general/params/tipoMoneda') && <AlmacenGeneral_ControlTipoMoneda />}


        </div>
      }

    </div>
  );
};

export default Main_AlmacenGeneral;
