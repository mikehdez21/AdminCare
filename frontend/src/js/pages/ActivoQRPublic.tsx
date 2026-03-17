// Bibliotecas
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';
import '@styles/02_Almacenes/AlmacenGeneral/ActivoQR/activoQRPublic.css';

interface ActivoQRData {
    qraf: {
        id_qraf: number;
        id_activo_fijo: number;
        codigo_qr: string;
        url_destino: string;
        fecha_generacion: string;
        fecha_ultimo_escaneo: string | null;
        activo: boolean;
        intentos_lectura: number;
        observaciones: string | null;
    };
    activoVW: {
        id_activo_fijo: number;
        codigo_unico: string;
        nombre_af: string;
        descripcion_af: string | null;
        modelo_af: string | null;
        marca_af: string | null;
        numero_serie_af: string | null;
        valor_compra_af: string | null;
        fecha_compra_af: string | null;
        fecha_registro_af: string | null;
        af_propio: boolean;
        observaciones_af: string | null;
        estado_actual: string;
        clasificacion: string;
        responsable_anterior_completo: string | null;
        responsable_actual_completo: string | null;
        departamento_actual: string | null;
        ubicacion_anterior: string | null;
        ubicacion_actual: string | null;
        fecha_ultimo_movimiento: string | null;
        ultimo_motivo_movimiento: string | null;
        tipo_movimiento: string | null;
    };
}

const ActivoQRPublic: React.FC = () => {
  const { codigoQR } = useParams<{ codigoQR: string }>();
  const [data, setData] = useState<ActivoQRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivoQR = async () => {
      try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacenGeneral/qraf/scan/${codigoQR}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          withCredentials: true,
        });
        console.log('Respuesta del servidor:', response.data); 
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Código QR no encontrado o inactivo.');
        console.error('Error al cargar QR:', err);
      } finally {
        setLoading(false);
      }
    };

    if (codigoQR) {
      fetchActivoQR();
    }
  }, [codigoQR]);

  if (loading) {
    return (
      <div className="qr-public-container">
        <div className="qr-loading">
          <div className="spinner"></div>
          <p>Cargando información del activo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="qr-public-container">
        <div className="qr-error">
          <div className="error-icon">❌</div>
          <h1>Código QR No Encontrado</h1>
          <p>{error || 'No se pudo cargar la información del activo.'}</p>
          <div className="codigo">Código: {codigoQR}</div>
          <p className="error-footer">
                        Por favor, verifica que el código QR sea válido o contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  const { activoVW, qraf } = data;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (value: string | null) => {
    if (value === null) return 'N/A';
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numValue);
  };

  return (
    <div className="qr-public-container">
      <div className="qr-card">
        <div className="qr-header">
          <h1>{activoVW.nombre_af}</h1>
          <div className="qr-badge">{activoVW.codigo_unico}</div>
          <div className="scan-count">
                        📱 Escaneado {qraf.intentos_lectura} {qraf.intentos_lectura === 1 ? 'vez' : 'veces'}
          </div>
        </div>

        <div className="qr-content">
          {/* Información General */}
          <div className="qr-section">
            <div className="section-title">Información General</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre</span>
                <span className="info-value">{activoVW.nombre_af}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Código Único</span>
                <span className="info-value">{activoVW.codigo_unico}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Marca</span>
                <span className="info-value">{activoVW.marca_af || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Modelo</span>
                <span className="info-value">{activoVW.modelo_af || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">No. Serie</span>
                <span className="info-value">{activoVW.numero_serie_af || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estado</span>
                <span className="status-badge status-activo">
                  {activoVW.estado_actual || 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">🏷️ Clasificación</span>
                <span className="info-value">{activoVW.clasificacion || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Activo Propio</span>
                <span className="info-value">{activoVW.af_propio ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {activoVW.descripcion_af && (
            <div className="qr-section">
              <div className="section-title">Descripción</div>
              <p className="descripcion-text">{activoVW.descripcion_af}</p>
            </div>
          )}

          {/* Asignación Actual */}
          {activoVW.responsable_actual_completo && (
            <div className="qr-section">
              <div className="section-title">Asignación Actual</div>
              <div className="asignacion-box">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">👤 Responsable</span>
                    <span className="info-value">{activoVW.responsable_actual_completo}</span>
                  </div>
                  {activoVW.departamento_actual && (
                    <div className="info-item">
                      <span className="info-label">🏢 Departamento</span>
                      <span className="info-value">{activoVW.departamento_actual}</span>
                    </div>
                  )}
                  {activoVW.ubicacion_actual && (
                    <div className="info-item">
                      <span className="info-label">📍 Ubicación</span>
                      <span className="info-value">{activoVW.ubicacion_actual}</span>
                    </div>
                  )}
                  {activoVW.fecha_ultimo_movimiento && (
                    <div className="info-item">
                      <span className="info-label">📅 Última Asignación</span>
                      <span className="info-value">{formatDate(activoVW.fecha_ultimo_movimiento)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Último Movimiento */}
          {activoVW.tipo_movimiento && (
            <div className="qr-section">
              <div className="section-title">Último Movimiento</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Tipo de Movimiento</span>
                  <span className="info-value">{activoVW.tipo_movimiento}</span>
                </div>
                {activoVW.ultimo_motivo_movimiento && (
                  <div className="info-item">
                    <span className="info-label">Motivo</span>
                    <span className="info-value">{activoVW.ultimo_motivo_movimiento}</span>
                  </div>
                )}
                {activoVW.responsable_anterior_completo && (
                  <div className="info-item">
                    <span className="info-label">Responsable Anterior</span>
                    <span className="info-value">{activoVW.responsable_anterior_completo}</span>
                  </div>
                )}
                {activoVW.ubicacion_anterior && (
                  <div className="info-item">
                    <span className="info-label">Ubicación Anterior</span>
                    <span className="info-value">{activoVW.ubicacion_anterior}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="qr-section">
            <div className="section-title">Detalles Adicionales</div>
            <div className="info-grid">
              {activoVW.valor_compra_af !== null && (
                <div className="info-item">
                  <span className="info-label">💰 Valor de Compra</span>
                  <span className="info-value">{formatCurrency(activoVW.valor_compra_af)}</span>
                </div>
              )}
              {activoVW.fecha_compra_af && (
                <div className="info-item">
                  <span className="info-label">📅 Fecha de Compra</span>
                  <span className="info-value">{formatDate(activoVW.fecha_compra_af)}</span>
                </div>
              )}
              {activoVW.fecha_registro_af && (
                <div className="info-item">
                  <span className="info-label">🗓️ Fecha de Registro</span>
                  <span className="info-value">{formatDate(activoVW.fecha_registro_af)}</span>
                </div>
              )}
              {activoVW.observaciones_af && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-label">📝 Observaciones</span>
                  <span className="info-value">{activoVW.observaciones_af}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="qr-footer">
          <p>Código QR: <strong>{qraf.codigo_qr}</strong></p>
          <p>Última actualización: {formatDate(qraf.fecha_ultimo_escaneo || qraf.fecha_generacion)}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivoQRPublic;
