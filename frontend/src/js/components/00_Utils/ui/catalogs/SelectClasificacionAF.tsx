import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectClasificacionAFProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectClasificacionAF: React.FC<SelectClasificacionAFProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const clasificacionesAF = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);

  const options: SelectOption[] = clasificacionesAF.map((clasificacion) => ({
    value: clasificacion.id_clasificacion ?? 0,
    label: clasificacion.nombre_clasificacion,
  }));

  return (
    <SelectField
      label="Clasificación del Activo Fijo*"
      name="id_clasificacion"
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

export default SelectClasificacionAF;