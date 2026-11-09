import type { AccionPermiso } from '@/@types/mainTypes';

/**
 * Cadena de acciones: `eliminar` implica `escritura` y `escritura` implica
 * `lectura`. Es el espejo de `App\Support\Permisos`.
 */
const CADENA: Record<AccionPermiso, AccionPermiso[]> = {
  lectura: ['lectura', 'escritura', 'eliminar'],
  escritura: ['escritura', 'eliminar'],
  eliminar: ['eliminar'],
};

export const ACCIONES_INFO: { clave: AccionPermiso; etiqueta: string; descripcion: string }[] = [
  {
    clave: 'lectura',
    etiqueta: 'Lectura',
    descripcion: 'Consulta listados y detalle, sin crear ni modificar nada.',
  },
  {
    clave: 'escritura',
    etiqueta: 'Escritura',
    descripcion: 'Crea, edita y opera registros. Incluye la lectura.',
  },
  {
    clave: 'eliminar',
    etiqueta: 'Eliminar',
    descripcion: 'Borra, desactiva o cancela registros. Incluye escritura y lectura.',
  },
];

/** Cualquier acción del recurso (`X.lectura`, `X.escritura` o `X.eliminar`). */
export const hasPermission = (permissions: string[] = [], name: string) =>
  permissions.some((permission) =>
    permission === name
      || permission.startsWith(`${name}.`)
  );

export const hasActionPermission = (
  permissions: string[] = [],
  base: string,
  action: AccionPermiso
) => permissions.includes(base)
  || CADENA[action].some((candidata) => permissions.includes(`${base}.${candidata}`));

/**
 * Si el usuario tiene cualquier capacidad dentro de un dominio o recurso.
 * Es la regla de navegación: una entrada se pinta si puedes hacer algo ahí.
 */
export const tieneCapacidadEn = (permissions: string[] = [], prefijo: string) =>
  permissions.some((permission) => permission === prefijo || permission.startsWith(`${prefijo}.`));

export const hasAnyPermission = (permissions: string[] = [], names: string[]) =>
  names.some((name) => hasPermission(permissions, name));
