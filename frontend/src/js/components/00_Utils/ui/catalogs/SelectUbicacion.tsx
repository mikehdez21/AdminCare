import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectUbicacionProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectUbicacion: React.FC<SelectUbicacionProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);

  const options: SelectOption[] = ubicaciones.map((ubicacion) => ({
    value: ubicacion.id_ubicacion ?? 0,
    label: ubicacion.nombre_ubicacion,
  }));

  return (
    <SelectField
      label="Ubicación Actual*"
      name="id_ubicacion_actual"
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

export default SelectUbicacion;