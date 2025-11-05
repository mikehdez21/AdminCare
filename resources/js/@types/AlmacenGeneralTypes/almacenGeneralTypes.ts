export interface Proveedores{
    id_proveedor?: number;
    nombre_proveedor: string;
    razon_social: string;
    email_proveedor: string;
    telefono_proveedor: string;
    sitioWeb: string;
    rfc: string;
    id_tipo_moneda: number;
    id_tipo_proveedor: number;
    id_forma_pago: number;
    id_tipo_regimen: number;
    id_tipo_descuento: number;
    id_tipo_facturacion: number;
    created_at?: string;
    updated_at?: string | null; 

  };

export interface Clasificaciones{
    id_clasificacion?: number;
    descripcion_clasificacionaf: string;
  };

export interface TiposProveedores{
    id_tipoproveedor?: number;
    descripcion_tipoproveedor: string;
    created_at?: string;
    updated_at?: string | null;
  };

export interface FormasPago{
    id_formapago?: number;
    descripcion_formaspago: string;
    created_at?: string;
    updated_at?: string | null;
  };

export interface RegimenFiscal{
    id_regimenfiscal?: number;
    descripcion_regimenfiscal: string;
    created_at?: string;
    updated_at?: string | null;
  };

export interface DescuentosProveedor{
    id_descuento_proveedor?: number;
    descripcion_descuentoproveedor: string;
    created_at?: string;
    updated_at?: string | null;
  };

export interface TiposFacturacion{
    id_tipofacturacion?: number;
    descripcion_tipofacturacion: string;
    created_at?: string;
    updated_at?: string | null;
  };

export interface TiposMoneda{
    id_tipomoneda?: number;
    descripcion_tipomoneda: string;
    created_at?: string;
    updated_at?: string | null;
  };

//
// FACTURAS TYPES //
//

export interface FacturasAF {
  id_factura: number;
  id_proveedor: number;
  num_factura: string;
  id_tipo_factura: number;
  fecha_fac_emision: string; // formato ISO: 'YYYY-MM-DD'
  fecha_fac_recepcion: string; // formato ISO: 'YYYY-MM-DD'
  id_forma_pago: number | null;
  id_tipo_moneda: number | null;
  observaciones_factura?: string | null;
  subtotal_factura: string; // Usar string para decimales grandes
  descuento_factura?: string | null;
  flete_factura?: string | null;
  iva_factura: string;
  total_factura: string;
  created_at?: string;
  updated_at?: string;
}

export interface TiposFacturas{
  id_tipofacturaaf?: number;
  nombre_tipofactura: string;
  descripcion_tipofactura: string;
  created_at?: string;
  updated_at?: string | null;
}

//
// ACTIVOS TYPES //
//

export interface ActivosFijos {
  id_activo_fijo?: number;
  codigo_unico: string;
  id_clasificacion: string | null;
  nombre_af: string;
  descripcion_af: string;
  fecha_adquisicion_af: string;
  costo_adquisicion_af: string;
  vida_util_meses: number;
  valor_residual: number;
  id_estado_af: number | null;
  created_at?: string;
  updated_at?: string | null;
}


// 
// Relación Factura-Activos //
//

export interface FacturaDetalle{
  id_facturaactivos: number;
  id_factura: number;
  id_activo_fijo: number;
  precio_unitarioaf: number;
  cantidad_activos: number;
  observaciones_detalleaf: string;
  created_at?: string;
  updated_at?: string | null;
}