import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { addProveedor, getProveedores } from '@/store/almacenGeneral/Proveedores/proveedoresActions';
import { setProveedor } from '@/store/almacenGeneral/Proveedores/proveedoresReducer';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';

import {
  getTiposProveedores,
  getFormasPago,
  getTiposRegimen,
  getTiposDescuento,
  getTiposFacturacion,
  getTiposMoneda
} from '@/store/almacenGeneral/Tipos/almacenGeneralTipos_Actions';
import Swal from 'sweetalert2';

import '@styles/02_Almacenes/AlmacenGeneral/addeditdelete_almacenEntities.css'

interface AddProveedorProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const AddProveedor: React.FC<AddProveedorProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estados locales solo para los valores del formulario
  const [nombreProveedor, setNombreProveedor] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [emailProveedor, setEmailProveedor] = useState<string>('');
  const [telefonoProveedor, setTelefonoProveedor] = useState<string>('');
  const [sitioWebProveedor, setSitioWebProveedor] = useState<string>('');
  const [RFCProveedor, setRFCProveedor] = useState<string>('');
  const [tipoMonedaProveedor, setTipoMonedaProveedor] = useState<number>(0);
  const [tipoProveedorSeleccionado, setTipoProveedorSeleccionado] = useState<number>(0);
  const [formaPagoSeleccionado, setFormaPagoSeleccionado] = useState<number>(0);
  const [regimenFiscalSeleccionado, setRegimenFiscalSeleccionado] = useState<number>(0);
  const [descuentoProveedorSeleccionado, setDescuentoProveedorSeleccionado] = useState<number>(0);
  const [tipoFacturacionSeleccionado, setTipoFacturacionSeleccionado] = useState<number>(0);

  // Selectores globales
  const tiposMoneda = useSelector((state: RootState) => state.tiposAlmacenGeneral.tiposMoneda);
  const tiposProveedor = useSelector((state: RootState) => state.tiposAlmacenGeneral.tiposProveedores);
  const formasPago = useSelector((state: RootState) => state.tiposAlmacenGeneral.formasPago);
  const regimenesFiscales = useSelector((state: RootState) => state.tiposAlmacenGeneral.regimenesFiscales);
  const tiposDescuento = useSelector((state: RootState) => state.tiposAlmacenGeneral.descuentosProveedor);
  const tiposFacturacion = useSelector((state: RootState) => state.tiposAlmacenGeneral.tiposFacturacion);

  useEffect(() => {
    // Solo se hace fetch si los arrays están vacíos
    if (!tiposMoneda?.length) dispatch(getTiposMoneda());
    if (!tiposProveedor?.length) dispatch(getTiposProveedores());
    if (!formasPago?.length) dispatch(getFormasPago());
    if (!regimenesFiscales?.length) dispatch(getTiposRegimen());
    if (!tiposDescuento?.length) dispatch(getTiposDescuento());
    if (!tiposFacturacion?.length) dispatch(getTiposFacturacion());
     
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const nuevoProveedor: Proveedores = {
        nombre_proveedor: nombreProveedor,
        razon_social: razonSocial,
        email_proveedor: emailProveedor,
        telefono_proveedor: telefonoProveedor,
        sitioWeb: sitioWebProveedor,
        rfc: RFCProveedor,
        id_tipo_moneda: tipoMonedaProveedor,
        id_tipo_proveedor: tipoProveedorSeleccionado,
        id_forma_pago: formaPagoSeleccionado,
        id_tipo_regimen: regimenFiscalSeleccionado,
        id_tipo_descuento: descuentoProveedorSeleccionado,
        id_tipo_facturacion: tipoFacturacionSeleccionado
      };

      const resultAction = await dispatch(addProveedor(nuevoProveedor)).unwrap();

      if (resultAction.success) {
        // Si el proveedor fue agregado con éxito, recargar la lista de proveedores
        const proveedoresActualizados = await dispatch(getProveedores()).unwrap();
        if (proveedoresActualizados.success) {
          dispatch(setProveedor(proveedoresActualizados.proveedor!));
          setNombreProveedor('');
          setRazonSocial('');
          setEmailProveedor('');
          setTelefonoProveedor('');
          setSitioWebProveedor('');
          setRFCProveedor('');
          setTipoMonedaProveedor(0);
          setTipoProveedorSeleccionado(0);
          setFormaPagoSeleccionado(0);
          setRegimenFiscalSeleccionado(0);
          setDescuentoProveedorSeleccionado(0);
          setTipoFacturacionSeleccionado(0);
        }
      } else {
        console.log('Error al agregar proveedor:', resultAction.message);
      }

      Swal.fire({
        icon: 'success',
        title: 'Proveedor Añadido',
        text: 'El proveedor ha sido añadido exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose();
    } catch (error) {
      console.error('Error al añadir proveedor:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el proveedor. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modal_CRUD_EntityAlmacen"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content_AlmacenEntities">
        <h2>Añadir Nuevo Proveedor</h2>

        <div className='inputs_addedit_Entity'>
          <form onSubmit={handleSubmit} className="form_addedit_Entity">

            <div className='addProveedor_Data'>

              <div className='addProveedor_FirstColumn'>
                <label>
                  *Nombre del Proveedor:
                  <input
                    type="text"
                    value={nombreProveedor}
                    onChange={(e) => setNombreProveedor(e.target.value)}
                    required
                  />
                </label>
                <label>
                  *Razon Social
                  <input
                    type='text'
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    required
                  />
                </label>
                <label>
                  *Email del Proveedor:
                  <input
                    type="email"
                    value={emailProveedor}
                    onChange={(e) => setEmailProveedor(e.target.value)}
                    required
                  />
                </label>
                <label>
                  *Teléfono del Proveedor:
                  <input
                    type="number"
                    value={telefonoProveedor}
                    onChange={(e) => setTelefonoProveedor(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className='addProveedor_SecondColumn'>
                <label>
                  Sitio Web del Proveedor:
                  <input
                    type="text"
                    value={sitioWebProveedor}
                    onChange={(e) => setSitioWebProveedor(e.target.value)}
                  />
                </label>
                <label>
                  *RFC
                  <input
                    type="text"
                    value={RFCProveedor}
                    onChange={(e) => setRFCProveedor(e.target.value)}
                    required
                  />
                </label>
                <label>
                  *Tipo de Moneda de Pago
                  <select
                    required
                    value={tipoMonedaProveedor || ''}
                    onChange={(e) => setTipoMonedaProveedor(Number(e.target.value))}
                  >
                    <option value="">Selecciona un tipo de moneda</option>
                    {Array.isArray(tiposMoneda) && tiposMoneda.map((tiposMonedas) => (
                      <option key={tiposMonedas.id_tipomoneda} value={tiposMonedas.id_tipomoneda}>
                        {tiposMonedas.descripcion_tipomoneda}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className='addProveedor_ThirdColumn'>
                <label>
                  *Tipo de Proveedor
                  <select
                    required
                    value={tipoProveedorSeleccionado || ''}
                    onChange={(e) => setTipoProveedorSeleccionado(Number(e.target.value))}
                  >
                    <option value="">Selecciona un tipo de proveedor</option>
                    {Array.isArray(tiposProveedor) && tiposProveedor.map((tiposProveedores) => (
                      <option key={tiposProveedores.id_tipoproveedor} value={tiposProveedores.id_tipoproveedor}>
                        {tiposProveedores.descripcion_tipoproveedor}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  *Forma de Pago
                  <select
                    required
                    value={formaPagoSeleccionado || ''}
                    onChange={(e) => setFormaPagoSeleccionado(Number(e.target.value))}
                  >
                    <option value="">Selecciona una forma de pago</option>
                    {Array.isArray(formasPago) && formasPago.map((formasPago) => (
                      <option key={formasPago.id_formapago} value={formasPago.id_formapago}>
                        {formasPago.descripcion_formaspago}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  *Tipo de Regimen
                  <select
                    required
                    value={regimenFiscalSeleccionado || ''}
                    onChange={(e) => setRegimenFiscalSeleccionado(Number(e.target.value))}
                  >
                    <option value="">Selecciona un tipo de regimen</option>
                    {Array.isArray(regimenesFiscales) && regimenesFiscales.map((regimenesFiscales) => (
                      <option key={regimenesFiscales.id_regimenfiscal} value={regimenesFiscales.id_regimenfiscal}>
                        {regimenesFiscales.descripcion_regimenfiscal}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  *Descuentos del Proveedor
                  <select
                    required
                    value={descuentoProveedorSeleccionado || ''}
                    onChange={(e) => setDescuentoProveedorSeleccionado(Number(e.target.value))}
                  >
                    <option value="">Selecciona un tipo de descuento</option>
                    {Array.isArray(tiposDescuento) && tiposDescuento.map((descuentosProveedor) => (
                      <option key={descuentosProveedor.id_descuento_proveedor} value={descuentosProveedor.id_descuento_proveedor}>
                        {descuentosProveedor.descripcion_descuentoproveedor}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  *Tipo de Facturación
                  <select
                    required
                    value={tipoFacturacionSeleccionado || ''}
                    onChange={(e) => setTipoFacturacionSeleccionado(Number(e.target.value))}
                  >
                    <option value="">Selecciona un tipo de facturación</option>
                    {Array.isArray(tiposFacturacion) && tiposFacturacion.map((tiposFacturacion) => (
                      <option key={tiposFacturacion.id_tipofacturacion} value={tiposFacturacion.id_tipofacturacion}>
                        {tiposFacturacion.descripcion_tipofacturacion}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Añadir</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AddProveedor;