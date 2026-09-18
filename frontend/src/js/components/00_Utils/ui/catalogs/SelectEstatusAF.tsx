import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectEstatusAFProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectEstatusAF: React.FC<SelectEstatusAFProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const estatusAF = useSelector((state: RootState) => state.estatusAF.estatusAF);

  const options: SelectOption[] = estatusAF.map((estatus) => ({
    value: estatus.id_estatusaf ?? 0,
    label: estatus.descripcion_estatusaf,
  }));

  return (
    <SelectField
      label="Estatus del Activo Fijo*"
      name="id_estado_af"
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

export default SelectEstatusAF;