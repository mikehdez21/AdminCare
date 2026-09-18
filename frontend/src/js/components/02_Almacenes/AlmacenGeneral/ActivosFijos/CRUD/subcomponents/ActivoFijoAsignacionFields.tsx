import React from 'react';
import SelectField from '@/components/00_Utils/ui/SelectField';
import TextAreaField from '@/components/00_Utils/ui/TextAreaField';
import { ActivoFijoFormBindings, ActivoFijoOpciones, ActivoFijoSetters, ActivoFijoValores } from '@/hooks/useActivoFijoForm';

interface ActivoFijoAsignacionFieldsProps {
  /** Bindings del formulario (valores + setters + opciones) expuestos por useActivoFijoForm. */
  bindings: ActivoFijoFormBindings;
  /** true → selects deshabilitados con nota informativa (EditActivoFijo); false → formulario editable (AddActivoFijo). */
  disabled?: boolean;
}

/**
 * Los 4 campos de asignación (tipoMovimiento, responsableActual, ubicacionActual, motivoMovimiento).
 * En modo disabled (EditActivoFijo) los campos se deshabilitan y se muestra la nota informativa
 * que indica que la asignación se gestiona desde "Movimientos de Activos".
 */
const ActivoFijoAsignacionFields: React.FC<ActivoFijoAsignacionFieldsProps> = ({
  bindings,
  disabled = false,
}) => {
  const valores: ActivoFijoValores = bindings.valores;
  const setters: ActivoFijoSetters = bindings.setters;
  const opciones: ActivoFijoOpciones = bindings.opciones;
  const upper = bindings.upper;

  return (
    <div className='asignacionAF_SecondColumn'>

      <h2> Asignación del Activo Fijo </h2>

      {disabled && (
        <div className='divInfoAsignación'>
          <div>
            <span>ℹ️</span> <strong>Información:</strong>

            <p>
              Para realizar cambios en la asignación del activo fijo, dirígete a la sección <strong>Movimientos de Activos</strong>. Los campos a continuación son solo informativos.
            </p>
          </div>
        </div>
      )}

      <section className='inputs_asignacionAF'>

        <SelectField
          label='*Tipo de Movimiento:'
          required={!disabled}
          value={valores.tipoMovimiento || ''}
          onChange={(e) => setters.setTipoMovimiento(Number(e.target.value))}
          disabled={disabled}
          placeholder="Seleccione un tipo de movimiento"
          options={opciones.tipoMovimiento}
        />

        <SelectField
          label='*Responsable Actual:'
          value={valores.responsableActual || ''}
          onChange={(e) => setters.setResponsableActual(Number(e.target.value))}
          disabled={disabled}
          placeholder="Seleccione un responsable"
          options={opciones.empleados}
        />

        <SelectField
          label='*Ubicación Actual:'
          value={valores.ubicacionActual || ''}
          onChange={(e) => setters.setUbicacionActual(Number(e.target.value))}
          disabled={disabled}
          placeholder="Seleccione una ubicación"
          options={opciones.ubicaciones}
        />

        <TextAreaField
          label={disabled ? 'Motivo de asignación:' : 'Motivo de movimiento:'}
          className='textarea_motivoMovimientoAF'
          value={valores.motivoMovimiento}
          onChange={(e) => setters.setMotivoMovimiento(upper(e.target.value))}
          style={{ textTransform: 'uppercase' }}
          placeholder={disabled ? 'Ej: Asignación inicial, nuevo empleado, etc.' : 'Ej: Movimiento de ubicación, reasignación, etc.'}
          disabled={disabled}
        />

      </section>

    </div>
  );
};

export default ActivoFijoAsignacionFields;