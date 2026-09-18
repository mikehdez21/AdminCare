/**
 * Validadores centralizados para formularios de Facturas y Activos Fijos.
 *
 * Cada función devuelve un objeto { title, text } si hay error, o null si la validación pasa.
 * Replican EXACTAMENTE los mensajes y condiciones de los Swal.fire originales.
 */
import { toSafeNumber } from '@/utils/numbersFormat';
import { ActivoFactura } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';

export interface ValidationError {
  title: string;
  text: string;
}

/**
 * Valida que la factura tenga al menos un activo asociado.
 * Usado en AddFactura.handleSubmit y AddActivosFactura.handleConfirmar.
 */
export function validateFacturaTieneActivos(
  activosFactura: ActivoFactura[],
): ValidationError | null {
  if (activosFactura.length === 0) {
    return {
      title: 'Activos requeridos',
      text: 'Debes agregar al menos un activo fijo antes de guardar la factura.',
    };
  }
  return null;
}

/**
 * Valida que el wizard de AddActivosFactura tenga al menos un activo.
 * Título/texto propios del modal de agregar activos a factura.
 */
export function validateWizardSinActivos(
  activosAgregados: ActivoFactura[],
): ValidationError | null {
  if (activosAgregados.length === 0) {
    return {
      title: 'Sin activos en la factura',
      text: 'Debe agregar al menos un activo para continuar.',
    };
  }
  return null;
}

/**
 * Valida que el número de factura no esté vacío.
 * Usado en AddFactura.handleSubmit y EditFactura.handleSubmit.
 */
export function validateNumeroFactura(
  numeroFactura: string,
): ValidationError | null {
  const numeroFacturaTrim = numeroFactura.trim();
  if (!numeroFacturaTrim) {
    return {
      title: 'Número de factura requerido',
      text: 'Ingresa un número de factura válido.',
    };
  }
  return null;
}

/**
 * Valida que todos los activos tengan número de serie.
 * Usado en AddFactura.handleSubmit y EditFactura.handleSubmit.
 */
export function validateSeriesRequeridas(
  activosFactura: ActivoFactura[],
): ValidationError | null {
  if (activosFactura.some(activo => !activo.numero_serie_af || !activo.numero_serie_af.trim())) {
    return {
      title: 'Número de serie requerido',
      text: 'Todos los activos deben tener un número de serie válido.',
    };
  }
  return null;
}

/**
 * Valida que todos los activos tengan responsable.
 * Usado en AddFactura.handleSubmit y EditFactura.handleSubmit.
 */
export function validateResponsablesRequeridos(
  activosFactura: ActivoFactura[],
): ValidationError | null {
  if (activosFactura.some(activo => !activo.id_responsable_actual)) {
    return {
      title: 'Responsable requerido',
      text: 'Todos los activos deben tener un responsable válido.',
    };
  }
  return null;
}

/**
 * Valida que todos los activos tengan ubicación.
 * Usado en AddFactura.handleSubmit y EditFactura.handleSubmit.
 */
export function validateUbicacionesRequeridas(
  activosFactura: ActivoFactura[],
): ValidationError | null {
  if (activosFactura.some(activo => !activo.id_ubicacion_actual)) {
    return {
      title: 'Ubicación requerida',
      text: 'Todos los activos deben tener una ubicación válida.',
    };
  }
  return null;
}

/**
 * Valida que todos los activos tengan tipo de movimiento.
 * Usado en AddFactura.handleSubmit y EditFactura.handleSubmit.
 */
export function validateTiposMovimientoRequeridos(
  activosFactura: ActivoFactura[],
): ValidationError | null {
  if (activosFactura.some(activo => !activo.id_tipo_movimiento)) {
    return {
      title: 'Tipo de movimiento requerido',
      text: 'Todos los activos deben tener un tipo de movimiento válido.',
    };
  }
  return null;
}

/**
 * Valida que un ID de factura sea válido para edición.
 * Usado en EditFactura.handleSubmit.
 */
export function validateFacturaId(
  idFactura: number | undefined,
): ValidationError | null {
  if (!idFactura) {
    return {
      title: 'Error',
      text: 'No se puede actualizar la factura. ID no válido.',
    };
  }
  return null;
}

/**
 * Valida todas las condiciones de una factura antes de guardar (AddFactura y EditFactura).
 * Retorna el primer error encontrado en orden de prioridad, o null si todo es válido.
 */
export function validateFacturaCompleta(
  activosFactura: ActivoFactura[],
  numeroFactura: string,
): ValidationError | null {
  return (
    validateFacturaTieneActivos(activosFactura) ||
    validateNumeroFactura(numeroFactura) ||
    validateSeriesRequeridas(activosFactura) ||
    validateResponsablesRequeridos(activosFactura) ||
    validateUbicacionesRequeridas(activosFactura) ||
    validateTiposMovimientoRequeridos(activosFactura)
  );
}

