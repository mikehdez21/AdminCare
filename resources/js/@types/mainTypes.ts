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
  }
  
  
export interface Departamentos{
    id_departamento?: number;
    nombre_departamento: string;
    descripcion: string;
    tipo_departamento: string;
    atiende_pacientes: boolean;
    estatus_activo: boolean;
    created_at?: string;
    updated_at?: string | null; 
  };

export interface Empleados {
    id_empleado?: number;
      nombre_empleado: string;
      apellido_paterno: string;
      apellido_materno: string;
      email_empleado: string;
      telefono_empleado: string;
      genero: string;
      fecha_nacimiento: string | null;
      estatus_activo: boolean;
      fecha_alta: string | null;
      fecha_baja: string | null; 
      foto_empleado: string | File | null;
      firma_movimientos: string;
      created_at?: string;
      updated_at?: string | null; 
      id_departamento?: number;
  }

export interface User {
    id_usuario?: number | null;
    nombre_usuario: string;
    email_usuario: string;
    password: string; 
    estatus_activo: boolean;
    usuario_compartido: boolean;
    created_at?: string;
    updated_at?: string | null; 
  
    roles: Roles[]; // Array de ROLES asociados al usuario | Revisar model_has_roles en BD
    
    id_empleado?: number;
    id_departamento?: number;
  }
  