// types/Depreciacion.ts

import { ActivosFijos } from './activosFijosTypes';

export interface MetodoDepreciacion {
    id_metodo_depreciacion: number;
    nombre_metodo: string;
    descripcion_metodo?: string;
    formula?: string;
    tasa_default?: number;
    activo: boolean;
}

export interface ActivoConDepreciacion extends ActivosFijos {
    ultima_depreciacion?: DepreciacionRecord;
    fecha_vencimiento_depreciacion?: string | null;
    dias_restantes_vencimiento?: number | null;
}

export interface DepreciacionRecord {
    id_depreciacionaf: number;
    id_activo_fijo: number;
    anio_depreciacionaf: number;
    valor_inicialaf: number;
    valor_depreciacion_anterior: number;
    valor_depreciacion_acumulada: number;
    valor_depreciacion_anual: number;
    valor_libros_af: number;
    id_metodo_depreciacionaf?: number;
    fecha_inicio_depreciacion?: string | null;
    vida_util_anios?: number | null;
    valor_residual_af?: number | null;
    fecha_calculo_depreciacion: string;
    id_usuario_calculo?: number;
    id_estatus_depreciacion?: number;
    observaciones_depreciacionaf?: string;
    metodo_depreciacion?: MetodoDepreciacion;
}

export interface ActivarDepreciacionPayload {
    fecha_inicio_depreciacion: string;
    vida_util_anios: number;
    valor_residual_af: number;
    id_metodo_depreciacion: number;
}

export interface CalculoDepreciacionResult {
    valor_depreciacion_anual: number;
    valor_depreciacion_acumulada: number;
    valor_libros_af: number;
}