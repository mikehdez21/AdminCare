import { useMemo } from 'react';
import { toSafeNumber } from '@/utils/numbersFormat';
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

/**
 * Activo agrupado con información de índices para navegación.
 */
export type ActivoFacturaConIndices = ActivoFactura & {
  _indices?: number[];
  _clave?: string;
};

/**
 * Hook que agrupa activos de factura por clave visual (nombre, clasificación, costo, observaciones, lote).
 * Extraído del useMemo idéntico copiado en AddFactura.tsx (~116-146) y EditFactura.tsx (~88-118).
 *
 * @param activosFactura - Lista plana de activos de la factura
 * @returns Array de activos agrupados con campos _indices y _clave
 */
export function useSeriesAgrupadas(
  activosFactura: ActivoFactura[],
): ActivoFacturaConIndices[] {
  return useMemo(() => Array.from(
    activosFactura.reduce((mapa, activo, idx) => {
      const clave = [
        activo.nombre_af || '',
        activo.id_clasificacion || 0,
        toSafeNumber(activo.costo_unitario_af, 0),
        (activo.observaciones_af || '').trim(),
        activo.codigo_lote || '',
      ].join('|');

      const existente = mapa.get(clave);

      if (!existente) {
        mapa.set(clave, {
          ...activo,
          cantidad: toSafeNumber(activo.cantidad, 0) || 1,
          _indices: [idx],
          _clave: clave,
        });
        return mapa;
      }

      mapa.set(clave, {
        ...existente,
        cantidad: toSafeNumber(existente.cantidad, 0) + (toSafeNumber(activo.cantidad, 0) || 1),
        _indices: [...(existente._indices || []), idx],
      });

      return mapa;
    }, new Map<string, ActivoFacturaConIndices>()).values()
  ), [activosFactura]);
}
