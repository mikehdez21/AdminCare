
// Proveedores
export interface Proveedores{
    id_proveedor?: number;
    nombre_proveedor: string;
    razon_social: string;
    email_proveedor: string;
    telefono_proveedor: string;
    sitioWeb: string;
    rfc: string;
    estatus_activo: boolean;
    id_tipo_moneda: number;
    id_tipo_proveedor: number;
    id_forma_pago: number;
    id_tipo_regimen: number;
    id_tipo_descuento: number;
    id_tipo_facturacion: number;
    created_at?: string;
    updated_at?: string | null; 

  };

// Tipos Proveedores
export interface TiposProveedores{
      id_tipoproveedor?: number;
      descripcion_tipoproveedor: string;
      created_at?: string;
      updated_at?: string | null;
    };

// Descuentos Proveedor
export interface DescuentosProveedor{
    id_descuento_proveedor?: number;
    descripcion_descuentoproveedor: string;
    created_at?: string;
    updated_at?: string | null;
  };