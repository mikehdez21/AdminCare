import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectTipoMonedaProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectTipoMoneda: React.FC<SelectTipoMonedaProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const tiposMoneda = useSelector((state: RootState) => state.fiscal.tiposMoneda);

  const options: SelectOption[] = tiposMoneda.map((moneda) => ({
    value: moneda.id_tipomoneda ?? 0,
    label: moneda.descripcion_tipomoneda,
  }));

  return (
    <SelectField
      label="Tipo de Moneda*"
      name="id_tipo_moneda"
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

export default SelectTipoMoneda;