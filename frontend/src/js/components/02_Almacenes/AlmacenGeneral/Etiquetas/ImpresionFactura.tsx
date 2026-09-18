// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Etiquetas/ImpresionFactura.css';

// Types
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { ActivoEntityResponse } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Icons
import { FaList, FaPrint } from 'react-icons/fa';

// Proveedores
import { getProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';

// Actions
import { getActivosFactura } from '@/store/almacengeneral/Facturas/facturasActions';

// Interface para respuesta de impresión Zebra
interface ImpresionFacturaProps {
  facturaNuevaID?: number;
  onImpresionExit?: () => void;
}

const ImpresionFactura: React.FC<ImpresionFacturaProps> = ({ facturaNuevaID }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados locales
  const [facturasDisponibles, setFacturasDisponibles] = useState<FacturasAF[]>([]);
  const [busquedaFacturas, setBusquedaFacturas] = useState<string>('');
  const [activosFactura, setActivosFacturas] = useState<ActivoEntityResponse[]>([]);

  // Estados para factura seleccionada
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturasAF | null>(null);

  const [loadingActivos, setLoadingActivos] = useState<boolean>(false);

  // Store
  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const clasificaciones = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);


  useEffect(() => {
    setFacturasDisponibles(facturas);
  }, [facturas]);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const resultAction = await dispatch(getProveedores()).unwrap();

        if (resultAction.success) {
          dispatch(setListProveedor(resultAction.proveedores!)); // Establece el proveedor en el estado

        } else {
          console.log('Error', resultAction.message)
        }


      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    cargarProveedores();
  }, []);

  // Filtros de búsqueda
  const facturasDisponiblesFiltradas = facturasDisponibles.filter(factura => {
    if (!factura || !factura.num_factura) return false;
    return (
      factura.num_factura.toLowerCase().includes(busquedaFacturas.toLowerCase()) ||
      (factura.id_factura?.toString().includes(busquedaFacturas) || false) ||
      proveedores.find(prov => prov.id_proveedor === factura.id_proveedor)?.razon_social.toLowerCase().includes(busquedaFacturas.toLowerCase()) || false
    );
  });



  // Función para seleccionar una factura y cargar sus activos
  const handleSeleccionarFactura = async (factura: FacturasAF) => {
    setFacturaSeleccionada(factura);
    setLoadingActivos(true);

    try {
      const resultados = await dispatch(getActivosFactura(factura.id_factura!)).unwrap();

      if (resultados.success) {
        setActivosFacturas(resultados.activosFactura || []);

      } else {
        setActivosFacturas([]);
      }
    } catch (error) {
      console.error('Error al cargar activos:', error);
      setActivosFacturas([]);
    } finally {
      setLoadingActivos(false);
    }
  };

  useEffect(() => {
    if (!facturaNuevaID || facturasDisponibles.length === 0) {
      return;
    }

    const facturaNueva = facturasDisponibles.find(
      (factura) => factura.id_factura === facturaNuevaID
    );

    const proveedorFacturaNueva = proveedores.find(
      prov => prov.id_proveedor === facturaNueva?.id_proveedor
    );

    if (facturaNueva && proveedorFacturaNueva) {
      setBusquedaFacturas(facturaNueva.num_factura || '');
      handleSeleccionarFactura(facturaNueva);
    }
  }, [facturaNuevaID, facturasDisponibles, proveedores]);


  // Obtener nombre de clasificación
  const getNombreClasificacion = (id_clasificacion: number | null) => {
    const clasificacion = clasificaciones.find(c => c.id_clasificacion === id_clasificacion);
    return clasificacion ? clasificacion.nombre_clasificacion : 'Activo Menor';
  };

  return (
    <main className="mainDiv_ImprAF">

      {/* Columna Izquierda - Facturas Disponibles */}
      <div className="columnFacturasDisponibles">

        <div className="columnHeader">
          <h3>
            {facturaNuevaID ? (
              <>
                <FaList className="columnIcon" /> Factura: {busquedaFacturas}
              </>
            ) : (
              <>
                <FaList className="columnIcon" /> Facturas Disponibles
              </>
            )}

          </h3>
          <span className="contadorBadge">{facturasDisponiblesFiltradas.length}</span>
        </div>

        <div className="divSearch">
          <input
            type="text"
            placeholder="Buscar por número de factura o razón social"
            value={busquedaFacturas}
            onChange={(e) => setBusquedaFacturas(e.target.value)}
            className="inputSearch"
          />
        </div>

        <div className="divFacturasList">
          {facturasDisponiblesFiltradas.length > 0 ? (
            facturasDisponiblesFiltradas.map((factura) => (
              <div
                key={factura.id_factura}
                className={`facturaItem disponible ${facturaSeleccionada?.id_factura === factura.id_factura
                  ? 'seleccionado'
                  : ''
                }`}
                onClick={() => handleSeleccionarFactura(factura)}
              >
                <div className="facturaInfo">

                  <h4>
                    {factura.id_factura}{' | '}
                    {factura.num_factura}
                  </h4>



                  {proveedores.find(prov => prov.id_proveedor === factura.id_proveedor)?.nombre_proveedor && (
                    <p className='proveedor'>
                      {proveedores.find(prov => prov.id_proveedor === factura.id_proveedor)?.razon_social}
                    </p>
                  )}



                </div>
              </div>
            ))
          ) : (
            <div className="noItems">
              <p>No hay facturas disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha - Activos de la Factura */}
      {facturaSeleccionada ? (
        <div className="columnActivosFactura" >

          <div className="columnHeader">
            <h3>
              <FaList className="columnIcon" /> Activos de la Factura
              <span className="contadorBadge">{activosFactura.length}</span>
            </h3>

            {facturaSeleccionada && activosFactura.length > 0 && (
              <div className="botonesImpresion">

                <button
                  className="btnImprimirZebra"
                  disabled
                  title="No disponible en la demo"
                >
                  <><FaPrint /> No disponible en la demo</>
                </button>

              </div>
            )}
          </div>

          {loadingActivos ? (
            <div className="noItems">
              <p>Cargando activos...</p>
            </div>
          ) : (
            <div className="divActivosFacturaList">

              {activosFactura.length > 0 ? (
                activosFactura.map((activo: ActivoEntityResponse) => (
                  <div
                    key={activo.id_activo_fijo}
                    className="activoFacturaItem disponible"
                  >
                    <div className="activoFacturaInfo">
                      <h4>
                        <p className="codigo">{activo.codigo_unico}</p>
                        {activo.nombre_af}{' '}
                      </h4>

                      <p className="clasificacion">{getNombreClasificacion(activo.id_clasificacion)}</p>

                      <p style={{ fontSize: '0.9em', color: '#999' }}>Unidad: 1</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="noItems">
                  <p>No hay activos en esta factura</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className='columnActivosFactura'>

          <div className="sinSeleccion">
            <p>Selecciona una factura para ver sus activos</p>
          </div>


        </div>
      )}

    </main>
  );
};

export default ImpresionFactura;