/**
 * Resultado de la validación de series individuales.
 */
export interface SerieValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida las series de un grupo de activos editables (modal de asignaciones).
 * Replica exactamente los checks de guardarSeries en AddFactura y EditFactura.
 *
 * @returns ValidationError | null — el primer error encontrado, o null si todo OK.
 */
export function validateSeriesActivos(
  activosEditables: ActivoFactura[],
): ValidationError | null {
  const seriesLimpias = activosEditables.map((activo) => (activo.numero_serie_af || '').trim());
  const seriesVacias = seriesLimpias.some((serie) => !serie);

  if (seriesVacias) {
    return {
      title: 'Series incompletas',
      text: 'Todos los números de serie son obligatorios.',
    };
  }

  const seriesUnicas = new Set(seriesLimpias);
  if (seriesUnicas.size !== seriesLimpias.length) {
    return {
      title: 'Series duplicadas',
      text: 'No se permiten números de serie repetidos dentro del mismo activo.',
    };
  }

  const responsablesVacios = activosEditables.some((activo) => !toSafeNumber(activo.id_responsable_actual, 0));
  const ubicacionesVacias = activosEditables.some((activo) => !toSafeNumber(activo.id_ubicacion_actual, 0));
  const tiposMovimientoVacios = activosEditables.some((activo) => !toSafeNumber(activo.id_tipo_movimiento, 0));

  if (responsablesVacios) {
    return {
      title: 'Asignaciones incompletas',
      text: 'Debes asignar un responsable a cada activo por número de serie.',
    };
  }

  if (ubicacionesVacias) {
    return {
      title: 'Ubicaciones incompletas',
      text: 'Debes asignar una ubicación actual a cada activo por número de serie.',
    };
  }

  if (tiposMovimientoVacios) {
    return {
      title: 'Tipos de movimiento incompletos',
      text: 'Debes asignar un tipo de movimiento a cada activo por número de serie.',
    };
  }

  return null;
}

/**
 * Valida las series en el wizard de AddActivosFactura (validación por activo con HTML errors).
 * Replica la lógica de handleConfirmar líneas 413-458, incluyendo el relleno de series
 * que hace ajustarArregloSeries (slice + append de cadenas vacías).
 *
 * @param activosAgregados - Lista de activos agrupados en el wizard
 * @param seriesPorActivo - Mapa de series capturadas por clave de activo
 * @param normalizarCantidad - Función que normaliza la cantidad (puede variar)
 * @returns Lista de mensajes de error (vacía si todo OK)
 */
export function validateSeriesWizard(
  activosAgregados: ActivoFactura[],
  seriesPorActivo: Record<string, string[]>,
  normalizarCantidad: (valor: number) => number,
): string[] {
  const erroresSeries: string[] = [];

  activosAgregados.forEach((activo) => {
    const cantidad = normalizarCantidad(Number(activo.cantidad || 1));
    const clave = activo.codigo_unico || `AF-${activo.id_activo_fijo || activo.nombre_af}`;
    const seriesBase = [...(seriesPorActivo[clave] || [])].slice(0, cantidad);

    while (seriesBase.length < cantidad) {
      seriesBase.push('');
    }

    const seriesCapturadas = seriesBase.map((serie) => (serie || '').trim());
    const seriesLlenas = seriesCapturadas.filter((serie) => !!serie);
    const seriesUnicas = new Set(seriesLlenas);

    if (seriesLlenas.length !== cantidad) {
      erroresSeries.push(`Completa ${cantidad} serie(s) para "${activo.nombre_af}".`);
    }

    if (seriesUnicas.size !== seriesLlenas.length) {
      erroresSeries.push(`Las series de "${activo.nombre_af}" no pueden repetirse.`);
    }
  });

  return erroresSeries;
}

/**
 * Resultado de la validación de un activo fijo.
 */
export interface ActivoFijoValidationError {
  title: string;
  text: string;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

/**
 * Valida la clasificación de un activo fijo no menor.
 * Replica el check de AddActivoFijo.handleSubmit (líneas 138-151).
 */
export function validateClasificacionActivoFijo(
  afMenor: boolean,
  tipoClasificacionAF: number | null,
): ActivoFijoValidationError | null {
  if (afMenor === false && tipoClasificacionAF === null) {
    return {
      title: 'Activo marcado como No Menor',
      text: 'Debes seleccionar la clasificación del activo fijo.',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'No, revisar',
    };
  }
  return null;
}
