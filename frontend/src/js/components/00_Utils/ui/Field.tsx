import React from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const Field: React.FC<FieldProps> = ({
  label,
  name,
  error,
  required,
  className = '',
  ...rest
}) => {
  return (
    <label>
      {label}
      <input
        name={name}
        className={className}
        required={required}
        {...rest}
      />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
};

export default Field;