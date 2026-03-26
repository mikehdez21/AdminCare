import { ActivoEntityResponse } from './activosFijosTypes';

//
// FACTURAS TYPES //
//

// Tipo para activos enviados al crear/actualizar factura
// Incluye todos los campos necesarios para crear un activo fijo nuevo
export interface ActivoFacturaInput {
  // Para facturas en edición: referencia a activo existente
  id_activo_fijo?: number;
  codigo_unico?: string;

  // Datos del activo fijo
  nombre_af: string;
  marca_af: string;
  modelo_af: string;
  numero_serie_af: string;
  precio_unitario_af: number;
  af_propio: boolean;
  id_estado_af: number;
  id_clasificacion: number;
  descripcion_af?: string | null;
  observaciones_af?: string | null;

  // Datos de la relación factura-activo
  cantidad: number;
  observaciones?: string | null;

  // Datos opcionales para movimiento/asignación inicial
  fecha_movimiento?: string | null;
  id_responsable_actual?: number | null;
  id_ubicacion_actual?: number | null;
  id_tipo_movimiento?: number | null;
  motivo_asignacion?: string | null;
}



export interface FacturasAF {
  id_factura?: number;
  id_proveedor: number;
  num_factura: string;
  id_tipo_factura: number;
  fecha_fac_recepcion: string;
  id_forma_pago: number | null;
  id_tipo_moneda: number | null;
  observaciones_factura?: string | null;
  subtotal_factura: number;
  descuento_factura?: number | null;
  flete_factura?: number | null;
  iva_factura: number;
  total_factura: number;
  created_at?: string;
  updated_at?: string;
  // Propiedad opcional para enviar activos al crear/actualizar factura
  activos?: ActivoFacturaInput[];
}


// Tipos de Facturas de los ActivosFijos
export interface TiposFacturasAF {
  id_tipofacturaaf?: number;
  nombre_tipofactura: string;
  descripcion_tipofactura: string;
  created_at?: string;
  updated_at?: string | null;
}


// 
// Relación Factura-Activos //
//

export interface FacturaDetalle {
  id_facturaactivos: number;
  id_factura: number;
  id_activo_fijo: number;
  observaciones_detalleaf?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

// Tipo para respuestas API de activos de factura
export interface ActivosFacturaApiResponse {
  success: boolean;
  activosFactura?: ActivoEntityResponse[];
  message: string;
}
