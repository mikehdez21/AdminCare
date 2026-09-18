import { useMemo, useState } from 'react';
import type { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

/**
 * Resultado del hook useBusquedaActivos.
 */
export interface UseBusquedaActivosResult<T extends ActivosFijos> {
  /** Texto de búsqueda actual */
  busqueda: string;
  /** Setter del texto de búsqueda */
  setBusqueda: (valor: string) => void;
  /** Lista filtrada por nombre/código/marca/modelo (case-insensitive) */
  activosFiltrados: T[];
}

/**
 * Hook que encapsula la búsqueda de activos compartida por AddActivosFactura y
 * AsociarActivosFactura. Replica EXACTAMENTE el filtro que estaba copiado idéntico
 * en ambos modales: filtra por nombre_af, codigo_unico, marca_af o modelo_af
 * (case-insensitive). No unifica flujos: solo comparte la lógica de búsqueda.
 *
 * @param activos - Lista de activos a filtrar
 */
export function useBusquedaActivos<T extends ActivosFijos>(
  activos: T[],
): UseBusquedaActivosResult<T> {
  const [busqueda, setBusqueda] = useState<string>('');

  const activosFiltrados = useMemo<T[]>(() => {
    const searchTerm = busqueda.toLowerCase();

    return activos.filter((activo) => {
      if (!activo || !activo.nombre_af) return false;

      return (
        activo.nombre_af.toLowerCase().includes(searchTerm) ||
        (activo.codigo_unico && activo.codigo_unico.toLowerCase().includes(searchTerm)) ||
        (activo.marca_af && activo.marca_af.toLowerCase().includes(searchTerm)) ||
        (activo.modelo_af && activo.modelo_af.toLowerCase().includes(searchTerm))
      );
    });
  }, [activos, busqueda]);

  return { busqueda, setBusqueda, activosFiltrados };
}