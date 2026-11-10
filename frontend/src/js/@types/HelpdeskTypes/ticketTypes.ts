//
// HELPDESK TYPES //
// Los nombres de campo replican las columnas reales: el backend responde
// `response()->json(['success', 'message', 'data', 'meta'])` con modelos Eloquent
// crudos, sin Resources ni proyección de campos.
//

// === CATÁLOGOS ===

// Categoría: departamento responsable que atiende el ticket.
export interface CategoriaTicket {
  id_categoria_ticket?: number;
  nombre_categoria: string;
  descripcion_categoria: string | null;
  id_departamento_default: number | null;
  estatus_activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  departamento_default?: HelpdeskDepartamento | null;
  subcategorias?: SubcategoriaTicket[];
}

// Subcategoría: nivel intermedio, el solicitante nunca la elige (llega aplanada
// dentro del título). Solo se usa en administración y filtrado.
export interface SubcategoriaTicket {
  id_subcategoria_ticket?: number;
  id_categoria_ticket: number;
  nombre_subcategoria: string;
  descripcion_subcategoria: string | null;
  estatus_activo: boolean;
  /** `false` = actividad interna del personal que atiende tickets, no una solicitud de fuera. */
  es_publico?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// Título: opción de problema que sí elige el solicitante. `GET
// helpdesk/categorias/{id}/titulos` lo devuelve aplanado con su subcategoría.
export interface TituloTicket {
  id_titulo_ticket?: number;
  nombre_titulo_ticket: string;
  descripcion_titulo_ticket: string | null;
  estatus_activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  id_subcategoria_ticket?: number;
  nombre_subcategoria?: string;
  /** Solo en `GET helpdesk/titulos` (listado por subcategoría). */
  subcategoria?: SubcategoriaTicket | null;
}

export interface PrioridadTicket {
  id_prioridad_ticket?: number;
  nombre_prioridad: string;
  descripcion_prioridad?: string | null;
  nivel_prioridad: number;
  color: string | null;
  estatus_activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  sla?: SLANivel | null;
}

export interface SLANivel {
  id_sla_nivel?: number;
  id_prioridad_ticket: number;
  /** `decimal(6,2) NOT NULL` en BD: no admiten null. */
  tiempo_respuesta_horas: number;
  tiempo_resolucion_horas: number;
  descripcion_sla: string | null;
  estatus_activo: boolean;
  /** Solo en `GET helpdesk/slas`. */
  prioridad?: PrioridadTicket | null;
}

export interface EstatusTicket {
  id_estatus_ticket?: number;
  nombre_estatus: string;
  descripcion_estatus: string | null;
  es_estado_final: boolean;
  orden_flujo: number;
  color: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HelpdeskEtiqueta {
  id_etiqueta?: number;
  nombre_etiqueta: string;
  color: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// === RELACIONES DEL TICKET (trimmed en `Ticket::scopeConDetalle`) ===

export interface HelpdeskUsuario {
  id_usuario?: number;
  nombre_usuario: string;
  /** Lo devuelve el backend en `solicitante`; se usa para decidir si quien mira el
   *  ticket es del mismo departamento y por eso puede tomar el ticket. */
  id_departamento?: number | null;
  /** `id_empleado` del usuario, para comparar contra el responsable del ticket. */
  id_empleado?: number | null;
}

/**
 * Técnico que atiende el ticket. Es un empleado, no un usuario:
 * `Ticket::tecnico()` es `belongsTo(Empleado, id_responsable, id_empleado)` y
 * `scopeConDetalle` lo recorta a estas columnas.
 */
export interface HelpdeskTecnico {
  id_empleado?: number;
  nombre_empleado: string;
  apellido_paterno: string | null;
  apellido_materno: string | null;
}

/** Empleado asociable al ticket nuevo (respuesta de `GET helpdesk/empleados`). */
export interface HelpdeskEmpleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_paterno: string | null;
  apellido_materno: string | null;
}

/**
 * Personas que atienden el ticket: el responsable espejado más hasta cuatro
 * colaboradores (`helpdesk.tableInter_ticketsTecnicos`, una fila por ticket).
 *
 * `id_responsable` repite el valor de `Ticket.id_responsable`: es el mismo dato en
 * las dos tablas. Los colaboradores son información de apoyo; el único que manda
 * —estatus, filtro y permisos— es el responsable.
 */
export interface TicketTecnicos {
  id_ticket_tecnico?: number;
  id_ticket: number;
  id_responsable: number | null;
  id_tecnico_dos: number | null;
  id_tecnico_tres: number | null;
  id_tecnico_cuatro: number | null;
  id_tecnico_cinco: number | null;

