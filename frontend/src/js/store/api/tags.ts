export type EntidadesTag =
  | 'Rol'
  | 'Permiso'
  | 'User'
  | 'Empleado'
  | 'Departamento'
  | 'Ubicacion'
  | 'Activo'
  | 'MovimientoAF'
  | 'VWMovimientoAF'
  | 'EstatusAF'
  | 'Clasificacion'
  | 'Factura'
  | 'Proveedor'
  | 'TipoMoneda'
  | 'FormaPago'
  | 'TipoFactura'
  | 'FiscalCatalog';

export function tagLista<T extends EntidadesTag>(type: T): { type: T; id: 'LISTA' } {
  return { type, id: 'LISTA' };
}

export function tagItem<T extends EntidadesTag>(
  type: T,
  id: number | string,
): { type: T; id: string } {
  return { type, id: String(id) };
}
