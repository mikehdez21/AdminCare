import React from 'react';
import { FaCalculator } from 'react-icons/fa';
import { formatCurrency, parseInputNumber, formatMexicanCurrency } from '@/utils/numbersFormat';

interface FacturaTotalesProps {
  subTotalFactura: number;
  setSubTotalFactura: (value: number) => void;
  fleteFactura: number;
  setFleteFactura: (value: number) => void;
  descuentoFactura: number;
  setDescuentoFactura: (value: number) => void;
  ivaFactura: number;
  setIvaFactura: (value: number) => void;
  /** Valores calculados por useFacturaCalculos (el padre los conecta). */
  subtotalConFlete: number;
  subtotalConDescuento: number;
  baseGravable: number;
  totalFinal: number;
}

/**
 * Sección valoresFactura (Subtotal, Flete, Descuento, IVA y totales calculados)
 * compartida por AddFactura y EditFactura. Los valores calculados provienen de
 * useFacturaCalculos (ya conectado en el padre) y se pasan como props.
 */
const FacturaTotales: React.FC<FacturaTotalesProps> = ({
  subTotalFactura,
  setSubTotalFactura,
  fleteFactura,
  setFleteFactura,
  descuentoFactura,
  setDescuentoFactura,
  ivaFactura,
  setIvaFactura,
  subtotalConFlete,
  subtotalConDescuento,
  baseGravable,
  totalFinal,
}) => {
  return (
    <section className='valoresFactura'>

      <div className='title_Container'>
        <h2> <FaCalculator className='valoresIcon' />  Valores Monetarios de la Factura </h2>
      </div>

      <div className='inputs_Container'>
        <label> Subtotal*
          <input
            type="number"
            step="0.01"
            name="subtotal"
            value={formatCurrency(subTotalFactura)}
            onChange={e => setSubTotalFactura(parseInputNumber(e.target.value))}
            disabled
          />
        </label>

        <label> Flete (Valor numérico)
          <input
            type="number"
            step="0.01"
            name="flete"
            placeholder="0.00"
            value={fleteFactura || ''}
            onChange={e => setFleteFactura(parseInputNumber(e.target.value))}
          />
        </label>

        <label> Descuento Aplicado (Valor numérico)
          <input
            type="number"
            step="0.01"
            name="descuento"
            placeholder="0.00"
            value={descuentoFactura || ''}
            onChange={e => setDescuentoFactura(parseInputNumber(e.target.value))}
          />
        </label>

        <label> IVA (16%)
          <input
            type="number"
            step="0.01"
            name="IVA"
            value={formatCurrency(ivaFactura)}
            onChange={e => setIvaFactura(parseInputNumber(e.target.value))}
            disabled
          />
        </label>

      </div>

      <div className='totalFactura'>
        <div className='totalFacturaLabel'>
          <p id='subTotalFacturaConFlete'> Subtotal (Con Flete): </p>
          <p id='subTotalFacturaConDescuento'> Subtotal (Con Descuento): </p>
          <p id='subTotalSinIVA'> Subtotal (Subtotal Sin IVA): </p>

          <p id='totalFacturaFinal'> Total Final: </p>

        </div>

        <div className='totalFacturaCalculado'>

          <p id='subTotalFacturaConFleteValue'>
            {formatMexicanCurrency(subtotalConFlete)}
          </p>

          <p id='subTotalFacturaConDescuentoValue'>
            {formatMexicanCurrency(subtotalConDescuento)}
          </p>

          <p id='subTotalSinIVAValue'>
            {formatMexicanCurrency(baseGravable)}
          </p>

          <p id='totalFacturaFinalValue'>
            {formatMexicanCurrency(totalFinal)}
          </p>
        </div>
      </div>

    </section>
  );
};

export default FacturaTotales;