export const hasPermission = (permissions: string[] = [], name: string) => {
  if (permissions.includes(name)) {
    return true;
  }

  return permissions.some((permission) =>
    permission === `${name}.lectura`
        || permission === `${name}.escritura`
        || permission === `${name}.control`
  );
};

export const hasActionPermission = (
  permissions: string[] = [],
  base: string,
  action: 'lectura' | 'escritura' | 'control'
) => permissions.includes(base)
  || permissions.includes(`${base}.${action}`)
  || permissions.includes(`${base}.control`);

export const hasAnyPermission = (permissions: string[] = [], names: string[]) => names.some((name) => hasPermission(permissions, name));
