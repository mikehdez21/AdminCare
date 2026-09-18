import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatMexicanCurrency } from '@/utils/numbersFormat';
import '@styles/02_Almacenes/AlmacenGeneral/ActivoQR/activoQRPublic.css';

type PublicAsset = {
  [key: string]: unknown;
  id_activo_fijo?: number | null;
  codigo?: string | null;
  codigo_unico?: string | null;
  codigo_etiqueta?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  modelo?: string | null;
  marca?: string | null;
  numero_serie?: string | null;
  costo?: number | string | null;
  fecha_registro?: string | null;
  propio?: boolean | null;
  menor?: boolean | null;
  etiqueta?: string | null;
  observaciones?: string | null;
  clasificacion?: string | null;
  estado?: string | null;
  responsable_anterior?: string | null;
  responsable_actual?: string | null;
  departamento?: string | null;
  ubicacion_anterior?: string | null;
  ubicacion_actual?: string | null;
  fecha_ultimo_movimiento?: string | null;
  ultimo_motivo_movimiento?: string | null;
  tipo_movimiento?: string | null;
  id_estado_af?: number | null;
  id_clasificacion?: number | null;
  af_propio?: boolean | null;
  af_menor?: boolean | null;
  nombre_af?: string | null;
  descripcion_af?: string | null;
  modelo_af?: string | null;
  marca_af?: string | null;
  numero_serie_af?: string | null;
  costo_unitario_af?: number | string | null;
  fecha_registro_af?: string | null;
  depreciacion_aplicada?: boolean | null;
  observaciones_af?: string | null;
  estado_actual?: string | null;
  responsable_anterior_completo?: string | null;
  responsable_actual_completo?: string | null;
  departamento_actual?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  codigo_lote?: string | null;
  lote_afconsecutivo?: number | null;
  lote_total?: number | null;
};

type QrMetadata = {
  [key: string]: unknown;
  id_qraf?: number | null;
  codigo_qr?: string | null;
  intentos_lectura?: number | null;
  fecha_generacion?: string | null;
  fecha_ultimo_escaneo?: string | null;
  url_destino?: string | null;
  activo?: boolean | null;
  observaciones?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PublicResponse = { activo: PublicAsset; qraf: QrMetadata | null };

const valueOrNA = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
};

const normalizeResponse = (response: unknown): PublicResponse | null => {
  if (!response || typeof response !== 'object') return null;
  const body = response as { data?: unknown; activo?: unknown };
  const payload = (body.data && typeof body.data === 'object' ? body.data : body.activo) as
    | Record<string, unknown> | undefined;
  if (!payload) return null;

  // The SQLite resolver returns the normalized asset. Keep accepting the original
  // API shape too, so the complete public sheet remains compatible with old QR rows.
  if ('activoVW' in payload) {
    const old = payload.activoVW as Record<string, unknown>;
    const qraf = (payload.qraf as QrMetadata | undefined) ?? null;
    return {
      qraf,
      activo: {
        codigo: old.codigo_unico as string | null,
        codigo_unico: old.codigo_unico as string | null,
        nombre: old.nombre_af as string | null,
        descripcion: old.descripcion_af as string | null,
        modelo: old.modelo_af as string | null,
        marca: old.marca_af as string | null,
        numero_serie: old.numero_serie_af as string | null,
        costo: old.costo_unitario_af as string | null,
        fecha_registro: old.fecha_registro_af as string | null,
        propio: old.af_propio as boolean | null,
        observaciones: old.observaciones_af as string | null,
        estado: old.estado_actual as string | null,
        clasificacion: old.clasificacion as string | null,
        responsable_anterior: old.responsable_anterior_completo as string | null,
        responsable_actual: old.responsable_actual_completo as string | null,
        departamento: old.departamento_actual as string | null,
        ubicacion_anterior: old.ubicacion_anterior as string | null,
        ubicacion_actual: old.ubicacion_actual as string | null,
        fecha_ultimo_movimiento: old.fecha_ultimo_movimiento as string | null,
        ultimo_motivo_movimiento: old.ultimo_motivo_movimiento as string | null,
        tipo_movimiento: old.tipo_movimiento as string | null,
      },
    };
  }

  const { qraf, ...asset } = payload;
  return { activo: asset as PublicAsset, qraf: (qraf as QrMetadata | undefined) ?? null };
};

