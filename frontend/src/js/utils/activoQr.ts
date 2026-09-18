/** URL pública que se codifica en las etiquetas. El QR no contiene datos del activo. */
export function getActivoQrUrl(codigo: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/activosfijos/qraf/${encodeURIComponent(codigo)}`;
}

export function getActivoQrPayload(codigo: string): string {
  return getActivoQrUrl(codigo);
}
