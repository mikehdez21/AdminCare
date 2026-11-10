import React from 'react';

import type { CampoEsquema } from '@/@types/HelpdeskTypes/configuracionTypes';

interface Props {
  campos: CampoEsquema[];
  valores: Record<string, unknown>;
  onCambio: (campo: string, valor: unknown) => void;
}

/**
 * Dibuja los campos de un `EsquemaNivel`.
 *
 * Existía porque `AddClasificacion` y `EditClasificacion` tenían el mismo bloque
 * de cuatro `campo.tipo === ...` copiado: lo único que cambiaba era de dónde
 * salían los valores. Aquí se decide una vez cómo se ve cada tipo.
 */
const CamposEsquema: React.FC<Props> = ({ campos, valores, onCambio }) => {
  return (
    <>
      {campos.map((campo) => (
        <label key={campo.nombre}>
          {campo.etiqueta}
          {campo.requerido ? ' *' : ''}

          {campo.tipo === 'area' && (
            <textarea maxLength={campo.max} value={String(valores[campo.nombre] ?? '')} onChange={(e) => onCambio(campo.nombre, e.target.value)} />
          )}

          {campo.tipo === 'texto' && (
            <input type='text' maxLength={campo.max} value={String(valores[campo.nombre] ?? '')} onChange={(e) => onCambio(campo.nombre, e.target.value)} />
          )}

          {campo.tipo === 'seleccion' && (
            <select value={String(valores[campo.nombre] ?? '')} onChange={(e) => onCambio(campo.nombre, e.target.value === '' ? '' : Number(e.target.value))}>
              <option value=''>Seleccione…</option>
              {campo.opciones?.map((o) => (
                <option key={o.valor} value={o.valor}>{o.texto}</option>
              ))}
            </select>
          )}

          {campo.tipo === 'interruptor' && (
            <select value={valores[campo.nombre] === true ? '1' : '0'} onChange={(e) => onCambio(campo.nombre, e.target.value === '1')}>
              <option value='1'>Sí</option>
              <option value='0'>No</option>
            </select>
          )}
        </label>
      ))}
    </>
  );
};

export default CamposEsquema;