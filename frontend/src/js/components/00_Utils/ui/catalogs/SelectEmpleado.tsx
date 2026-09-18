import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectEmpleadoProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectEmpleado: React.FC<SelectEmpleadoProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const empleados = useSelector((state: RootState) => state.empleados.empleados);

  const options: SelectOption[] = empleados.map((empleado) => ({
    value: empleado.id_empleado ?? 0,
    label: `${empleado.nombre_empleado} ${empleado.apellido_paterno} ${empleado.apellido_materno}`,
  }));

  return (
    <SelectField
      label="Responsable Actual*"
      name="id_responsable_actual"
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

export default SelectEmpleado;