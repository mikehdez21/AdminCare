import React, { useMemo, useState } from 'react';
import { AccionPermiso, GroupedPermission, Permission } from '@/@types/mainTypes';
import { ACCIONES_INFO } from '@/utils/permissions';
import ModalInfoPermiso from './ModalInfoPermiso';

interface TablaPermisosRolProps {
  permisos: Permission[];
  selectedPermisos: number[];
  /** Solo en el alta y la edición: en modo lectura la tabla no cambia nada. */
  onTogglePermiso?: (permisoId: number) => void;
  readOnly?: boolean;
}

const ACCIONES: AccionPermiso[] = ['lectura', 'escritura', 'eliminar'];

/**
 * Agrupa por recurso usando los metadatos del backend. Un permiso sin recurso
 * conocido (manual, fuera de `config/permisos.php`) cae en "otros".
 */
export const agruparPermisosPorRecurso = (
  permisos: Permission[]
): { grupos: GroupedPermission[]; otros: Permission[] } => {
  const mapa = new Map<string, GroupedPermission>();
  const otros: Permission[] = [];

  for (const permiso of permisos) {
    const recurso = permiso.recurso;
    const accion = permiso.accion;

    if (!recurso || !accion || !ACCIONES.includes(accion)) {
      otros.push(permiso);
      continue;
    }

    if (!mapa.has(recurso)) {
      mapa.set(recurso, {
        recurso,
        etiqueta: permiso.etiqueta ?? recurso,
        dominio: permiso.dominio ?? '',
        dominio_etiqueta: permiso.dominio_etiqueta ?? '',
        descripcion: permiso.descripcion ?? '',
        acciones: permiso.acciones ?? [],
      });
    }

    mapa.get(recurso)![accion] = permiso;
  }

  const grupos = Array.from(mapa.values()).sort((a, b) => {
    const etiquetaA = `${a.dominio_etiqueta} ${a.etiqueta}`.toLowerCase();
    const etiquetaB = `${b.dominio_etiqueta} ${b.etiqueta}`.toLowerCase();

    return etiquetaA.localeCompare(etiquetaB);
  });

  return { grupos, otros };
};

export const TablaPermisosRol: React.FC<TablaPermisosRolProps> = ({
  permisos,
  selectedPermisos,
  onTogglePermiso,
  readOnly = false,
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [infoGrupo, setInfoGrupo] = useState<GroupedPermission | null>(null);

  const { grupos, otros } = useMemo(() => agruparPermisosPorRecurso(permisos), [permisos]);

  const gruposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return grupos;

    return grupos.filter((grupo) =>
      [grupo.recurso, grupo.etiqueta, grupo.dominio_etiqueta]
        .some((valor) => valor.toLowerCase().includes(texto))
    );
  }, [grupos, busqueda]);

  const otrosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return otros;

    return otros.filter((permiso) => permiso.name.toLowerCase().includes(texto));
  }, [otros, busqueda]);

  const hayResultados = gruposFiltrados.length > 0 || otrosFiltrados.length > 0;

  const renderCheckbox = (permiso?: Permission) => {
    const permisoId = permiso?.id != null ? Number(permiso.id) : null;
    const asignado = permisoId !== null && selectedPermisos.includes(permisoId);

    if (readOnly) {
      return (
        <input
          type="checkbox"
          checked={asignado}
          disabled
          title={asignado ? 'Permiso asignado' : 'Permiso no asignado'}
          className="checkboxPermiso_Roles checkboxPermisoSoloLectura_Roles"
        />
      );
    }

    if (permisoId === null) {
      return (
        <input
          type="checkbox"
          disabled
          title="Acción no aplica a este recurso"
          className="checkboxPermiso_Roles checkboxPermisoDeshabilitado_Roles"
        />
      );
    }

    return (
      <input
        type="checkbox"
        checked={asignado}
        onChange={() => onTogglePermiso?.(permisoId)}
        className="checkboxPermiso_Roles"
      />
    );
  };

  return (
    <>
      {!readOnly && (
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
      )}

      <section className='tablePermisos_Roles'>
        <table>
          <thead>
            <tr>
              <th>Permiso</th>
              {ACCIONES_INFO.map(({ clave, etiqueta }) => (
                <th key={clave}>{etiqueta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gruposFiltrados.map((grupo) => (
              <tr key={grupo.recurso}>
                <td className='celdaNombreModulo_Roles' title={grupo.recurso}>
                  <button
                    type='button'
                    className='nombrePermiso_Roles'
                    onClick={() => setInfoGrupo(grupo)}
                  >
                    {grupo.dominio_etiqueta ? `${grupo.dominio_etiqueta} › ${grupo.etiqueta}` : grupo.etiqueta}
                  </button>
                </td>
                {ACCIONES.map((accion) => (
                  <td key={accion} className='celdaCheckbox_Roles'>
                    {renderCheckbox(grupo[accion])}
                  </td>
                ))}
              </tr>
            ))}

            {otrosFiltrados.length > 0 && (
              <>
                <tr className='filaOtrosPermisosEncabezado_Roles'>
                  <th colSpan={4}>Otros permisos</th>
                </tr>
                {otrosFiltrados.map((permiso) => (
                  <tr key={permiso.id ?? permiso.name}>
                    <td className='celdaNombreModulo_Roles' colSpan={3} title={permiso.name}>
                      {permiso.name}
                    </td>
                    <td className='celdaCheckbox_Roles'>
                      <input
                        type="checkbox"
                        checked={permiso.id != null && selectedPermisos.includes(Number(permiso.id))}
                        disabled
                        title="Permiso fuera del catálogo"
                        className="checkboxPermiso_Roles checkboxPermisoSoloLectura_Roles"
                      />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {!hayResultados && (
              <tr className='filaSinResultados_Roles'>
                <td colSpan={4}>
                  {readOnly ? 'Sin permisos asignados.' : 'No se encontraron permisos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {infoGrupo !== null && (
        <ModalInfoPermiso isOpen onClose={() => setInfoGrupo(null)} grupo={infoGrupo} />
      )}
    </>
  );
};

export default TablaPermisosRol;
