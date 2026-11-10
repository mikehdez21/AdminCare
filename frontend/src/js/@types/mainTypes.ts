import { ActivoEntityResponse } from './AlmacenGeneralTypes/activosFijosTypes';

export type AccionPermiso = 'lectura' | 'escritura' | 'eliminar';

export type AlcanceValor = 'propio' | 'departamento' | 'global';

export interface AlcanceCatalogo {
  recurso: string;
  etiqueta: string;
  valores: AlcanceValor[];
}

// Roles
export interface Roles {
  id?: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string | null;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
  permissions?: Permission[]; // Array de PERMISOS asociados al rol | Revisar role_has_permissions en BD
  /** Overrides de alcance por recurso; ausente o '' = derivado. */
  alcances?: Record<string, AlcanceValor | ''>;
}

export interface Permission {
  id?: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string | null;

  /** Metadatos de `config/permisos.php`; null en permisos legacy o manuales. */
  recurso?: string | null;
  accion?: AccionPermiso | null;
  dominio?: string | null;
  dominio_etiqueta?: string | null;
  etiqueta?: string | null;
  descripcion?: string | null;
  acciones?: AccionPermiso[];
}

export interface GroupedPermission {
  recurso: string;
  etiqueta: string;
  dominio: string;
  dominio_etiqueta: string;
  descripcion: string;
  acciones: AccionPermiso[];
  lectura?: Permission;
  escritura?: Permission;
  eliminar?: Permission;
}

// Departamentos
export interface Departamentos {
  id_departamento?: number;
  nombre_departamento: string;
  descripcion: string;
  atiende_pacientes: boolean;
  atiende_helpdesk?: boolean;
  estatus_activo: boolean;
  created_at?: string;
  updated_at?: string | null;

}

// Empleados
export interface Empleados {
  id_empleado?: number;
  nombre_empleado: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: string;
  fecha_nacimiento: string | null;
  estatus_activo: boolean;
  jefatura_empleado: boolean;
  fecha_alta: string | null;
  fecha_baja: string | null;
  foto_empleado: string | File | null;
  created_at?: string;
  updated_at?: string | null;
  id_departamento?: number;
}

// Usuarios
export interface User {
  id_usuario?: number;
  nombre_usuario: string;
  email_usuario: string;
  estatus_activo: boolean;
  fecha_baja: string | null;
  usuario_compartido: boolean;
  atiende_helpdesk?: boolean;
  created_at?: string;
  updated_at?: string | null;

  roles: Roles[]; // Array de ROLES asociados al usuario | Revisar model_has_roles en BD

  id_empleado?: number | null;
  empleado?: {
    id_empleado?: number;
    nombre_empleado: string;
    apellido_paterno: string | null;
    apellido_materno: string | null;
  } | null;
  id_departamento?: number;
  departamentos_atiende?: {
    id_departamento: number;
    nombre_departamento: string;
  }[];
}

// Ubicaciones
export interface Ubicaciones {
  id_ubicacion?: number;
  nombre_ubicacion: string;
  descripcion_ubicacion: string;
  estatus_activo: boolean;
  created_at?: string;
  updated_at?: string | null;
}

// Tipo para respuestas API de activos de ubicación
export interface ActivosUbicacionApiResponse {
  success: boolean;
  activosUbicacion?: ActivoEntityResponse[];
  message: string;
}
