import { API_BASE_URL } from '@/variableApi';

// Bibliotecas
import React, { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';

// Styles
import '@styles/02_Almacenes/AlmacenGeneral/Etiquetas/ImpresionAF.css';

// Types
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

// Icons
import { FaList, FaPrint, FaQrcode } from 'react-icons/fa';

// Interface para respuesta de impresión Zebra
interface PrinterApiResponse {
  success: boolean;
  message: string;
  bytes_enviados?: number;
}



const ImpresionAF: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados locales
  const [activosDisponibles, setActivosDisponibles] = useState<ActivosFijos[]>([]);
  const [activosSeleccionados, setActivosSeleccionados] = useState<ActivosFijos[]>([]);
  const [busquedaDisponibles, setBusquedaDisponibles] = useState<string>('');
  const [activosExistentes] = useState<ActivosFijos[]>([]);

  // Estados para impresión
  const [activoSeleccionadoActual, setActivoSeleccionadoActual] = useState<ActivosFijos | null>(null);
  const [imagenQRBase64, setImagenQRBase64] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState<boolean>(false);
  const [errorQR, setErrorQR] = useState<string | null>(null);

  // Estados para impresión Zebra
  const [loadingZebra, setLoadingZebra] = useState<boolean>(false);
  const [errorZebra, setErrorZebra] = useState<string | null>(null);
  const [successZebra, setSuccessZebra] = useState<string | null>(null);

  // Store
  const activosFijos = useSelector((state: RootState) => state.activos.activosfijos);
  const clasificaciones = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);

  useEffect(() => {
    setActivosSeleccionados([...activosExistentes]);
  }, [dispatch, activosExistentes]);

  useEffect(() => {
    // Filtrar activos disponibles (excluir los ya seleccionados)
    const disponibles = activosFijos.filter(
      activo => !activosSeleccionados.find(sel => sel.id_activo_fijo === activo.id_activo_fijo)
    );
    setActivosDisponibles(disponibles);
  }, [activosFijos, activosSeleccionados]);

  // Filtros de búsqueda - AGREGAR VALIDACIONES DE SEGURIDAD
  const activosDisponiblesFiltrados = activosDisponibles.filter(activo => {
    if (!activo || !activo.nombre_af || !activo.codigo_unico) return false;
    return activo.nombre_af.toLowerCase().includes(busquedaDisponibles.toLowerCase()) ||
      activo.codigo_unico.toLowerCase().includes(busquedaDisponibles.toLowerCase());
  });

  // Obtener nombre de clasificación
  const getNombreClasificacion = (id_clasificacion: number) => {
    const clasificacion = clasificaciones.find(c => c.id_clasificacion === id_clasificacion);
    console.log('Clasificaciones disponibles:', clasificacion);
    return clasificacion?.nombre_clasificacion || 'Sin clasificación';
  };

  // Función para seleccionar un activo y cargar su QR
  const handleSeleccionarActivo = async (activo: ActivosFijos) => {
    setActivoSeleccionadoActual(activo);
    setLoadingQR(true);
    setErrorQR(null);
    setImagenQRBase64(null);

    try {
      // Obtener la imagen existente del QR
      const response = await axios.get(
        `${API_BASE_URL}/api/HSS1/almacenGeneral/qraf/descargar/${activo.id_activo_fijo}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      setImagenQRBase64(blobUrl);
      setErrorQR(null);
    } catch (error: unknown) {
      console.error('Error al cargar QR:', error);
      if (axios.isAxiosError(error)) {
        setErrorQR(error.response?.data?.message || 'Error al cargar el código QR. Intenta nuevamente.');
      } else {
        setErrorQR('Error al cargar el código QR. Intenta nuevamente.');
      }
    } finally {
      setLoadingQR(false);
    }
  };

  // Función para imprimir la etiqueta
  const handleImprimir = () => {
    if (!activoSeleccionadoActual) {
      alert('Selecciona un activo primero');
      return;
    }

    const etiqueta = document.getElementById('etiqueta-impresion');
    if (etiqueta) {
      const ventanaImpresion = window.open('', '', 'width=800,height=600');
      if (ventanaImpresion) {
        ventanaImpresion.document.write(`
          <html>
            <head>
              <title>Etiqueta - ${activoSeleccionadoActual.codigo_unico}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .etiqueta {
                  border: 2px solid #333;
                  padding: 20px;
                  text-align: center;
                  max-width: 400px;
                }
                .etiqueta h2 {
                  margin: 10px 0;
                  font-size: 20px;
                  color: #333;
                }
                .etiqueta .codigo {
                  font-size: 16px;
                  color: #667eea;
                  font-weight: bold;
                  margin: 5px 0;
                }
                .etiqueta img {
                  max-width: 100%;
                  margin: 15px 0;
                }
                .etiqueta .info {
                  font-size: 14px;
                  color: #666;
                  margin: 5px 0;
                }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              ${etiqueta.innerHTML}
            </body>
          </html>
        `);
        ventanaImpresion.document.close();
        setTimeout(() => {
          ventanaImpresion.print();
        }, 250);
      }
    }
  };

  // Función para imprimir en Zebra
  const handleImprimirEnZebra = async () => {
    if (!activoSeleccionadoActual) {
      alert('Selecciona un activo primero');
      return;
    }

    setLoadingZebra(true);
    setErrorZebra(null);
    setSuccessZebra(null);

    try {
      // Obtener CSRF token
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true
      });

      // Enviar solicitud de impresión a Zebra
      const response = await axios.post(
        `${API_BASE_URL}/api/HSS1/almacenGeneral/printer/etiqueta/${activoSeleccionadoActual.id_activo_fijo}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessZebra(response.data.message || 'Etiqueta impresa exitosamente en Zebra');
        console.log('Impresión Zebra exitosa:', response.data);
      } else {
        setErrorZebra(response.data.message || 'Error al imprimir en Zebra');
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

  return (

    <main className='mainDiv_ImprAF'>


      <div className="columnAFDisponibles">

        <div className="columnHeader">
          <h3><FaList className="columnIcon" /> Activos Disponibles</h3>
          <span className="contadorBadge">{activosDisponiblesFiltrados.length}</span>
        </div>

        <div className="divSearch">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={busquedaDisponibles}
            onChange={(e) => setBusquedaDisponibles(e.target.value)}
            className="inputSearch"
          />
        </div>

        <div className="divActivosList">
          {activosDisponiblesFiltrados.length > 0 ? (
            activosDisponiblesFiltrados.map((activo) => (

              <div
                key={activo.id_activo_fijo}
                className={`activoItem disponible ${activoSeleccionadoActual?.id_activo_fijo === activo.id_activo_fijo ? 'seleccionado' : ''}`}
                onClick={() => handleSeleccionarActivo(activo)}
                style={{ cursor: 'pointer' }}
              >

                <div className="activoInfo">
                  <h4><p className="codigo">{activo.codigo_unico}</p> {activo.nombre_af}  </h4>

                  <p className="clasificacion">{getNombreClasificacion(activo.id_clasificacion!)}</p>
                </div>

              </div>

            ))
          ) : (
            <div className="noItems">
              <p>No hay activos disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className='columnImpresion'>
        <div className="headerImpresion">
          <h2><FaQrcode className="iconHeader" /> Vista Previa de Etiqueta</h2>
          {activoSeleccionadoActual && (
            <div className="botonesImpresion">
              <button className="btnImprimir" onClick={handleImprimir}>
                <FaPrint /> Imprimir PDF
              </button>
              <button
                className="btnImprimirZebra"
                onClick={handleImprimirEnZebra}
                disabled={loadingZebra}
              >
                {loadingZebra ? '⏳ Imprimiendo...' : <><FaPrint /> Imprimir Zebra</>}
              </button>
            </div>
          )}
        </div>

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

        {!activoSeleccionadoActual ? (
          <div className="sinSeleccion">
            <FaQrcode className="iconGrande" />
            <p>Selecciona un activo de la lista para ver su etiqueta QR</p>
          </div>
        ) : (
          <div className="contenedorEtiqueta">
            {/* Columna Izquierda - Etiqueta QR */}
            <div className="columnEtiqueta">
              <div id="etiqueta-impresion" className="etiqueta">
                <div className="etiquetaHeader">
                  <h2>{activoSeleccionadoActual.nombre_af}</h2>
                  <p className="codigo">{activoSeleccionadoActual.codigo_unico}</p>
                  <p className="clasificacion">{getNombreClasificacion(activoSeleccionadoActual.id_clasificacion!)}</p>
                </div>

                <div className="etiquetaQR">
                  {loadingQR ? (
                    <div className="loadingQR">
                      <div className="spinner"></div>
                      <p>Generando código QR...</p>
                    </div>
                  ) : errorQR ? (
                    <div className="errorQR">
                      <p>⚠️ {errorQR}</p>
                    </div>
                  ) : imagenQRBase64 ? (
                    <img
                      src={imagenQRBase64}
                      alt="Código QR"
                      className="imagenQR"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Columna Derecha - Información del Activo */}
            <div className="columnInfo">
              <div className="infoCard">
                <h3>📋 Información del Activo</h3>

                <div className="infoSection">
                  <div className="infoRow">
                    <span className="infoLabel">Nombre:</span>
                    <span className="infoValue">{activoSeleccionadoActual.nombre_af}</span>
                  </div>

                  <div className="infoRow">
                    <span className="infoLabel">Código:</span>
                    <span className="infoValue codigo">{activoSeleccionadoActual.codigo_unico}</span>
                  </div>

                  <div className="infoRow">
                    <span className="infoLabel">Clasificación:</span>
                    <span className="infoValue">{getNombreClasificacion(activoSeleccionadoActual.id_clasificacion!)}</span>
                  </div>

                  <div className="infoRow">
                    <span className="infoLabel">Marca:</span>
                    <span className="infoValue">{activoSeleccionadoActual.marca_af}</span>
                  </div>

                  <div className="infoRow">
                    <span className="infoLabel">Modelo:</span>
                    <span className="infoValue">{activoSeleccionadoActual.modelo_af}</span>
                  </div>

                  <div className="infoRow">
                    <span className="infoLabel">N° Serie:</span>
                    <span className="infoValue">{activoSeleccionadoActual.numero_serie_af}</span>
                  </div>
                </div>



              </div>
            </div>
          </div>
        )}
      </div>




    </main>




  )
};

export default ImpresionAF;
