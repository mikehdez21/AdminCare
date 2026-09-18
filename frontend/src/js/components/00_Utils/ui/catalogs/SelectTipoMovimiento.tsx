import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectTipoMovimientoProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectTipoMovimiento: React.FC<SelectTipoMovimientoProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const tipoMovimientoAF = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);

  const options: SelectOption[] = tipoMovimientoAF.map((tipo) => ({
    value: tipo.id_tipomovimientoaf ?? 0,
    label: tipo.nombre_tipomovimientoaf,
  }));

  return (
    <SelectField
      label="Tipo de Movimiento*"
      name="id_tipo_movimiento"
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
};

export default SelectTipoMovimiento;