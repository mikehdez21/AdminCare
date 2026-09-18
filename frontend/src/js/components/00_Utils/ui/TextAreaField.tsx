import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  className?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  className = '',
  rows,
  cols,
  ...rest
}) => {
  return (
    <label>
      {label}
      <textarea
        className={className}
        rows={rows}
        cols={cols}
        {...rest}
      />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
};

export default TextAreaField;