  responsable?: HelpdeskTecnico | null;
  tecnico_dos?: HelpdeskTecnico | null;
  tecnico_tres?: HelpdeskTecnico | null;
  tecnico_cuatro?: HelpdeskTecnico | null;
  tecnico_cinco?: HelpdeskTecnico | null;
}

export interface HelpdeskDepartamento {
  id_departamento?: number;
  nombre_departamento: string;
}

export interface HelpdeskUbicacion {
  id_ubicacion?: number;
  nombre_ubicacion: string;
}

// === TICKET ===

export interface Ticket {
  id_ticket?: number;
  folio_ticket: string;
  titulo_ticket: string;
  descripcion_ticket: string;
  id_categoria_ticket: number;
  id_subcategoria_ticket: number | null;
  id_titulo_ticket: number;
  id_prioridad_ticket: number;
  id_estatus_ticket: number;
  id_usuario_solicitante: number;
  /** Empleado en cuyo nombre se levantó el ticket. */
  id_empleado_solicitante: number;
  /**
   * Responsable de atender el ticket: guarda el `id_empleado` (FK a
   * `tableEmpleados`), no el `id_usuario`. Es quien manda.
   */
  id_responsable: number | null;
  id_ubicacion: number | null;
  ticket_reapertura: boolean;
  fecha_primer_respuesta: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;
  fecha_limite_respuesta: string | null;
  fecha_limite_resolucion: string | null;
  fecha_reapertura: string | null;

  /** Bandera que filtra en la mesa y enciende la sección del detalle (CORR-030). */
  error_proveedor?: boolean;

  created_at?: string | null;
  updated_at?: string | null;

  categoria?: CategoriaTicket | null;
  subcategoria?: SubcategoriaTicket | null;
  titulo?: TituloTicket | null;
  prioridad?: PrioridadTicket | null;
  estatus?: EstatusTicket | null;
  solicitante?: HelpdeskUsuario | null;
  empleadoSolicitante?: HelpdeskEmpleado | null;
  tecnico?: HelpdeskTecnico | null;
  /** Responsable espejado + colaboradores. Solo en el detalle y los listados. */
  tecnicos?: TicketTecnicos | null;
  /** Detalle del error de proveedor: proveedor, quién resuelve, sistema, etc. */
  errorProveedorDetalle?: ErrorProveedorDetalle | null;
  /** Departamento del solicitante. No hay columna propia en el ticket: el backend lo
   *  resuelve con `hasOneThrough` a partir de `solicitante`. */
  departamento?: HelpdeskDepartamento | null;
  ubicacion?: HelpdeskUbicacion | null;
  etiquetas?: HelpdeskEtiqueta[];

  /** Solo en `GET helpdesk/tickets/{id}`. */
  avances?: AvanceTicket[];
  actividades?: ActividadTicket[];
  encuesta?: EncuestaSatisfaccion | null;
}

// Payload de `POST/PUT helpdesk/tickets` (lo que el cliente puede fijar).
export interface TicketFormData {
  descripcion_ticket: string;
  id_categoria_ticket: number | null;
  id_titulo_ticket: number | null;
  id_prioridad_ticket: number | null;
  id_empleado_solicitante: number | null;
  id_ubicacion: number | null;
  etiquetas: number[];
}

// === ERRORES DE PROVEEDOR (CORR-030) ===

/**
 * Proveedor de error. `requiere_sistema` es el switch del catálogo: cuando está
 * encendido, capturar su error pide sistema, no. de ticket externo, módulo y
 * personal SAC. HSS vive en esta misma lista porque es quien suele resolver.
 */
export interface HelpdeskProveedorError {
  id_proveedor_error?: number;
  nombre_proveedor_error: string;
  id_departamento: number | null;
  requiere_sistema: boolean;
  estatus_activo: boolean;
  departamento?: HelpdeskDepartamento | null;
}

/** Sistema de un proveedor. Hoy solo Reliv tiene. */
export interface HelpdeskSistemaProveedor {
  id_sistema_proveedor?: number;
  id_proveedor_error: number;
  nombre_sistema_proveedor: string;
  estatus_activo: boolean;
  proveedor_error?: HelpdeskProveedorError | null;
}

/** Módulo de SIHO, para el desplegable de "Módulo". */
export interface HelpdeskModuloSIHO {
  id_modulo_siho?: number;
  nombre_modulo: string;
  estatus_activo: boolean;
}

/**
 * Error de proveedor de un ticket: una fila por ticket. `proveedor_error` es quien
 * lo causó y `soluciona_error` quien lo resuelve; ambos salen del mismo catálogo.
 */
export interface ErrorProveedorDetalle {
  id_error_proveedor?: number;
  id_ticket: number;
  id_proveedor_error: number;
  id_soluciona_error: number | null;
  id_sistema: number | null;
  no_ticket_externo: string | null;
  id_modulo_sistema: number | null;
  personal_sac: boolean | null;

