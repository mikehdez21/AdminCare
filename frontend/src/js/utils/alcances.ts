import type { AlcanceValor } from '@/@types/mainTypes';

export const ALCANCES_LABEL: Record<AlcanceValor, string> = {
  propio: 'Propio',
  departamento: 'Departamento',
  global: 'Global',
};

/** Valor del select cuando no hay fila y el alcance se deriva. */
export const ALCANCE_DERIVADO = '';

export const etiquetaAlcance = (valor?: AlcanceValor | '' | null): string =>
  valor ? ALCANCES_LABEL[valor] : 'Derivado (automático)';
