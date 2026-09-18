import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectFormaPagoProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectFormaPago: React.FC<SelectFormaPagoProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const formasPago = useSelector((state: RootState) => state.fiscal.formasPago);

  const options: SelectOption[] = formasPago.map((formaPago) => ({
    value: formaPago.id_formapago ?? 0,
    label: formaPago.descripcion_formaspago,
  }));

  return (
    <SelectField
      label="Forma de Pago*"
      name="id_forma_pago"
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

export default SelectFormaPago;