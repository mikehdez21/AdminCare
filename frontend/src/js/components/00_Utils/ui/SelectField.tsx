import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  placeholder = 'Seleccionar…',
  error,
  className = '',
  ...rest
}) => {
  return (
    <label>
      {label}
      <select className={className} {...rest}>
        {placeholder !== '' && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
};

export default SelectField;