import React from 'react';
import Field from '@/components/00_Utils/ui/Field';
import TextAreaField from '@/components/00_Utils/ui/TextAreaField';
import SelectField from '@/components/00_Utils/ui/SelectField';
import { ActivoFijoFormBindings, ActivoFijoOpciones, ActivoFijoSetters, ActivoFijoValores } from '@/hooks/useActivoFijoForm';

interface ActivoFijoFormFieldsProps {
  /** Bindings del formulario (valores + setters + opciones) expuestos por useActivoFijoForm. */
  bindings: ActivoFijoFormBindings;
  /** true → descripción y observaciones como <textarea> (AddActivoFijo); false → <input type="text"> (EditActivoFijo). */
  textareaFields?: boolean;
  /** true → muestra los placeholders de los campos de texto (AddActivoFijo); false → sin placeholders (EditActivoFijo). */
  placeholders?: boolean;
  /** true → el costo unitario lleva step="any" min="0" (EditActivoFijo); false → sin esos atributos (AddActivoFijo). */
  costoStep?: boolean;
}

/**
 * Los 13 campos base del formulario de Activo Fijo (nombreAF, descripcionAF, ... , observacionesAF),
 * compartidos por AddActivoFijo y EditActivoFijo. Reproduce el DOM exacto de cada formulario
 * mediante los props textareaFields / placeholders / costoStep.
 */
const ActivoFijoFormFields: React.FC<ActivoFijoFormFieldsProps> = ({
  bindings,
  textareaFields = false,
  placeholders = false,
  costoStep = false,
}) => {
  const valores: ActivoFijoValores = bindings.valores;
  const setters: ActivoFijoSetters = bindings.setters;
  const opciones: ActivoFijoOpciones = bindings.opciones;
  const upper = bindings.upper;

  return (
    <div className='addActivoFijo_FirstColumn'>

      <h2> Datos del Activo Fijo </h2>

      <section className='inputs_addActivoFijo'>

        <Field
          label='*Nombre del Activo Fijo:'
          type="text"
          value={valores.nombreAF}
          placeholder={placeholders ? 'Nombre del AF' : undefined}
          onChange={(e) => setters.setNombreAF(upper(e.target.value))}
          style={{ textTransform: 'uppercase' }}
          required
        />

        {textareaFields ? (
          <TextAreaField
            label='Descripción:'
            value={valores.descripcionAF}
            placeholder={placeholders ? 'Descripción Física del AF' : undefined}
            onChange={(e) => setters.setDescripcionAF(upper(e.target.value))}
            style={{ textTransform: 'uppercase' }}
          />
        ) : (
          <Field
            label='Descripción:'
            value={valores.descripcionAF}
            onChange={(e) => setters.setDescripcionAF(upper(e.target.value))}
            style={{ textTransform: 'uppercase' }}
            type="text"
          />
        )}

        <Field
          label='*Modelo:'
          type="text"
          value={valores.modeloAF}
          placeholder={placeholders ? 'Modelo del AF' : undefined}
          onChange={(e) => setters.setModeloAF(upper(e.target.value))}
          style={{ textTransform: 'uppercase' }}
        />

        <Field
          label='*Marca:'
          type="text"
          value={valores.marcaAF}
          placeholder={placeholders ? 'Marca del AF' : undefined}
          onChange={(e) => setters.setMarcaAF(upper(e.target.value))}
          style={{ textTransform: 'uppercase' }}
        />

        <Field
          label='*No. de Serie:'
          type="text"
          value={valores.noSerieAF}
          placeholder={placeholders ? 'Número de Serie del AF' : undefined}
          onChange={(e) => setters.setNoSerieAF(upper(e.target.value))}
          style={{ textTransform: 'uppercase' }}
        />

        <SelectField
          label='*Estatus del Activo Fijo:'
          required
          value={valores.tipoEstatusAF || ''}
          onChange={(e) => setters.setTipoEstatusAF(Number(e.target.value))}
          placeholder="Seleccione una opción"
          options={opciones.estatus}
        />

        <label htmlFor="">
          *Activo Propio:
          <select
            required
            value={valores.afPropio ? '1' : '0'}
            onChange={(e) => {
              const esPropio = e.target.value === '1';
              setters.setAFPropio(esPropio);
              if (!esPropio) {
                setters.setCostoUnitarioAF(0);
              }
            }}
          >
            <option value="" disabled>Seleccione una opción</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>

        <label htmlFor="">
          *Activo Menor:
          <select
            required
            value={valores.afMenor ? '1' : '0'}
            onChange={(e) => {
              const esMenor = e.target.value === '1';
              setters.setAFMenor(esMenor);
              if (esMenor) {
                setters.setTipoClasificacionAF(null);
              }
            }}
          >
            <option value="" disabled>Seleccione una opción</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>

        <Field
          label={`*Costo Unitario${valores.afPropio ? '' : ' (Comodato)'}:`}
          type="number"
          placeholder='0.00'
          value={valores.costoUnitarioAF}
          disabled={!valores.afPropio}
          {...(costoStep ? { step: 'any', min: '0' } : {})}
          onChange={(e) => {
            const valor = e.target.value;
            if (valor === '') {
              setters.setCostoUnitarioAF(0);
            } else {
              setters.setCostoUnitarioAF(parseFloat(valor) || 0);
            }
          }}
          onFocus={(e) => {
            if (valores.costoUnitarioAF === 0) {
              e.target.select();
            }
          }}
        />

        <SelectField
          label='*Clasificación del Activo Fijo:'
          required
          value={valores.tipoClasificacionAF || ''}
          disabled={valores.afMenor}
          onChange={(e) => setters.setTipoClasificacionAF(Number(e.target.value))}
          placeholder="Seleccione una opción"
          options={opciones.clasificacion}
        />

        <Field
          label='*Fecha de Registro:'
          type="datetime-local"
          value={valores.fechaRegistroAF}
          onChange={(e) => setters.setFechaRegistroAF(e.target.value)}
        />

        {textareaFields ? (
          <TextAreaField
            className='observacionesAF'
            label='Observaciones:'
            value={valores.observacionesAF}
            placeholder={placeholders ? 'Observaciones sobre el AF' : undefined}
            onChange={(e) => setters.setObservacionesAF(upper(e.target.value))}
            style={{ textTransform: 'uppercase' }}
          />
        ) : (
          <Field
            type="text"
            className='observacionesAF'
            label='Observaciones:'
            value={valores.observacionesAF}
            onChange={(e) => setters.setObservacionesAF(upper(e.target.value))}
            style={{ textTransform: 'uppercase' }}
          />
        )}

      </section>

    </div>
  );
};

export default ActivoFijoFormFields;