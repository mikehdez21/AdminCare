import type { Empleados, User } from '@/@types/mainTypes';
import type { HelpdeskTecnico, Ticket } from '@/@types/HelpdeskTypes/ticketTypes';
import { hasActionPermission } from '@/utils/permissions';

/**
 * Nombre completo del técnico/empleado, para mostrarlo en tablas y desplegables.
 * El apellido paterno viene suelto en el empleado; se une para no repetir la
 * concatenación en cada componente.
 */
export const nombreCompletoEmpleado = (e: { nombre_empleado: string; apellido_paterno?: string | null }): string =>
  [e.nombre_empleado, e.apellido_paterno].filter(Boolean).join(' ').trim();

/**
 * Empleados activos que pueden ser asignados como técnico.
 *
 * El backend (`TicketController::establecerTecnicos`) exige empleado activo, del
 * departamento que atiende la categoría y sin repetirse; aquí se replica el recorte de
 * "activo". El `atiende_helpdesk` sigue viviendo en el usuario y
 * en el departamento (decide quién *ve* la mesa), no en el empleado: un empleado se
 * asigna porque es una persona, no porque tenga un login de helpdesk.
 */
export const empleadosAsignables = (empleados: Empleados[]): Empleados[] =>
  empleados.filter(e => e.estatus_activo);

/**
 * Si el usuario tiene la gestión interna del Helpdesk: notas internas,
 * subcategorías internas y tickets ajenos. Es el espejo de
 * `helpdesk.internas.escritura`; ya no se decide por el nombre del rol.
 */
export const administraHelpdesk = (permisos: string[] = []): boolean =>
  hasActionPermission(permisos, 'helpdesk.internas', 'escritura');

/**
 * Si el alcance del usuario es global para un módulo del Helpdesk.
 *
 * El payload de autenticación solo manda los overrides; si no hay entrada, el
 * alcance es el derivado (departamento o propio) y esta función devuelve false.
 *
 * Ver todo es **supervisar**, no operar: gestionar un ticket ajeno sigue
 * dependiendo de `administraHelpdesk` o de atender la categoría.
 *
 * @param modulo `tickets` (la mesa) o `reportes` (el dashboard).
 */
export const veTodasLasMesas = (
  alcances: Record<string, string> = {},
  modulo: 'tickets' | 'reportes',
): boolean => alcances[`helpdesk.${modulo}`] === 'global';


/**
 * Si el área del usuario es la que atiende la categoría del ticket.
 *
 * `departamentos_atiende` lo manda el backend ya filtrado por las banderas del
 * usuario y del departamento —principal y pivote—, así que aquí no se vuelve a
 * consultar el catálogo de departamentos.
 *
 * Va por la categoría y no por el solicitante porque la tarjeta de `MesaAyuda`
 * se decide por `id_departamento_default`: filtrar por el departamento de
 * quien abrió el ticket hacía que un técnico entrara por una tarjeta y la lista
 * viniera vacía.
 */
export const atiendeLaCategoria = (ticket: Ticket | null | undefined, usuario: User | null | undefined): boolean => {
  if (!ticket || !usuario || usuario.atiende_helpdesk !== true) {
    return false;
  }

  const ids = usuario.departamentos_atiende?.map(d => d.id_departamento) ?? [];
  const idCategoria = ticket.categoria?.id_departamento_default;

  return idCategoria != null && ids.includes(idCategoria);
};

/**
 * Si el usuario puede ver el bloque de "error de proveedor".
 *
 * Lo ve el técnico que atiende la categoría del ticket —cualquier área, no solo
 * Sistemas— y quien tiene la gestión interna del Helpdesk.
 */
export const puedeVerErrorProveedor = (
  ticket: Ticket | null | undefined,
  usuario: User | null | undefined,
  permisos: string[] = [],
): boolean =>
  administraHelpdesk(permisos) || atiendeLaCategoria(ticket, usuario);

/**
 * Ids de los cinco huecos de `PUT helpdesk/tickets/{id}/tecnicos`, en orden:
 * `[responsable, colaborador 2, 3, 4, 5]`. Es lo que llena los selects del modal.
 */
export const idsTecnicosDelTicket = (ticket: Ticket | null | undefined): (number | null)[] => [
  ticket?.id_responsable ?? null,
  ticket?.tecnicos?.id_tecnico_dos ?? null,
  ticket?.tecnicos?.id_tecnico_tres ?? null,
  ticket?.tecnicos?.id_tecnico_cuatro ?? null,
  ticket?.tecnicos?.id_tecnico_cinco ?? null,
];

/**
 * Personas que atienden el ticket, en orden: primero el responsable y luego los
 * colaboradores. Es lo que pintan la mesa, "Mis Tickets" y el detalle.
 *
 * El responsable sale de `Ticket.tecnico` —la relación de `id_responsable`, la
 * columna que manda— y los colaboradores de los huecos de `tecnicos`. Los huecos
 * vacíos se descartan, así que el arreglo solo trae gente real.
 */
