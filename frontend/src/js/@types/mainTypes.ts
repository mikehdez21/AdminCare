import { ActivoEntityResponse } from './AlmacenGeneralTypes/activosFijosTypes';

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
}

export interface Permission {
  id?: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string | null;

  action?: 'lectura' | 'escritura' | 'control'; // El backend no envía este campo; se deriva del nombre del permiso

}

export interface GroupedPermission {
  modulo: string;
  lectura?: Permission;
  escritura?: Permission;
  control?: Permission;
}

// Departamentos
export interface Departamentos {
  id_departamento?: number;
  nombre_departamento: string;
  descripcion: string;
  atiende_pacientes: boolean;
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
  created_at?: string;
  updated_at?: string | null;

  roles: Roles[]; // Array de ROLES asociados al usuario | Revisar model_has_roles en BD

  id_empleado?: number | null;
  id_departamento?: number;
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
