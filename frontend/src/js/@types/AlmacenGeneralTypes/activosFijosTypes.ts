
//
// ACTIVOS TYPES //
//

export interface ActivosFijos {
  id_activo_fijo?: number;
  codigo_unico?: string;
  codigo_etiqueta?: string | null;
  codigo_lote?: string | null;
  lote_afconsecutivo?: number | null;
  lote_total?: number | null;
  nombre_af: string;
  descripcion_af: string;
  modelo_af: string;
  marca_af: string;
  numero_serie_af: string;
  valor_compra_af: number;
  fecha_compra_af: string | null;
  af_propio: boolean;
  id_estado_af: number | null;
  id_clasificacion: number | null;
  fecha_registro_af: string | null;
  observaciones_af: string;
  created_at?: string;
  updated_at?: string | null;
}

// Estatus Activos Fijos
export interface EstatusActivosFijos {
  id_estatusaf?: number;
  descripcion_estatusaf: string;
  created_at?: string;
  updated_at?: string | null;
}


// Clasificaciones de Activos Fijos
export interface ClasificacionesAF {
  id_clasificacion?: number;
  nombre_clasificacion: string;
  cuenta_contable: string;
  estatus_activo: boolean;
  created_at?: string;
  updated_at?: string | null;

};

// VISTA - Activos Fijos con nombres descriptivos
export interface VwMovimientosAF {
  id_activo_fijo?: number;
  codigo_unico: string;
  nombre_af: string;
  descripcion_af: string;
  modelo_af: string;
  marca_af: string;
  numero_serie_af: string;
  valor_compra_af: number;
  fecha_compra_af: string;
  fecha_registro_af: string;
  af_propio: boolean;
  observaciones_af: string;
  estado_actual: string | null;
  clasificacion: string | null;
  responsable_anterior_completo: string | null;
  responsable_actual_completo: string | null;
  departamento_actual: string | null;
  ubicacion_anterior: string | null;
  ubicacion_actual: string | null;
  fecha_ultimo_movimiento: string | null;
  ultimo_motivo_movimiento: string | null;
  tipo_movimiento: string | null;
  created_at?: string;
  updated_at?: string | null;
}

// Movimiento de Activos Fijos
export interface MovimientosActivosFijos {
  id_movimientoAF?: number;
  id_activo_fijo?: number;
  id_tipo_movimiento: number | null;
  motivo_movimiento: string;
  fecha_movimiento: string;
  id_responsable_anterior: number | null;
  id_responsable_actual: number | null;
  id_ubicacion_anterior: number | null;
  id_ubicacion_actual: number | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface TipoMovimientoAF {
  id_tipomovimientoaf?: number;
  nombre_tipomovimientoaf: string;
  descripcion_tipomovimiento: string;
  created_at?: string;
  updated_at?: string | null;
}



export interface ActivoFactura extends ActivosFijos, MovimientosActivosFijos {
  cantidad: number;
  precio_unitario: number;
  descuento_af: number;
  descuento_porcentajeaf: number;

}

// Tipo para activos recibidos del backend (con datos completos)
export interface ActivoEntityResponse {
  id_activo_fijo: number;
  nombre_af: string;
  codigo_unico: string;
  codigo_etiqueta?: string | null;
  codigo_lote?: string | null;
  lote_afconsecutivo?: number | null;
  lote_total?: number | null;
  cantidad?: number;
  id_clasificacion: number | null;
  precio_unitario: number;
  descuento_af: number;
  descuento_porcentajeaf: number;
  observaciones?: string | null;
  total: number;

}



