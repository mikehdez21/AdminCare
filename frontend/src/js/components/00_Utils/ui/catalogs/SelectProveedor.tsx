import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';

interface SelectProveedorProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectProveedor: React.FC<SelectProveedorProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);

  const options: SelectOption[] = proveedores.map((proveedor) => ({
    value: proveedor.id_proveedor ?? 0,
    label: proveedor.nombre_proveedor,
  }));

  return (
    <SelectField
      label="Proveedor*"
      name="id_proveedor"
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

export default SelectProveedor;