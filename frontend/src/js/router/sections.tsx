import React from 'react';

// Components
import AdminDashboard from '@/components/01_HomeDashboard/AdminDashboard';

// AlmacenGeneral
import Main_AlmacenGeneral from '@/components/02_Almacenes/AlmacenGeneral/AlmacenGeneral';

// Contabilidad
import Main_DepreciacionControl from '@/components/03_Contabilidad/DepreciacionAF/DepreciacionControl';
import Main_ConfigContabilidadControl from '@/components/03_Contabilidad/Configuración/ConfigContabilidadControl';

// Administrador
import Main_UsuariosControl from '@/components/99_Administrador/Usuarios/UsuariosControl';
import Main_EmpleadosControl from '@/components/99_Administrador/Empleados/EmpleadosControl';
import Main_DepartamentosControl from '@/components/99_Administrador/Departamentos/DepartamentoControl';
import Main_RolesControl from '@/components/99_Administrador/Roles/RolesControl';
import Main_UbicacionesControl from '@/components/99_Administrador/Ubicaciones/UbicacionControl';

/**
 * Mapa declarativo de secciones: path-prefix → componente.
 * Ordenado por longitud descendente de prefijo para evitar coincidencias parciales.
 * Cada pathname se compara con startsWith contra estos prefijos.
 */
export const SECTIONS: readonly { path: string; Component: React.ComponentType | null }[] = [
  { path: '/contabilidad/depreciacion-af', Component: Main_DepreciacionControl },
  { path: '/contabilidad/depreciacionaf', Component: Main_DepreciacionControl },
  { path: '/contabilidad/configuracion',  Component: Main_ConfigContabilidadControl },
  { path: '/contabilidad/auditoria',      Component: null }, // Sin componente — preservar comportamiento actual
  { path: '/gestion-ubicaciones',         Component: Main_UbicacionesControl },
  { path: '/gestion_ubicaciones',         Component: Main_UbicacionesControl },
  { path: '/gestion-departamentos',       Component: Main_DepartamentosControl },
  { path: '/gestion_departamentos',       Component: Main_DepartamentosControl },
  { path: '/gestion-empleados',           Component: Main_EmpleadosControl },
  { path: '/gestion_empleados',           Component: Main_EmpleadosControl },
  { path: '/gestion-usuarios',            Component: Main_UsuariosControl },
  { path: '/gestion_usuarios',            Component: Main_UsuariosControl },
  { path: '/gestion-roles',               Component: Main_RolesControl },
  { path: '/gestion_roles',               Component: Main_RolesControl },
  { path: '/almacen-general',             Component: Main_AlmacenGeneral },
  { path: '/almacen_general',             Component: Main_AlmacenGeneral },
  { path: '/admin',                       Component: AdminDashboard },
] as const;

/**
 * Dado un pathname, devuelve el componente de la sección correspondiente o null.
 */
export function getSectionForPath(pathname: string): React.ComponentType | null {
  for (const section of SECTIONS) {
    if (pathname === section.path || pathname.startsWith(section.path + '/')) {
      return section.Component;
    }
  }
  return null;
}

/**
 * Determina si una sección está activa dada la URL actual.
 * Se usa en el sidebar para el resaltado CSS.
 */
export function isSectionActive(pathname: string, sectionPath: string): boolean {
  return pathname === sectionPath || pathname.startsWith(sectionPath + '/');
}
