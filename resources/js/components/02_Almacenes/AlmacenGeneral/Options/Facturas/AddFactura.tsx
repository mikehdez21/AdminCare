import React, {useEffect, useState} from 'react';
import { AppDispatch, RootState } from '@/store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';

import { getTiposFacturas } from '@/store/almacenGeneral/Tipos/almacenGeneralTipos_Actions';

// Components
import { FaCircleInfo, FaBoxesPacking } from 'react-icons/fa6';
import { FaCalendar, FaCalculator } from 'react-icons/fa';
import { IoIosCard } from 'react-icons/io';
import { SiGooglemessages } from 'react-icons/si';
import { IoAddCircleOutline } from 'react-icons/io5';


import '@styles/02_Almacenes/AlmacenGeneral/Facturas/AddFactura.css';

interface AddActivosFactura{
  id_activo_fijo: number | undefined;
  nombre_af: string;
  cantidad: number;
  precio_unitario: number;
}


const AddFactura: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const facturas = useSelector((state: RootState) => state.facturasaf.facturasaf);
  const proveedores = useSelector((state: RootState) => state.proveedor.proveedores);
  const tiposFactura = useSelector((state: RootState) => state.tiposAlmacenGeneral.tiposFacturas);
  const formasPago = useSelector((state: RootState) => state.tiposAlmacenGeneral.formasPago);
  const tiposMoneda = useSelector((state: RootState) => state.tiposAlmacenGeneral.tiposMoneda);
  const activosDisponibles = useSelector((state: RootState) => state.activos.activos);

  const ultimoId = facturas.length > 0
    ? Math.max(...facturas.map(factura => Number(factura.id_factura)))
    : 0;
  const nuevoId = ultimoId + 1;

  const [descuento, setDescuento] = useState<number>();
  const [flete, setFlete] = useState<number>();

  // Activos asociados a la factura
  const [activosFactura, setActivosFactura] = useState<AddActivosFactura[]>([]);

  // Subtotal, IVA y totales
  const subtotal = activosFactura.reduce(
    (acc, activo) => acc + activo.precio_unitario * activo.cantidad,
    0
  );
  const iva = +(subtotal * 0.16).toFixed(2);
  const total = subtotal + iva + (flete ? flete : 0);
  const totalConDescuento = total - (descuento ? descuento : 0);

  useEffect(() => {
    if (!tiposFactura?.length) dispatch(getTiposFacturas());
    
  }, [dispatch]);

  // Handler para agregar un activo fijo a la factura
  const handleAgregarActivo = () => {
    if (activosDisponibles.length === 0) return;
    // Por simplicidad, agrega el primero disponible (puedes mejorar con modal o select)
    const activo = activosDisponibles[0];
    if (!activo) return;
    // Evita duplicados
    if (activosFactura.some(a => a.id_activo_fijo === activo.id_activo_fijo)) return;
    setActivosFactura([
      ...activosFactura,
      {
        id_activo_fijo: activo.id_activo_fijo,
        nombre_af: activo.nombre_af,
        cantidad: 1,
        precio_unitario: Number(activo.costo_adquisicion_af) || 0,
      }
    ]);
  };

  // Handler para cambiar cantidad o precio de un activo
  const handleActivoChange = (index: number, field: 'cantidad' | 'precio_unitario', value: number) => {
    const nuevosActivos = [...activosFactura];
    nuevosActivos[index][field] = value;
    setActivosFactura(nuevosActivos);
  };

  // Handler para eliminar activo de la factura
  const handleEliminarActivo = (index: number) => {
    const nuevosActivos = [...activosFactura];
    nuevosActivos.splice(index, 1);
    setActivosFactura(nuevosActivos);
  };

  return (
    <div className='AddFactura'>

      <div className='header_AddFactura'>
        <h1>{nuevoId}</h1>
        <p>ID Consecutivo de la Factura</p>
      </div>

      <form>

        <section className='datosFactura'>

          <div className='title_Container'>
            <h2> <FaCircleInfo className='infoIcon'/>  Información de la Factura </h2>
          </div>

          <div className='inputs_Container'>

            <label htmlFor=""> Proveedor*
              <select name="proveedorFactura" id="" required>
                <option value="">Seleccionar Proveedor</option>
                {Array.isArray(proveedores) && proveedores.map((proveedor) => (
                  <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                    {proveedor.nombre_proveedor}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor=""> Tipo de Factura*
              <select name="tipoFactura" id="" required>
                <option value="">Seleccionar Tipo de Factura</option>
                {Array.isArray(tiposFactura) && tiposFactura.map((tipoFactura) => (
                  <option key={tipoFactura.id_tipofacturaaf} value={tipoFactura.id_tipofacturaaf}>
                    {tipoFactura.nombre_tipofactura}
                  </option>
                ))}
              </select>
            </label>
            
            <label htmlFor=""> Número de Factura (SIGHA, otros)
              <input type="number" name="numeroFactura" placeholder="Número de Factura" />
            </label>
          </div>
          
        </section>
        
        <section className='fechasFactura'>

          <div className='title_Container'>
            <h2> <FaCalendar className='fechasIcon'/>  Fechas de Recepción y Emisión </h2>
          </div>

          <div className='inputs_Container'>
            <label htmlFor=""> Fecha de Recepción*
              <input type="date" name="fechaRecepcion" required />
            </label>

            <label htmlFor=""> Fecha de Emisión*
              <input type="date" name="fechaEmision" required />
            </label>
            
          </div>

        </section>

        <section className='datosPago'>
          
          <div className='title_Container'>
            <h2> <IoIosCard className='infoPago'/>  Información de Pago </h2>
          </div>

          <div className='inputs_Container'>
            <label htmlFor=""> Forma de Pago*
              <select name="metodoPago" id="" required>
                <option value="">Seleccionar Forma de Pago</option>
                {Array.isArray(formasPago) && formasPago.map((formaPago) => (
                  <option key={formaPago.id_formapago} value={formaPago.id_formapago}>
                    {formaPago.descripcion_formaspago}
                  </option>
                ))}
                
              </select>
            </label>

            <label htmlFor=""> Moneda de Pago de la Factura*
              <select name="metodoPago" id="" required>
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

        <section className='activosFijos_Factura'>
          <div className='title_Container'>
            <h2> <FaBoxesPacking className='activosFactura'/>  Activos Fijos Asociados </h2>
            <div className='agregarActivos' onClick={handleAgregarActivo}>
              <IoAddCircleOutline className='addActivoIcon'/> Agregar Activos
            </div>
          </div>
          

          <div className='inputs_Container'>
            <table>
              <thead>
                <tr>
                  <th>Nombre del Activo</th>
                  <th>Cantidad </th>
                  <th>Precio Unitario</th>
                  <th>Total  </th>
                </tr>
              </thead>
              <tbody>
                {/* Aquí puedes mapear los activos fijos asociados a la factura */}
                
              </tbody>
            </table>
          </div>
        </section>

        <section className='valoresFactura'>
          <div className='title_Container'>
            <h2> <FaCalculator className='valoresIcon'/>  Valores Monetarios de la Factura </h2>
          </div>

          <div className='inputs_Container'>
            <label htmlFor=""> Subtotal*
              <input
                type="number"
                name="subtotal"
                value={subtotal}
                disabled
              />
            </label>
            
            <label htmlFor=""> IVA (16%)
              <input
                type="number"
                name="IVA"
                value={iva}
                disabled
              />
            </label>

            <label htmlFor=""> Flete (Valor numérico)
              <input
                type="number"
                name="flete"
                placeholder="0.00"
                value={flete}
                onChange={e => setFlete(Number(e.target.value))}
              />
            </label>

            <label htmlFor=""> Descuento Aplicado (Valor numérico)
              <input
                type="number"
                name="descuento"
                placeholder="0.00"
                value={descuento}
                onChange={e => setDescuento(Number(e.target.value))}
              />
            </label>

          </div>

          <div className='totalFactura'>
            <div className='totalFacturaLabel'>
              <p id='totalFacturaDescuento'> Total de la Factura con Descuento: </p>
              <p id='totalFactura'> Total de la Factura: </p>

            </div>
            <div className='totalFacturaCalculado'>
              <p id='totalFacturaDescuentoValue'>
              </p>
              <p id='totalFacturaValue'>
              </p>
            </div>
          </div>

        </section>

        <section className='observacionesFactura'>
          <div className='title_Container'>
            <h2> <SiGooglemessages className='observacionIcon'/>  Observaciones </h2>
          </div>

          <div className='inputs_Container'>
            <textarea name="observaciones" placeholder="Observaciones adicionales sobre la factura..."></textarea>
          </div>
        </section>
      </form>

    </div>
  );
};

export default AddFactura;
