import { useMemo } from 'react';
import { toSafeNumber } from '@/utils/numbersFormat';
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

/**
 * Valores calculados de la factura (subtotal, IVA, flete, totales).
 */
export interface FacturaCalculos {
  /** Suma de costo_unitario_af * cantidad para todos los activos */
  subtotal: number;
  /** Cantidad total de unidades físicas */
  totalActivosFisicos: number;
  /** subtotal - descuento */
  subtotalConDescuento: number;
  /** subtotal + flete */
  subtotalConFlete: number;
  /** (subtotal - descuento) + flete */
  baseGravable: number;
  /** baseGravable * 0.16 */
  ivaCalculado: number;
  /** baseGravable + ivaCalculado */
  totalFinal: number;
}

/**
 * Hook que calcula los valores monetarios de la factura (subtotal, IVA, flete, totales).
 * Replica exactamente las fórmulas de AddFactura.tsx y EditFactura.tsx.
 *
 * @param activosFactura - Lista de activos asociados a la factura
 * @param descuentoFactura - Descuento aplicado a la factura
 * @param fleteFactura - Flete de la factura
 */
export function useFacturaCalculos(
  activosFactura: ActivoFactura[],
  descuentoFactura: number,
  fleteFactura: number,
): FacturaCalculos {
  const subtotal = useMemo(() => activosFactura.reduce(
    (acc, activo) => acc + toSafeNumber(activo.costo_unitario_af, 0) * toSafeNumber(activo.cantidad, 0),
    0
  ), [activosFactura]);

  const totalActivosFisicos = useMemo(() => activosFactura.reduce(
    (acc, activo) => acc + toSafeNumber(activo.cantidad, 0),
    0
  ), [activosFactura]);

  const subtotalConDescuento = subtotal - toSafeNumber(descuentoFactura, 0);
  const subtotalConFlete = subtotal + toSafeNumber(fleteFactura, 0);
  const baseGravable = subtotalConDescuento + toSafeNumber(fleteFactura, 0);
  const ivaCalculado = baseGravable * 0.16;
  const subtotalConIVA = baseGravable + ivaCalculado;
  const totalFinal = subtotalConIVA;

  return {
    subtotal,
    totalActivosFisicos,
    subtotalConDescuento,
    subtotalConFlete,
    baseGravable,
    ivaCalculado,
    totalFinal,
  };
}
