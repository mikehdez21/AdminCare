//
// HELPDESK · TIPOS DE CONFIGURACIÓN
//
// Contratos de la pantalla `Helpdesk → Configuración`. Los payloads viven aquí y
// no en `ticketTypes` porque son exclusivamente de esta pantalla: los tipos de
// las entidades (`CategoriaTicket`, `SLANivel`, etc.) se usan también en el
// detalle de ticket y en los formularios, así que siguen en `ticketTypes.ts`.
//
// Los nombres de campo replican las columnas reales: el backend responde con
// modelos Eloquent crudos, sin Resources.
//

// === PAYLOADS DE ALTA Y EDICIÓN ===

/**
 * `estatus_activo` es opcional a propósito: al crear, el backend toma el
 * `default(true)` de la columna y no hace falta mandarlo.
 */
export interface CategoriaTicketPayload {
  nombre_categoria: string;
  descripcion_categoria?: string | null;
  id_departamento_default?: number | null;
  estatus_activo?: boolean;
}

export interface SubcategoriaTicketPayload {
  id_categoria_ticket: number;
  nombre_subcategoria: string;
  descripcion_subcategoria?: string | null;
  /** `false` = actividad interna del personal que atiende tickets. */
  es_publico?: boolean;
  estatus_activo?: boolean;
}

export interface TituloTicketPayload {
  id_subcategoria_ticket: number;
  nombre_titulo_ticket: string;
  descripcion_titulo_ticket?: string | null;
  estatus_activo?: boolean;
}

export interface PrioridadTicketPayload {
  nombre_prioridad: string;
  descripcion_prioridad?: string | null;
  nivel_prioridad: number;
  color?: string | null;
  estatus_activo?: boolean;
}

export interface SLANivelPayload {
  id_prioridad_ticket: number;
  tiempo_respuesta_horas: number;
  tiempo_resolucion_horas: number;
  descripcion_sla?: string | null;
  estatus_activo?: boolean;
}

/** La etiqueta no tiene `estatus_activo`: el catálogo es nombre y color. */
export interface HelpdeskEtiquetaPayload {
  nombre_etiqueta: string;
  color?: string | null;
}

/** Proveedor de error. `requiere_sistema` es el switch que pide los demás campos. */
export interface ProveedorErrorPayload {
  nombre_proveedor_error: string;
  id_departamento?: number | null;
  requiere_sistema?: boolean;
  estatus_activo?: boolean;
}

/** Sistema de un proveedor: cuelga del proveedor. */
export interface SistemaProveedorPayload {
  id_proveedor_error: number;
  nombre_sistema_proveedor: string;
  estatus_activo?: boolean;
}

/** Módulo de SIHO: catálogo plano. */
export interface ModuloSIHOPayload {
  nombre_modulo: string;
  estatus_activo?: boolean;
}

/**
 * El estatus tampoco tiene `estatus_activo`: se borra en duro, igual que la
 * etiqueta. La diferencia es que `Tickets.id_estatus_ticket` es `NOT NULL` con
 * `ON DELETE RESTRICT`, así que el estatus es parte de la identidad del ticket y
 * no de su histórico.
 *
 * `orden_flujo` va siempre requerido porque la columna es `smallInteger NOT
 * NULL`, también al editar. `es_estado_final` sí se manda en la edición, para
 * poder pasar de `true` a `false`.
 */
export interface EstatusTicketPayload {
  nombre_estatus: string;
  descripcion_estatus?: string | null;
  es_estado_final?: boolean;
  orden_flujo: number;
  color?: string | null;
}

// === ESQUEMA DE LA CADENA DE CLASIFICACIÓN ===

/**
 * Los tres niveles de la clasificación se administran con los mismos tres
 * componentes (alta, edición y baja), así que el formulario se describe con
 * datos en vez de escribirse tres veces.
 */
export type NivelClasificacion = 'categoria' | 'subcategoria' | 'titulo';

export type TipoCampo = 'texto' | 'area' | 'seleccion' | 'interruptor';

export interface CampoEsquema {
  /** Nombre de la columna: es también la clave del payload. */
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido?: boolean;
  /** `maxLength` del input. */
  max?: number;
  opciones?: { valor: number; texto: string }[];
  /** Valor con el que arranca el formulario en el alta. */
  valorInicial?: unknown;
}

export interface EsquemaNivel {
  /** Columna de la llave primaria; también identifica el catálogo. */
  idCampo: string;
  /** Columna del nombre: la que se muestra en la fila y en las confirmaciones. */
  nombreCampo: string;
  singular: string;
  plural: string;
  /** Columna del padre. Se fija al crear y no se edita. */
  padreCampo?: string;
  campos: CampoEsquema[];
}

// === ESTADO DE LOS MODALES ===

/** Fila y nivel abiertos en los modales de edición y baja. */
export interface SeleccionClasificacion {
  nivel: NivelClasificacion;
  entidad: Record<string, unknown>;
}