export const tecnicosDelTicket = (ticket: Ticket | null | undefined): HelpdeskTecnico[] => {
  if (!ticket) {
    return [];
  }

  const fila = ticket.tecnicos;

  return [
    ticket.tecnico ?? fila?.responsable ?? null,
    fila?.tecnico_dos ?? null,
    fila?.tecnico_tres ?? null,
    fila?.tecnico_cuatro ?? null,
    fila?.tecnico_cinco ?? null,
  ].filter((persona): persona is HelpdeskTecnico => persona != null);
};

/**
 * Empleados que se pueden elegir en un hueco del modal de técnicos: los
 * disponibles menos los ya elegidos en los **otros** huecos.
 *
 * El valor del propio hueco se conserva siempre, o el select no podría mostrarlo.
 * Es lo que impide que el mismo empleado quede como responsable y colaborador a la
 * vez; el backend vuelve a rechazarlo por si acaso (CORR-029).
 */
export const empleadosParaHueco = (
  disponibles: Empleados[],
  idsElegidos: (number | null)[],
  indice: number,
): Empleados[] => {
  const propio = idsElegidos[indice] ?? null;
  const ocupados = idsElegidos.filter((id, i) => i !== indice && id !== null);

  // El propio se conserva aunque esté repetido en otro hueco: si no, el select no
  // podría mostrar el valor que ya tiene y saldría en blanco.
  return disponibles.filter(e => e.id_empleado !== undefined
    && (e.id_empleado === propio || !ocupados.includes(e.id_empleado)));
};

/**
 * `true` si el mismo empleado quedó elegido en más de un hueco. Cubre el caso de
 * un repetido que venga sembrado del ticket, que los select ya no dejarían elegir.
 */
export const hayTecnicosRepetidos = (idsElegidos: (number | null)[]): boolean => {
  const elegidos = idsElegidos.filter((id): id is number => id !== null);

  return new Set(elegidos).size !== elegidos.length;
};

export type EstadoSla = 'cumplido' | 'incumplido' | 'pendiente' | 'vencido' | 'sin-registro';

export interface ResultadoSla {
  estado: EstadoSla;
  etiqueta: string;
  limite: string | null;
  real: string | null;
  diferencia: string;
}

const parseFechaSla = (valor: string | Date | null | undefined): Date | null => {
  if (!valor) {
    return null;
  }

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const formatoDiferenciaHoras = (ms: number): string => {
  const totalMinutos = Math.floor(Math.abs(ms) / 60000);

  if (totalMinutos < 1) {
    return 'menos de 1 min';
  }

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }

  if (minutos === 0) {
    return `${horas} h`;
  }

  return `${horas} h ${minutos} min`;
};

const evaluarHitoSla = (
  limite: string | null | undefined,
  real: string | null | undefined,
  opciones: { esSolucion?: boolean; cerradoSinResolucion?: boolean } = {},
): ResultadoSla => {
  const { esSolucion = false, cerradoSinResolucion = false } = opciones;

  const fechaLimite = parseFechaSla(limite);
  const fechaReal = parseFechaSla(real);

  if (!fechaLimite) {
    return {
      estado: 'sin-registro',
      etiqueta: 'Sin registro',
      limite: null,
      real: real ?? null,
      diferencia: '—',
    };
  }

  if (esSolucion && !fechaReal && cerradoSinResolucion) {
    return {
      estado: 'sin-registro',
      etiqueta: 'Sin registro',
      limite: limite ?? null,
      real: null,
      diferencia: '—',
    };
  }

  if (fechaReal) {
    const diff = fechaReal.getTime() - fechaLimite.getTime();

    if (diff <= 0) {
      return {
        estado: 'cumplido',
        etiqueta: 'Cumplido',
        limite: limite ?? null,
        real: real ?? null,
        diferencia: `${formatoDiferenciaHoras(diff)} antes`,
      };
    }

    return {
      estado: 'incumplido',
      etiqueta: 'Incumplido',
      limite: limite ?? null,
      real: real ?? null,
      diferencia: `${formatoDiferenciaHoras(diff)} después`,
    };
  }

  const ahora = new Date();
  const diff = ahora.getTime() - fechaLimite.getTime();

  if (diff < 0) {
    return {
      estado: 'pendiente',
      etiqueta: 'Pendiente',
      limite: limite ?? null,
      real: null,
      diferencia: `quedan ${formatoDiferenciaHoras(diff)}`,
    };
  }

  return {
    estado: 'vencido',
    etiqueta: 'Vencido',
    limite: limite ?? null,
    real: null,
    diferencia: `hace ${formatoDiferenciaHoras(diff)}`,
  };
};

/**
 * Evalúa el cumplimiento de los hitos de SLA de un ticket: primer respuesta y
 * resolución. Los límites y las fechas reales vienen del backend como strings
 * ISO o pueden ser null; el helper las parsea de forma segura.
 */
export const evaluarSlaTicket = (ticket: Ticket): { respuesta: ResultadoSla; solucion: ResultadoSla } => {
  const cerradoSinResolucion = !ticket.fecha_resolucion && Boolean(ticket.fecha_cierre);

  return {
    respuesta: evaluarHitoSla(ticket.fecha_limite_respuesta, ticket.fecha_primer_respuesta),
    solucion: evaluarHitoSla(ticket.fecha_limite_resolucion, ticket.fecha_resolucion, {
      esSolucion: true,
      cerradoSinResolucion,
    }),
  };
};