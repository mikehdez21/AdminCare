import dayjs, {Dayjs} from 'dayjs';

export const formatDateHorasToFrontend = (dateString: string | Date | number | null): string | null => {
  if (!dateString) return null;
  try {
    const date = dayjs(dateString);
    return date.isValid() ? date.format('DD/MM/YYYY h:mm A') : null;
  } catch (error) {
    console.error('Fecha inválida:', dateString, error);
    return null;
  }
};

export const formatDateHorasToInputs = (dateString: string | Date | number | null): string | null => {
  if (!dateString) return null;
  try {
    const date = dayjs(dateString);
    return date.isValid() ? date.format('YYYY-MM-DDTHH:mm') : null; // Ej: "2024-03-15T10:00"
  } catch (error) {
    console.error('Fecha inválida:', dateString, error);
    return null;
  }
}

export const formatDateHorasToBackend = (dateString: string | Date | number | null): string | null => {
  if (!dateString) return null;
  try {
    const date = dayjs(dateString);
    return date.isValid() ? date.toISOString() : null; // Ej: "2024-03-15T10:00:00.000Z"
  } catch (error) {
    console.error('Fecha inválida:', dateString, error);
    return null;
  }
};


export const formatDateNacimientoToFrontend = (dateString: string | Date | number | null): string | null => {
  if (!dateString) return null;
  try {
    const date = dayjs(dateString);
    return date.isValid() ? date.format('DD/MM/YYYY') : null;
  } catch (error) {
    console.error('Fecha inválida:', dateString, error);
    return null;
  }
};

export const formatDateNacimientoToBackend = (dateString: string | Date | number | null): string | null => {
  if (!dateString) return null;
  try {
    const date = dayjs(dateString);
    return date.isValid() ? date.format('YYYY-MM-DD') : null; // Ej: "2024-03-15"
  } catch (error) {
    console.error('Fecha inválida:', dateString, error);
    return null;
  }
};


/**
 * Intenta parsear una fecha en varios formatos comunes
 */
export const safeParseDate = (
  dateString: string | Date | number | null | undefined
): Dayjs | null => {
  if (!dateString) return null;

  // Si ya es objeto Date válido
  if (dateString instanceof Date) {
    return dayjs(dateString);
  }

  // Limpiar espacios extras
  const cleaned = String(dateString).trim();

  // Caso especial: "0000-00-00"
  if (cleaned === '0000-00-00') return null;

  // Lista de formatos posibles
  const possibleFormats = [
    'DD/MM/YYYY',           // "22/08/1992"
    'DD/MM/YYYY HH:mm',     // "22/08/2025 14:30"
    'DD/MM/YYYY hh:mm A',   // "22/08/2025 12:00 AM"
    'YYYY-MM-DD',           // "2025-05-15"
    'YYYY-MM-DD HH:mm',     // "2025-05-15 14:30"
    'YYYY-MM-DDTHH:mm',     // "2025-05-15T14:00"
  ];

  // Modo estricto: solo pasa si el formato coincide exactamente
  let parsed = dayjs(cleaned, possibleFormats, true);

  // Si sigue inválido, intenta sin strict parsing
  if (!parsed.isValid()) {
    parsed = dayjs(cleaned);
  }

  return parsed.isValid() ? parsed : null;
};