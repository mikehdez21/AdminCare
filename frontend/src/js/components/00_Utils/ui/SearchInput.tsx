import React from 'react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  className?: string;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Buscar…',
  ...rest
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default SearchInput;