// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Etiquetas/ImpresionFactura.css';

// Types
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { ActivoEntityResponse } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Icons
import { FaList, FaPrint } from 'react-icons/fa';

// Proveedores
import { getProveedores } from '@/store/almacenGeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacenGeneral/Proveedores/proveedoresReducer';

// Actions
import { getActivosFactura } from '@/store/almacenGeneral/Facturas/facturasActions';

// Interface para respuesta de impresión Zebra
interface PrinterApiResponse {
  success: boolean;
  message: string;
  bytes_enviados?: number;
}

interface ImpresionFacturaProps {
  facturaNuevaID?: number;
  onImpresionExit?: () => void;
}

const ImpresionFactura: React.FC<ImpresionFacturaProps> = ({ facturaNuevaID, onImpresionExit }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados locales
  const [facturasDisponibles, setFacturasDisponibles] = useState<FacturasAF[]>([]);
  const [busquedaFacturas, setBusquedaFacturas] = useState<string>('');
  const [activosFactura, setActivosFacturas] = useState<ActivoEntityResponse[]>([]);
  const [cantidadActivosTotal, setCantidadActivosTotal] = useState<number>(0);

  // Estados para factura seleccionada
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturasAF | null>(null);

  // Estados para impresión Zebra
  const [loadingActivos, setLoadingActivos] = useState<boolean>(false);
  const [loadingZebra, setLoadingZebra] = useState<boolean>(false);
  const [errorZebra, setErrorZebra] = useState<string | null>(null);
  const [successZebra, setSuccessZebra] = useState<string | null>(null);

  // Store
  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const clasificaciones = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);


  useEffect(() => {
    setFacturasDisponibles(facturas);
    setActivosFacturas([...activosFactura]);
  }, [facturas]);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const resultAction = await dispatch(getProveedores()).unwrap();

        if (resultAction.success) {
          dispatch(setListProveedor(resultAction.proveedor!)); // Establece el proveedor en el estado

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
      (factura.id_factura?.toString().includes(busquedaFacturas) || false)
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

        const cantidadTotal = resultados.activosFactura?.length || 0;
        setCantidadActivosTotal(cantidadTotal);
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

    if (facturaNueva) {
      setBusquedaFacturas(facturaNueva.num_factura || '');
      handleSeleccionarFactura(facturaNueva);
    }
  }, [facturaNuevaID, facturasDisponibles]);


  // Función para imprimir todos los activos en Zebra
  const handleImprimirTodosEnZebra = async () => {
    if (cantidadActivosTotal === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin activos',
        text: 'No hay activos disponibles para imprimir en esta factura',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Mostrar alerta de confirmación con cantidad de etiquetas
    const result = await Swal.fire({
      icon: 'info',
      title: 'Confirmar impresión',
      html: `<p>Se van a imprimir <strong>${cantidadActivosTotal} etiqueta(s)</strong> por la cantidad de activos totales. ¿Deseas continuar?</p>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, imprimir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoadingZebra(true);

    try {
      // Obtener CSRF token
      await axios.get('http://pruebas.hssadmincare.web/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      let activosImpresos = 0;
      let activosConError = 0;
      const erroresDetallados: string[] = [];

      // Imprimir cada activo
      for (const activo of activosFactura) {
        try {
          const response = await axios.post(
            `http://pruebas.hssadmincare.web/api/HSS1/almacenGeneral/printer/etiqueta/${activo.id_activo_fijo}`,
            {},
            { withCredentials: true }
          );

          if (response.data.success) {
            activosImpresos++;
          } else {
            activosConError++;
            erroresDetallados.push(`${activo.codigo_unico}: ${response.data.message}`);
          }
        } catch (error: unknown) {
          activosConError++;
          let errorMsg = 'Error desconocido';
          if (axios.isAxiosError(error)) {
            errorMsg = error.response?.data?.message || 'Error al conectar';
          }
          erroresDetallados.push(`${activo.codigo_unico}: ${errorMsg}`);
        }
      }

      // Mostrar resultado
      if (activosImpresos > 0) {
        let mensajeExito = `Se imprimieron ${activosImpresos} etiqueta(s) exitosamente`;
        if (activosConError > 0) {
          mensajeExito += ` (${activosConError} con error)`;
          Swal.fire({
            icon: 'warning',
            title: 'Impresión parcial',
            html: `<p>${mensajeExito}</p><p style="color: #d33; font-size: 0.9em; margin-top: 10px;">${erroresDetallados.join('<br>')}</p>`,
            confirmButtonText: 'Aceptar',
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Impresión exitosa',
            text: mensajeExito,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#667eea',
          });

          if (onImpresionExit) {
            onImpresionExit();
          }
        }
        setSuccessZebra(mensajeExito);
      } else {
        setErrorZebra('Error al imprimir todas las etiquetas');
        Swal.fire({
          icon: 'error',
          title: 'Error en la impresión',
          html: `<p>No se pudo imprimir ninguna etiqueta</p><p style="color: #666; font-size: 0.9em; margin-top: 10px;">${erroresDetallados.join('<br>')}</p>`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error: unknown) {
      console.error('Error al imprimir en Zebra:', error);
      let errorMessage = 'Error al conectar con la impresora Zebra';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<PrinterApiResponse>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      setErrorZebra(errorMessage);
    } finally {
      setLoadingZebra(false);
      // Limpiar mensajes después de 5 segundos
      setTimeout(() => {
        setSuccessZebra(null);
        setErrorZebra(null);
      }, 5000);
    }
  };

  // Obtener nombre de clasificación
  const getNombreClasificacion = (id_clasificacion: number) => {
    const clasificacion = clasificaciones.find(c => c.id_clasificacion === id_clasificacion);
    return clasificacion?.nombre_clasificacion || 'Sin clasificación';
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
            placeholder="Buscar por número de factura..."
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



                  {proveedores.map((proveedor) => (
                    <p key={proveedor.id_proveedor} className='proveedor'>
                      {factura.id_proveedor === proveedor.id_proveedor ? proveedor.razon_social : ''}
                    </p>
                  ))}



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
              <small>(En el siguiente orden): </small>
            </h3>

            {facturaSeleccionada && activosFactura.length > 0 && (
              <div className="botonesImpresion">

                <button
                  className="btnImprimirZebra"
                  onClick={handleImprimirTodosEnZebra}
                  disabled={loadingZebra}
                >
                  {loadingZebra ? (
                    <>⏳ Imprimiendo...</>
                  ) : (
                    <>
                      <FaPrint /> Imprimir Etiquetas ({cantidadActivosTotal})
                    </>

                  )}
                </button>

                {/* Indicadores de estado para impresión Zebra */}
                {successZebra && (
                  <div className="alertaExito">
                    <span>✅ {successZebra}</span>
                  </div>
                )}
                {errorZebra && (
                  <div className="alertaError">
                    <span>❌ {errorZebra}</span>
                  </div>
                )}
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
                        {activo.nombre_af}{' '}
                        <p className="codigo">{activo.codigo_unico}</p>
                      </h4>

                      <p className="clasificacion">{getNombreClasificacion(activo.id_clasificacion!)}</p>

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

