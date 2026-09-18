/**
 * Helper global para extraer y sanitizar mensajes de error del backend.
 *
 * - Extrae `message`/`error`/`data`/`errors` de la respuesta HTTP.
 * - Concatena mensajes de validación de campos de forma legible.
 * - SANITIZA contenido que pueda revelar información interna del sistema:
 *   SQL, nombres de tablas/columnas, rutas de servidor, stack traces,
 *   excepciones Laravel, tokens, etc.
 * - Conserva mensajes de validación de campos legibles
 *   (p.ej. "El campo nombre es requerido").
 * - Devuelve siempre un string legible; si no hay mensaje útil, usa
 *   el `fallback` o un genérico.
 */

// ---------------------------------------------------------------------------
// Patrones de sanitización — se aplican sobre el texto ya extraído antes de
// devolverlo al caller.
// ---------------------------------------------------------------------------

/** SQL internals */
const SQL_PATTERNS = [
  /(?:SQLSTATE|PDOException|QueryException|SQLSTATE\[[\w]+\])[\s:.-]*/gi,
  /(?:SELECT|INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\s+(?:TABLE|INDEX|VIEW|FROM|INTO|VALUES|SET|WHERE|JOIN)\s+\S+/gi,
  /Column\s+'[^']+'\s+cannot\s+be\s+null/gi,
  /(?:Duplicate\s+entry|Deadlock\s+found|Lock\s+wait\s+timeout)[^\n]*/gi,
  /(?:IntegrityConstraintViolation|DataException|SyntaxError)[^\n]*/gi,
];

/** Exception class names */
const EXCEPTION_PATTERNS = [
  /\b(?:ErrorException|TypeError|LogicException|RuntimeException|InvalidArgumentException|BadMethodCallException|UnexpectedValueException|OutOfBoundsException|OverflowException|UnderflowException|DivisionByZeroError|ArithmeticError|RangeError|CompileError|ParseError)\b/g,
  /\b\w+(?:Exception|Error)\b(?=[\s:.,])/g,
];

