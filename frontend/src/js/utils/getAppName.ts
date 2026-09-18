/**
 * Obtiene el nombre de la aplicación desde la variable de entorno VITE_APP_NAME.
 * - DEV: retorna el valor de VITE_APP_NAME del .env local (ej. 'PruebasDev')
 * - PRUEBAS: retorna el valor de VITE_APP_NAME de .env.pruebas (ej. 'PruebasHSSAdminCare')
 * - PROD: retorna el valor de VITE_APP_NAME de .env.produccion
 * - Fallback: 'Nombre de la App'
 */
export function getAppName(): string {
  return import.meta.env.APP_NAME || 'AdminCare';
}
