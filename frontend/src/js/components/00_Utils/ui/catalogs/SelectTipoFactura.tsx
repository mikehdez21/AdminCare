import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SelectField, { SelectOption } from '@/components/00_Utils/ui/SelectField';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { getTiposFacturas } from '@/store/almacengeneral/Facturas/facturasActions';

interface SelectTipoFacturaProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectTipoFactura: React.FC<SelectTipoFacturaProps> = ({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar…',
}) => {
  const tiposFacturas = useSelector((state: RootState) => state.facturasaf.tiposFacturas);
  const loading = useSelector((state: RootState) => state.facturasaf.tiposFacturasLoading);
  const error = useSelector((state: RootState) => state.facturasaf.tiposFacturasError);
  const dispatch = useDispatch<AppDispatch>();
  const safeTiposFacturas = Array.isArray(tiposFacturas) ? tiposFacturas : [];

  const options: SelectOption[] = safeTiposFacturas.map((tipoFactura) => ({
    value: tipoFactura.id_tipofacturaaf ?? 0,
    label: tipoFactura.nombre_tipofactura || 'Sin nombre',
  }));

  return (
    <>
      <SelectField
        label="Tipo de Factura*"
        name="id_tipo_factura"
        value={value}
        onChange={onChange}
        options={options}
        placeholder={loading ? 'Cargando tipos…' : options.length === 0 ? 'No hay registros disponibles' : placeholder}
        required={required}
        disabled={disabled || loading || options.length === 0}
        className={className}
      />
      {error && (
        <span className="field-error" role="alert">
          {error}{' '}
          <button type="button" onClick={() => void dispatch(getTiposFacturas())} disabled={loading}>Reintentar</button>
        </span>
      )}
    </>
  );
};

export default SelectTipoFactura;