  proveedor_error?: HelpdeskProveedorError | null;
  soluciona_error?: HelpdeskProveedorError | null;
  sistema?: HelpdeskSistemaProveedor | null;
  modulo?: HelpdeskModuloSIHO | null;
}

/**
 * Payload de `PUT helpdesk/tickets/{id}/error-proveedor`. La bandera enciende la
 * sección del detalle; los demás campos solo aplican cuando el proveedor trae
 * `requiere_sistema` (si no, el backend los guarda en null).
 */
export interface ErrorProveedorPayload {
  error_proveedor: boolean;
  id_proveedor_error?: number | null;
  id_soluciona_error?: number | null;
  id_sistema?: number | null;
  no_ticket_externo?: string | null;
  id_modulo_sistema?: number | null;
  personal_sac?: boolean | null;
}

/**
 * Payload de `PUT helpdesk/tickets/{id}/tecnicos`.
 *
 * El responsable es obligatorio y los cuatro colaboradores son opcionales, en
 * orden de captura. Los huecos que no viajan se quedan como estaban; para vaciar
 * uno hay que mandarlo en `null`.
 */
export interface TecnicosPayload {
  id_responsable: number;
  id_tecnico_dos?: number | null;
  id_tecnico_tres?: number | null;
  id_tecnico_cuatro?: number | null;
  id_tecnico_cinco?: number | null;
}

/** Filtros de `GET helpdesk/tickets`; solo se envían los que el usuario fijó. */
/**
 * Centinela que viaja por query string para el filtro "Sin asignar".
 *
 * Duplica `TicketQueryService::SIN_ASIGNAR` en PHP: un `null` no puede ir en la
 * query porque el cliente lo descarta antes de enviarla, y un id inventado revienta
 * el tipo en Postgres. Debe cambiar en los dos lados a la vez.
 */
export const SIN_ASIGNAR = 'sin_asignar';

export type IdAsignable = number | typeof SIN_ASIGNAR;

export interface TicketFiltros {
  id_estatus_ticket?: number | null;
  id_prioridad_ticket?: number | null;
  id_categoria_ticket?: number | null;
  id_subcategoria_ticket?: number | null;
  id_titulo_ticket?: number | null;
  /** Admite `SIN_ASIGNAR` para filtrar los que no tienen responsable. */
  id_responsable?: IdAsignable | null;
  /** `true` = solo errores de proveedor; `false` = solo los que no lo son. */
  error_proveedor?: boolean | null;
  /** Proveedor que causó el error. Cuelga de `error_proveedor = true`. */
  id_proveedor_error?: number | null;
  id_usuario_solicitante?: number | null;
  ticket_reapertura?: boolean | null;
  fecha_desde?: string | null;
  fecha_hasta?: string | null;
}

// === BITÁCORA ===

export interface AvanceTicket {
  id_avance_ticket?: number;
  id_ticket: number;
  id_usuario_autor: number;
  contenido_avance: string;
  es_interno: boolean;
  fecha_eliminado?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  autor?: HelpdeskUsuario | null;
}

export interface ActividadTicket {
  id_actividad_ticket?: number;
  id_ticket: number;
  id_usuario_actor: number;
  tipo_actividad: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  descripcion_actividad: string | null;
  created_at?: string | null;
  actor?: HelpdeskUsuario | null;
}

export interface EncuestaSatisfaccion {
  id_encuesta_satisfaccion?: number;
  id_ticket: number;
  calificacion: number;
  comentario_satisfaccion: string | null;
  id_usuario_evaluador: number;
  created_at?: string | null;
  updated_at?: string | null;
}

// === DASHBOARD ===

/**
 * Conteo de un catálogo del dashboard, ya normalizado.
 *
 * El backend lo emite con las claves de columna de cada catálogo
 * (`id_estatus_ticket`/`nombre_estatus`, `id_prioridad_ticket`/`nombre_prioridad`,
 * `id_departamento`/`nombre_departamento`); `normalizarConteos` en
 * `helpdeskDashboardActions` lo aplana a esta forma única.
 */
export interface HelpdeskConteoCatalogo {
  id: number;
  nombre: string;
  color?: string | null;
  total: number;
}

export interface HelpdeskSla {
  total_medibles: number;
  cumplidos: number;
  porcentaje_cumplimiento: number | null;
}

export interface HelpdeskDashboard {
  total_tickets: number;
  tickets_reabiertos: number;
  por_estatus: HelpdeskConteoCatalogo[];
  por_prioridad: HelpdeskConteoCatalogo[];
  por_departamento: HelpdeskConteoCatalogo[];
  /** Los diez solicitantes con más tickets abiertos. */
  por_solicitante: HelpdeskConteoCatalogo[];
  /** Los diez títulos con más tickets (el catálogo tiene 48). */
  por_titulo: HelpdeskConteoCatalogo[];
  /** Incluye "Sin asignar" para los tickets sin responsable. */
  por_responsable: HelpdeskConteoCatalogo[];
  /** Solo los tickets con error de proveedor capturado. */
  por_error_proveedor: HelpdeskConteoCatalogo[];
  sla: HelpdeskSla;
}
