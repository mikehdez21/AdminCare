/**
 * Utilidades para formatear números de manera segura
 */

/**
 * Convierte un valor a número de manera segura
 * @param value - Valor a convertir
 * @param defaultValue - Valor por defecto si la conversión falla
 * @returns Número válido
 */
export const toSafeNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Formatea un número como moneda con 2 decimales
 * @param value - Valor a formatear
 * @param defaultValue - Valor por defecto si la conversión falla
 * @returns String formateado con 2 decimales
 */
export const formatCurrency = (value: number | string | null | undefined, defaultValue: number = 0): string => {
  const safeNumber = toSafeNumber(value, defaultValue);
  return safeNumber.toFixed(2);
};

/**
 * Formatea un número como moneda con símbolo de peso
 * @param value - Valor a formatear
 * @param defaultValue - Valor por defecto si la conversión falla
 * @returns String formateado con símbolo de peso
 */
export const formatPeso = (value: number | string | null | undefined, defaultValue: number = 0): string => {
  return `$${formatCurrency(value, defaultValue)}`;
};

/**
 * Formatea un número con separadores de miles
 * @param value - Valor a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @param defaultValue - Valor por defecto si la conversión falla
 * @returns String formateado con separadores de miles
 */
export const formatNumberWithSeparators = (
  value: number | string | null | undefined, 
  decimals: number = 2, 
  defaultValue: number = 0
): string => {
  const safeNumber = toSafeNumber(value, defaultValue);
  return safeNumber.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea un número como moneda mexicana completa
 * @param value - Valor a formatear
 * @param defaultValue - Valor por defecto si la conversión falla
 * @returns String formateado como moneda mexicana
 */
export const formatMexicanCurrency = (value: number | string | null | undefined, defaultValue: number = 0): string => {
  const safeNumber = toSafeNumber(value, defaultValue);
  return safeNumber.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });
};

/**
 * Convierte un valor a número para inputs, manejando strings vacíos
 * @param value - Valor del input
 * @returns Número válido o 0 si está vacío
 */
export const parseInputNumber = (value: string | number): number => {
  if (typeof value === 'string' && value.trim() === '') {
    return 0;
  }
  return toSafeNumber(value, 0);
};