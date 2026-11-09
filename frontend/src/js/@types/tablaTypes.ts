// Tipos compartidos por las tablas ordenables/filtrables.
// No dependen de React para poder reutilizarse desde utils y hooks.

export type TipoFiltro = 'texto' | 'seleccion' | 'fecha' | 'booleano';

export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

export interface FiltroColumna {
  tipo: TipoFiltro;
  opciones?: OpcionFiltro[];
  placeholder?: string;
}

export type ValorOrdenable = string | number | boolean | Date | null | undefined;