const publicApiBase = (import.meta.env.VITE_APP_API || window.location.origin).replace(/\/$/, '');

const getResponseMessage = (response: unknown) => {
  if (!response || typeof response !== 'object') return null;
  const message = (response as { message?: unknown }).message;
  return typeof message === 'string' && message ? message : null;
};

const InfoItem: React.FC<{ label: string; value: unknown; className?: string }> = ({ label, value, className }) => (
  <div className={`info-item${className ? ` ${className}` : ''}`}>
    <span className="info-label">{label}</span>
    <span className="info-value">{valueOrNA(value)}</span>
  </div>
);

const ActivoQRPublic: React.FC = () => {
  const { codigoQR } = useParams<{ codigoQR: string }>();
  const [data, setData] = useState<PublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const codigo = codigoQR?.trim();
    if (!codigo) {
      setError('Código QR no encontrado o inactivo.');
      setLoading(false);
      return () => { mounted = false; };
    }

    setLoading(true);
    setError(null);
    // This endpoint is public. Use the native fetch API so the Sanctum-aware
    // axios instance does not request CSRF cookies or attach a session.
    fetch(`${publicApiBase}/api/HSS1/activosfijos/qraf/${encodeURIComponent(codigo)}`, {
      method: 'GET',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        let payload: unknown = null;
        try {
          payload = await response.json();
        } catch {
          // Keep the standard not-found error for empty/non-JSON responses.
        }

        if (!response.ok) {
          const requestError = new Error(getResponseMessage(payload) || 'Código QR no encontrado o inactivo.');
          Object.assign(requestError, { status: response.status });
          throw requestError;
        }
        return payload;
      })
      .then((response: unknown) => {
        if (!mounted) return;
        const normalized = normalizeResponse(response);
        if (normalized) setData(normalized);
        else setError(getResponseMessage(response) || 'No se pudo cargar la información del activo.');
      })
      .catch((requestError: unknown) => {
        if (!mounted) return;
        setError(requestError instanceof Error && requestError.message
          ? requestError.message : 'Código QR no encontrado o inactivo.');
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [codigoQR]);

  if (loading) return <div className="qr-public-container"><div className="qr-loading"><div className="spinner" /><p>Cargando información del activo...</p></div></div>;
  if (error || !data) return <div className="qr-public-container"><div className="qr-error">
    <div className="error-icon">❌</div><h1>Código QR No Encontrado</h1>
    <p>{error || 'No se pudo cargar la información del activo.'}</p>
    <div className="codigo">Código: {codigoQR}</div>
    <p className="error-footer">Por favor, verifica que el código QR sea válido o contacta al administrador.</p>
  </div></div>;

  const { activo, qraf } = data;
  const lastUpdate = qraf?.fecha_ultimo_escaneo || qraf?.fecha_generacion || activo.fecha_registro;
  const scanCount = qraf?.intentos_lectura;
  const knownAssetFields = new Set([
    'codigo', 'codigo_unico', 'codigo_etiqueta', 'nombre', 'descripcion', 'modelo', 'marca',
    'numero_serie', 'costo', 'fecha_registro', 'propio', 'menor', 'etiqueta', 'observaciones',
    'clasificacion', 'estado', 'responsable_anterior', 'responsable_actual', 'departamento',
    'ubicacion_anterior', 'ubicacion_actual', 'fecha_ultimo_movimiento', 'ultimo_motivo_movimiento',
    'tipo_movimiento', 'codigo_lote', 'lote_afconsecutivo', 'lote_total', 'depreciacion_aplicada',
    'created_at', 'updated_at', 'id_activo_fijo', 'id_estado_af', 'id_clasificacion',
  ]);
  const additionalFields = Object.entries(activo).filter(([key]) => !knownAssetFields.has(key));

  return <div className="qr-public-container"><div className="qr-card">
    <div className="qr-header">
      <h1>{valueOrNA(activo.nombre)}</h1>
      <div className="qr-badge">{valueOrNA(activo.codigo || activo.codigo_unico || codigoQR)}</div>
      {scanCount !== null && scanCount !== undefined && <div className="scan-count">📱 Escaneado {scanCount} {scanCount === 1 ? 'vez' : 'veces'}</div>}
    </div>

    <div className="qr-content">
      <div className="qr-section"><div className="section-title">Información General</div><div className="info-grid">
        <InfoItem label="Nombre" value={activo.nombre} />
        <InfoItem label="Código Único" value={activo.codigo_unico || codigoQR} />
        <InfoItem label="Marca" value={activo.marca} /><InfoItem label="Modelo" value={activo.modelo} />
        <InfoItem label="No. Serie" value={activo.numero_serie} />
        <div className="info-item"><span className="info-label">Estado</span><span className="status-badge status-activo">{valueOrNA(activo.estado)}</span></div>
        <InfoItem label="🏷️ Clasificación" value={activo.clasificacion} /><InfoItem label="Activo Propio" value={activo.propio} />
      </div></div>

      {activo.descripcion && <div className="qr-section"><div className="section-title">Descripción</div><p className="descripcion-text">{activo.descripcion}</p></div>}

      {(activo.responsable_actual || activo.departamento || activo.ubicacion_actual || activo.fecha_ultimo_movimiento) && <div className="qr-section"><div className="section-title">Asignación Actual</div><div className="asignacion-box"><div className="info-grid">
        <InfoItem label="👤 Responsable" value={activo.responsable_actual} /><InfoItem label="🏢 Departamento" value={activo.departamento} />
        <InfoItem label="📍 Ubicación" value={activo.ubicacion_actual} /><InfoItem label="📅 Última Asignación" value={formatDate(activo.fecha_ultimo_movimiento)} />
      </div></div></div>}

      {activo.tipo_movimiento && <div className="qr-section"><div className="section-title">Último Movimiento</div><div className="info-grid">
        <InfoItem label="Tipo de Movimiento" value={activo.tipo_movimiento} /><InfoItem label="Motivo" value={activo.ultimo_motivo_movimiento} />
        <InfoItem label="Responsable Anterior" value={activo.responsable_anterior} /><InfoItem label="Ubicación Anterior" value={activo.ubicacion_anterior} />
      </div></div>}

      <div className="qr-section"><div className="section-title">Detalles Adicionales</div><div className="info-grid">
        <InfoItem label="💰 Costo Unitario" value={activo.costo === null || activo.costo === undefined ? null : formatMexicanCurrency(activo.costo)} />
        <InfoItem label="🗓️ Fecha de Registro" value={formatDate(activo.fecha_registro)} />
        <InfoItem label="Activo menor" value={activo.menor} /><InfoItem label="Código de etiqueta" value={activo.codigo_etiqueta || activo.etiqueta} />
        <InfoItem label="Código de lote" value={activo.codigo_lote} />
        <InfoItem label="Consecutivo de lote" value={activo.lote_afconsecutivo} />
        <InfoItem label="Total del lote" value={activo.lote_total} />
        <InfoItem label="Depreciación aplicada" value={activo.depreciacion_aplicada} />
        <InfoItem label="Creado" value={formatDate(activo.created_at)} />
        <InfoItem label="Actualizado" value={formatDate(activo.updated_at)} />
        <InfoItem label="📝 Observaciones" value={activo.observaciones} className="info-item-wide" />
        {additionalFields.map(([key, value]) => <InfoItem key={key} label={key.replaceAll('_', ' ')} value={value} />)}
      </div></div>
    </div>
    <div className="qr-footer"><p>Código QR: <strong>{valueOrNA(qraf?.codigo_qr || activo.codigo || codigoQR)}</strong></p><p>Última actualización: {formatDate(lastUpdate)}</p></div>
  </div></div>;
};

export default ActivoQRPublic;
