import React from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { FaCalendar } from 'react-icons/fa';
import { AiOutlineNumber } from 'react-icons/ai';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';

interface FacturaDatosGeneralesProps {
  /** Título del bloque de ID (Add: "   ID de Factura ", Edit: "ID de Factura"). */
  tituloId: string;
  /** Valor del ID mostrado (Add: próximo ID, Edit: id de la factura a editar). */
  idFacturaValor: number | string | undefined;
  fechaRecepcion: string;
  setFechaRecepcion: (value: string) => void;
  /** Lista de proveedores YA ordenada por el padre (Add ordena alfabéticamente; Edit usa el orden del store). */
  proveedores: Proveedores[];
  tiposFactura: TiposFacturasAF[];
  proveedorFactura: number;
  setProveedorFactura: (value: number) => void;
  tipoFactura: number;
  setTipoFactura: (value: number) => void;
  /** Add inicia con getAñoActual(); Edit inicia undefined y se rellena al cargar. */
  añoFactura: number | undefined;
  setAñoFactura: (value: number) => void;
  numeroFactura: string;
  setNumeroFactura: (value: string) => void;
  /** Placeholder del campo de año (Add: "Año de Factura", Edit: "Año"). */
  placeholderAño?: string;
  /** true → numeroFactura se ingresa en mayúsculas (Add); false → tal cual (Edit). */
  uppercaseNumero?: boolean;
}

/**
 * Secciones id_FechaFactura y datosFactura compartidas por AddFactura y EditFactura.
 * Reproduce el DOM exacto de ambos formularios (mismo <label>/<select>/<input>),
 * parametrizando únicamente las diferencias Add vs Edit (título de ID, valor de ID,
 * orden de proveedores, placeholder de año y mayúsculas en el número de factura).
 */
const FacturaDatosGenerales: React.FC<FacturaDatosGeneralesProps> = ({
  tituloId,
  idFacturaValor,
  fechaRecepcion,
  setFechaRecepcion,
  proveedores,
  tiposFactura,
  proveedorFactura,
  setProveedorFactura,
  tipoFactura,
  setTipoFactura,
  añoFactura,
  setAñoFactura,
  numeroFactura,
  setNumeroFactura,
  placeholderAño = 'Año',
  uppercaseNumero = false,
}) => {
  const handleNumeroFacturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumeroFactura(uppercaseNumero ? e.target.value.toUpperCase() : e.target.value);
  };

  return (
    <>
      <section className='id_FechaFactura'>

        <div className='idFactura'>
          <h2>{tituloId}</h2>
          <p> <AiOutlineNumber className='idIcon' /> {idFacturaValor} </p>
        </div>

        <div className='fechaRecepcion'>

          <label>
            <h2><FaCalendar className='icon_FechaRecepcion' /> Fecha de Recepción*</h2>

            <input
              type="datetime-local"
              name="fechaRecepcion"
              required
              value={fechaRecepcion}
              onChange={e => setFechaRecepcion(e.target.value)}
            />
          </label>

        </div>

      </section>

      <section className='datosFactura'>

        <div className='title_Container'>
          <h2> <FaCircleInfo className='infoIcon' />  Información de la Factura </h2>
        </div>

        <div className='inputs_Container'>

          <label>
            Proveedor*
            <select
              required
              value={proveedorFactura || ''}
              onChange={e => setProveedorFactura(Number(e.target.value))}
            >
              <option value="">Seleccionar Proveedor</option>
              {Array.isArray(proveedores) && proveedores.map((proveedor) => (
                <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                  {proveedor.nombre_proveedor}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de Factura*
            <select
              required
              value={tipoFactura || ''}
              onChange={e => setTipoFactura(Number(e.target.value))}
            >
              <option value="">Seleccionar Tipo de Factura</option>
              {Array.isArray(tiposFactura) && tiposFactura.map((tipoFactura) => (
                <option key={tipoFactura.id_tipofacturaaf} value={tipoFactura.id_tipofacturaaf}>
                  {tipoFactura.nombre_tipofactura}
                </option>
              ))}
            </select>
          </label>

          <label>
            Número de Factura (SIGHA, otros)*
            <div>
              <input
                type="text"
                placeholder="NOF"
                value='NOF'
                disabled
              />
              <strong>-</strong>
              <input
                type="number"
                placeholder={placeholderAño}
                value={añoFactura}
                onChange={e => setAñoFactura(Number(e.target.value))}
              />
              <strong>-</strong>
              <input
                type="text"
                placeholder="Número de Factura"
                value={numeroFactura}
                onChange={handleNumeroFacturaChange}
                required
              />
            </div>

          </label>

        </div>

      </section>
    </>
  );
};

export default FacturaDatosGenerales;