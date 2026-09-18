/** URL pública que se codifica en las etiquetas. El QR no contiene datos del activo. */
export interface ActivoQrSource {
  codigo_etiqueta?: string | null;
  codigo_unico?: string | null;
}

/**
 * Obtiene el código que debe resolver la ruta pública de QRAF.
 *
 * `codigo_etiqueta` es la fuente canónica. Se acepta un string para conservar
 * los consumidores legacy que solo disponen de `codigo_unico`.
 */
export function getActivoQrCode(source: string | ActivoQrSource): string {
  const candidatos = typeof source === 'string'
    ? [source]
    : [source.codigo_etiqueta, source.codigo_unico];
  const codigoNormalizado = candidatos.find((codigo) => codigo?.trim())?.trim() || '';

  if (!codigoNormalizado) return '';
  const codigoSinPrefijosQr = codigoNormalizado.replace(/^(?:QR)+/i, '');
  return `QR${codigoSinPrefijosQr}`;
}

export function getActivoQrUrl(source: string | ActivoQrSource): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/activosfijos/qraf/${encodeURIComponent(getActivoQrCode(source))}`;
}

export function getActivoQrPayload(source: string | ActivoQrSource): string {
  return getActivoQrUrl(source);
}
