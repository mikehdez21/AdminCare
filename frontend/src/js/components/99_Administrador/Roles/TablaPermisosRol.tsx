import React, { useMemo, useState } from 'react';
import { GroupedPermission, Permission } from '@/@types/mainTypes';

interface TablaPermisosRolProps {
  permisos: Permission[];
  selectedPermisos: number[];
  onTogglePermiso: (permisoId: number) => void;
}

type AccionPermiso = 'escritura' | 'lectura' | 'control';

const ACCIONES: AccionPermiso[] = ['escritura', 'lectura', 'control'];

export const agruparPermisosPorModulo = (permisos: Permission[]): GroupedPermission[] => {
  const moduloMap = new Map<string, GroupedPermission>();

  const obtenerOCrearGrupo = (modulo: string): GroupedPermission => {
    let grupo = moduloMap.get(modulo);
    if (!grupo) {
      grupo = { modulo };
      moduloMap.set(modulo, grupo);
    }
    return grupo;
  };

  for (const permiso of permisos) {
    const nombre = permiso.name;
    const ultimoPunto = nombre.lastIndexOf('.');

    // Permiso base: sin sufijo de acción. Asegura que exista el grupo cuyo
    // módulo es su nombre completo, para que el módulo aparezca aunque solo
    // exista la base y las acciones se unan al mismo grupo.
    if (ultimoPunto === -1) {
      obtenerOCrearGrupo(nombre);
      continue;
    }

    const modulo = nombre.slice(0, ultimoPunto);
    const accion = nombre.slice(ultimoPunto + 1);

    if (accion === 'lectura' || accion === 'escritura' || accion === 'control') {
      const grupo = obtenerOCrearGrupo(modulo);
      grupo[accion] = permiso;
    }
  }

  return Array.from(moduloMap.values());
};

export const formatearNombreModulo = (modulo: string): string => {
  return modulo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
};

export const TablaPermisosRol: React.FC<TablaPermisosRolProps> = ({ permisos, selectedPermisos, onTogglePermiso }) => {
  const [busqueda, setBusqueda] = useState<string>('');

  const grupos = useMemo(() => agruparPermisosPorModulo(permisos), [permisos]);

  const gruposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return grupos;

    return grupos.filter((grupo) => {
      const moduloRaw = grupo.modulo.toLowerCase();
      const moduloFormateado = formatearNombreModulo(grupo.modulo).toLowerCase();

      return moduloRaw.includes(texto) || moduloFormateado.includes(texto);
    });
  }, [grupos, busqueda]);

  const hayResultados = gruposFiltrados.length > 0;

  const renderCheckbox = (permiso?: Permission) => {
    if (!permiso || permiso.id == null) {
      return (
        <input
          type="checkbox"
          disabled
          title="Permiso no disponible"
          className="checkboxPermiso_Roles checkboxPermisoDeshabilitado_Roles"
        />
      );
    }

    const permisoId = Number(permiso.id);

    return (
      <input
        type="checkbox"
        checked={selectedPermisos.includes(permisoId)}
        onChange={() => onTogglePermiso(permisoId)}
        className="checkboxPermiso_Roles"
      />
    );
  };

  return (
    <>
      <section className='dataInputs_Roles'>
        <div className='divSearch_Permission'>
          <label>
            Buscar permiso:
            <input
              type="text"
              value={busqueda}
              id='searchPermiso'
              name='searchPermiso'
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder='Buscar permiso...'
            />
          </label>
        </div>
      </section>

      <section className='tablePermisos_Roles'>
        <table>
          <thead>
            <tr>
              <th>Permiso</th>
              <th>Escritura</th>
              <th>Lectura</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {gruposFiltrados.map((grupo) => (
              <tr key={grupo.modulo}>
                <td className='celdaNombreModulo_Roles' title={grupo.modulo}>
                  {formatearNombreModulo(grupo.modulo)}
                </td>
                {ACCIONES.map((accion) => (
                  <td key={accion} className='celdaCheckbox_Roles'>
                    {renderCheckbox(grupo[accion])}
                  </td>
                ))}
              </tr>
            ))}

            {!hayResultados && (
              <tr className='filaSinResultados_Roles'>
                <td colSpan={4}>No se encontraron permisos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default TablaPermisosRol;
