// Regimen Fiscal
export interface RegimenFiscal{
    id_regimenfiscal?: number;
    descripcion_regimenfiscal: string;
    created_at?: string;
    updated_at?: string | null;
  };

// Formas de Pago
export interface FormasPago{
    id_formapago?: number;
    descripcion_formaspago: string;
    created_at?: string;
    updated_at?: string | null;
  };

// Tipos de Regimen
export interface TiposMoneda{
    id_tipomoneda?: number;
    descripcion_tipomoneda: string;
    created_at?: string;
    updated_at?: string | null;
  };

// Tipos de Facturacion
export interface TiposFacturacion{
    id_tipofacturacion?: number;
    descripcion_tipofacturacion: string;
    created_at?: string;
    updated_at?: string | null;
  };