/** Laravel internals */
const LARAVEL_INTERNALS = [
  /(?:vendor\/[^\s'"]+)/g,
  /(?:app\/(?:Http|Exceptions|Providers)\/[^\s'"]+)/g,
  /(?:\\\\App\\\\[^\s'"]+)/g,
  /(?:in\s+file\s+[^\n]+?)(?:\s+on\s+line\s+\d+)?/gi,
  /(?:Stack trace:[\s\S]*)/i,
];

/** Rutas de servidor / archivos */
const FILE_PATH_PATTERNS = [
  /(?:(?:C|D|E|F):\\[^\s'"]+)/gi,
  /(?:(?:\/var\/www|\/home\/\w+|\/usr\/local|\/tmp)[^\s'"]+)/gi,
  /(?:(?:\/var\/log|\/etc\/\w+)[^\s'"]+)/gi,
];

/** Tokens / secrets */
const TOKEN_PATTERNS = [
  /(?:Bearer\s+[A-Za-z0-9\-._~+/]+=*)/gi,
  /(?:(?:api[_-]?key|token|secret|password|passwd)\s*[:=]\s*\S+)/gi,
];

/** Stack trace blocks */
const STACK_TRACE_PATTERN = /(?:Stack trace:)[\s\S]*/i;

// ---------------------------------------------------------------------------
// Funciones auxiliares
// ---------------------------------------------------------------------------

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeText(raw: string): string {
  let text = raw;

  // Eliminar stack traces completos
  text = text.replace(STACK_TRACE_PATTERN, '');

  // Eliminar rutas de archivo del servidor
  for (const pattern of FILE_PATH_PATTERNS) {
    text = text.replace(pattern, '...');
  }

  // Eliminar SQL internals
  for (const pattern of SQL_PATTERNS) {
    text = text.replace(pattern, '');
  }

  // Eliminar nombres de clases de excepción y archivos vendor
  for (const pattern of [...EXCEPTION_PATTERNS, ...LARAVEL_INTERNALS]) {
    text = text.replace(pattern, '');
  }

  // Eliminar tokens / secrets
  for (const pattern of TOKEN_PATTERNS) {
    text = text.replace(pattern, '[REDACTED]');
  }

  // Limpiar artefactos de sanitización (espacios múltiples, líneas vacías)
  text = text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[-–—]\s*$/gm, '')
    .trim();

  return text;
}

/**
 * Determina si un string sanitizado contiene información útil para el usuario
 * o si quedó vacío / irreconocible tras la sanitización.
 */
function isUsefulMessage(msg: string): boolean {
  if (!msg) return false;
  // Si solo quedan puntos suspensivos, espacios o caracteres de relleno
  const stripped = msg.replace(/[\s.\-–—,;:!?¿¡[\](){}|/\\]+/g, '');
  return stripped.length >= 3;
}

function extractValidationLines(
  bag: Record<string, string[] | string>,
): string[] {
  return Object.entries(bag).flatMap(([field, value]) => {
    if (Array.isArray(value)) {
      return value.map((msg) => `${field}: ${msg}`);
    }
    if (typeof value === 'string') {
      return [`${field}: ${value}`];
    }
    return [];
  });
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Extrae un mensaje de error legible y sanitizado de un payload backend.
 *
 * @param payload  - `error.response.data` del backend (o cualquier objeto/string).
 * @param fallback - Mensaje por defecto si no se puede extraer nada útil.
 * @returns        - Mensaje sanitizado legible para mostrar en UI.
 */
export function getBackendErrorMessage(
  payload: unknown,
  fallback = 'No se pudo completar la operación',
): string {
  // ---- 1. Extraer el mensaje crudo ----
  let raw = '';

  if (typeof payload === 'string') {
    raw = stripHtml(payload);
  } else if (payload && typeof payload === 'object') {
    const data = payload as {
      code?: string;
      message?: string;
      error?: string;
      data?: Record<string, string[] | string>;
      errors?: Record<string, string[] | string>;
    };

    if (data.code === 'DEMO_QUOTA_EXCEEDED') {
      const used = typeof (payload as { used?: unknown }).used === 'number'
        ? (payload as { used: number }).used
        : undefined;
      const limit = typeof (payload as { limit?: unknown }).limit === 'number'
        ? (payload as { limit: number }).limit
        : 100;
      return used === undefined
        ? `La cuota de la demo está llena (${limit}). No se guardaron cambios; reduce la operación o reinicia la demo.`
        : `La cuota de la demo está llena (${used}/${limit}). No se guardaron cambios; reinicia la demo para continuar.`;
    }

    if (data.code === 'DEMO_FEATURE_UNAVAILABLE') {
      return 'No disponible en la demo. Esta integración no se conecta a servicios externos.';
    }

    const baseMessage = data.message || data.error || '';
    const validationBag = data.data || data.errors;

    let validationLines: string[] = [];
    if (validationBag && typeof validationBag === 'object') {
      validationLines = extractValidationLines(validationBag);
    }

    if (validationLines.length > 0) {
      raw = [baseMessage, ...validationLines].filter(Boolean).join('\n');
    } else {
      raw = baseMessage;
    }
  }

  // ---- 2. Sanitizar ----
  if (!raw) {
    return fallback;
  }

  const sanitized = sanitizeText(raw);

  // ---- 3. Devolver el mejor mensaje posible ----
  if (isUsefulMessage(sanitized)) {
    // Truncar para evitar UI overflow
    return sanitized.slice(0, 500);
  }

  // Si la sanitización eliminó todo pero había algo original,
  // intentar devolver solo las líneas de validación que son legibles
  if (typeof payload === 'object' && payload !== null) {
    const data = payload as {
      data?: Record<string, string[] | string>;
      errors?: Record<string, string[] | string>;
    };
    const bag = data.data || data.errors;
    if (bag && typeof bag === 'object') {
      const validLines = extractValidationLines(bag).filter((line) => {
        // Solo conservar líneas que parezcan mensajes de validación legibles
        // (no SQL ni internals). Verificar que no contengan patrones peligrosos.
        const sanitizedLine = sanitizeText(line);
        return isUsefulMessage(sanitizedLine);
      });
      if (validLines.length > 0) {
        return validLines.map((l) => sanitizeText(l)).join('\n').slice(0, 500);
      }
    }
  }

  return fallback;
}
