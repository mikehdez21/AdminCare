import React from 'react';
import { IoIosCard } from 'react-icons/io';
import { FormasPago, TiposMoneda } from '@/@types/fiscalTypes';

interface FacturaDatosPagoProps {
  formaPago: number;
  setFormaPago: (value: number) => void;
  tipoMoneda: number;
  setTipoMoneda: (value: number) => void;
  formasPago: FormasPago[];
  tiposMoneda: TiposMoneda[];
}

/**
 * Sección datosPago (Forma de Pago y Moneda) compartida por AddFactura y EditFactura.
 * Idéntica en ambos formularios, por lo que no requiere props de configuración.
 */
const FacturaDatosPago: React.FC<FacturaDatosPagoProps> = ({
  formaPago,
  setFormaPago,
  tipoMoneda,
  setTipoMoneda,
  formasPago,
  tiposMoneda,
}) => {
  return (
    <section className='datosPago'>

      <div className='title_Container'>
        <h2> <IoIosCard className='infoPago' />  Información de Pago </h2>
      </div>

      <div className='inputs_Container'>
        <label> Forma de Pago*
          <select
            required
            value={formaPago || ''}
            onChange={e => setFormaPago(Number(e.target.value))}
          >
            <option value="">Seleccionar Forma de Pago</option>
            {Array.isArray(formasPago) && formasPago.map((formaPago) => (
              <option key={formaPago.id_formapago} value={formaPago.id_formapago}>
                {formaPago.descripcion_formaspago}
              </option>
            ))}

          </select>
        </label>

        <label> Moneda de Pago de la Factura*
          <select
            required
            value={tipoMoneda || ''}
            onChange={e => setTipoMoneda(Number(e.target.value))}
          >
            <option value="">Seleccionar Tipo de Moneda</option>
            {Array.isArray(tiposMoneda) && tiposMoneda.map(moneda => (
              <option key={moneda.id_tipomoneda} value={moneda.id_tipomoneda}>
                {moneda.descripcion_tipomoneda}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

export default FacturaDatosPago;