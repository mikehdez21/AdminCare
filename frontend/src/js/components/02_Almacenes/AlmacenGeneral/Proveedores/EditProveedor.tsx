import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { editProveedor, getProveedores, getTiposDescuento, getTiposProveedores } from '@/store/almacengeneral/Proveedores/proveedoresActions';
import { setListProveedor } from '@/store/almacengeneral/Proveedores/proveedoresReducer';
import { Proveedores } from '@/@types/AlmacenGeneralTypes/proveedorTypes';
import { getFormasPago, getTiposRegimen, getTiposFacturacion, getTiposMoneda } from '@/store/shared/fiscalActions';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Proveedores/modalProveedores.css';


interface EditProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorToEdit: Proveedores | null;
}

Modal.setAppElement('#root');

const EditProveedor: React.FC<EditProveedorProps> = ({ isOpen, onClose, proveedorToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreProveedor, setNombreProveedor] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [emailProveedor, setEmailProveedor] = useState<string>('');
  const [telefonoProveedor, setTelefonoProveedor] = useState<string>('');
  const [sitioWebProveedor, setSitioWebProveedor] = useState<string>('');
  const [RFCProveedor, setRFCProveedor] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);

  const [tipoMonedaProveedor, setTipoMonedaProveedor] = useState<number>(0)
  const [tipoProveedorSeleccionado, setTipoProveedorSeleccionado] = useState<number>(0);
  const [formaPagoSeleccionado, setFormaPagoSeleccionado] = useState<number>(0);
  const [regimenFiscalSeleccionado, setRegimenFiscalSeleccionado] = useState<number>(0);
  const [descuentoProveedorSeleccionado, setDescuentoProveedorSeleccionado] = useState<number>(0);
  const [tipoFacturacionSeleccionado, setTipoFacturacionSeleccionado] = useState<number>(0);

  const [API_tiposMoneda, setAPI_TiposMoneda] = useState<{ id_tipomoneda: number; descripcion_tipomoneda: string }[]>([]);
  const [API_tiposProveedor, setAPI_TipoProveedor] = useState<{ id_tipoproveedor: number; descripcion_tipoproveedor: string }[]>([]);
  const [API_formasPago, setAPI_FormasPago] = useState<{ id_formapago: number; descripcion_formaspago: string }[]>([]);
  const [API_regimenesFiscales, setAPI_RegimenesFiscales] = useState<{ id_regimenfiscal: number; descripcion_regimenfiscal: string }[]>([]);
  const [API_tiposDescuento, setAPI_TiposDescuento] = useState<{ id_descuento_proveedor: number; descripcion_descuentoproveedor: string }[]>([]);
  const [API_tiposFacturacion, setAPI_TiposFacturacion] = useState<{ id_tipofacturacion: number; descripcion_tipofacturacion: string }[]>([]);


  useEffect(() => {
    const fetchDataProveedor = async () => {
      try {
        // Ejecutamos todas las llamadas de forma concurrente
        const [
          tiposMonedasResponse,
          tiposProveedorResponse,
          formasPagoResponse,
          regimenesFiscalesResponse,
          descuentosProveedorResponse,
          tiposFacturacionResponse
        ] = await Promise.all([
          dispatch(getTiposMoneda()).unwrap(),
          dispatch(getTiposProveedores()).unwrap(),
          dispatch(getFormasPago()).unwrap(),
          dispatch(getTiposRegimen()).unwrap(),
          dispatch(getTiposDescuento()).unwrap(),
          dispatch(getTiposFacturacion()).unwrap(),
        ]);

        // Actualizamos los estados con los datos obtenidos
        setAPI_TiposMoneda(tiposMonedasResponse.tiposMoneda ?? []); // Asignamos tipos de moneda
        setAPI_TipoProveedor(tiposProveedorResponse.tiposProveedores ?? []);
        setAPI_FormasPago(formasPagoResponse.formasPago ?? []);
        setAPI_RegimenesFiscales(regimenesFiscalesResponse.regimenesFiscales ?? []);
        setAPI_TiposDescuento(descuentosProveedorResponse.descuentosProveedor ?? []);
        setAPI_TiposFacturacion(tiposFacturacionResponse.tiposFacturacion ?? []);


      } catch (error) {
        console.error('Error fetching data Proveedor:', error);
      }
    };

    fetchDataProveedor(); // Llamar a la función asíncrona solo una vez

  }, []); // Sin dependencias porque `dispatch` no cambia


  // Cuando se abra el modal, cargar los datos del proveedor seleccionado
  useEffect(() => {
    if (proveedorToEdit) {
      setNombreProveedor(proveedorToEdit.nombre_proveedor);
      setRazonSocial(proveedorToEdit.razon_social || 'No Especificado'); // En caso de que no tenga razón social
      setEmailProveedor(proveedorToEdit.email_proveedor);
      setTelefonoProveedor(proveedorToEdit.telefono_proveedor);
      setSitioWebProveedor(proveedorToEdit.sitioWeb || 'No Especificado'); // En caso de que no tenga sitio web
      setTipoMonedaProveedor(proveedorToEdit.id_tipo_moneda || 0); // En caso de que no tenga moneda
      setRFCProveedor(proveedorToEdit.rfc || 'No Especificado'); // En caso de que no tenga RFC
      setEstatusActivo(proveedorToEdit.estatus_activo); // Estatus activo del proveedor
      setTipoProveedorSeleccionado(proveedorToEdit.id_tipo_proveedor || 0); // En caso de que no tenga tipo de proveedor
      setFormaPagoSeleccionado(proveedorToEdit.id_forma_pago || 0); // En caso de que no tenga forma de pago
      setRegimenFiscalSeleccionado(proveedorToEdit.id_tipo_regimen || 0); // En caso de que no tenga régimen fiscal
      setDescuentoProveedorSeleccionado(proveedorToEdit.id_tipo_descuento || 0); // En caso de que no tenga descuento
      setTipoFacturacionSeleccionado(proveedorToEdit.id_tipo_facturacion || 0); // En caso de que no tenga tipo de facturación
    }
  }, [proveedorToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const proveedorEditado: Proveedores = {
        id_proveedor: proveedorToEdit?.id_proveedor, // Mantener el ID del proveedor
        nombre_proveedor: nombreProveedor,
        razon_social: razonSocial,
        email_proveedor: emailProveedor,
        telefono_proveedor: telefonoProveedor,
        sitioWeb: sitioWebProveedor,
        rfc: RFCProveedor,
        estatus_activo: estatusActivo,
        id_tipo_moneda: tipoMonedaProveedor,
        id_tipo_proveedor: tipoProveedorSeleccionado,
        id_forma_pago: formaPagoSeleccionado,
        id_tipo_regimen: regimenFiscalSeleccionado,
        id_tipo_descuento: descuentoProveedorSeleccionado,
        id_tipo_facturacion: tipoFacturacionSeleccionado

      };

      const resultAction = await dispatch(editProveedor(proveedorEditado)).unwrap();

      console.log(resultAction.success)


      if (resultAction.success) {
        // Si el proveedor fue editado con éxito, recargar la lista de proveedores
        const proveedoresActualizados = await dispatch(getProveedores()).unwrap();
        if (proveedoresActualizados.success) {
          dispatch(setListProveedor(proveedoresActualizados.proveedor!)); // Actualiza la lista de proveedores en el estado
        }

        Swal.fire({
          icon: 'success',
          title: 'Proveedor Editado',
          text: 'El proveedor ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el proveedor.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el proveedor:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el proveedor. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modalProveedores"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalProveedores">
        <h2>Editar Proveedor</h2>

        <form onSubmit={handleSubmit} className="formProveedores">
          <div className='dataInputs_Proveedor'>

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
                  value={tipoMonedaProveedor ?? ''}
                  onChange={(e) => setTipoMonedaProveedor(Number(e.target.value))}
                >
                  <option value="">Selecciona un tipo de moneda</option>
                  {API_tiposMoneda.map((tiposMonedas) => (
                    <option key={tiposMonedas.id_tipomoneda} value={tiposMonedas.id_tipomoneda}>
                      {tiposMonedas.descripcion_tipomoneda}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                *Estatus Activo
                <input
                  type="checkbox"
                  checked={estatusActivo}
                  id='estatusActivo'
                  name='estatusActivo'
                  onChange={(e) => setEstatusActivo(e.target.checked)}
                  placeholder='Estatus Activo'
                />
              </label>





            </div>

            <div className='addProveedor_ThirdColumn'>
              <label>
                *Tipo de Proveedor
                <select
                  required
                  value={tipoProveedorSeleccionado ?? ''}
                  onChange={(e) => setTipoProveedorSeleccionado(Number(e.target.value))}
                >
                  <option value="">Selecciona un tipo de proveedor</option>
                  {API_tiposProveedor.map((tiposProveedores) => (
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
                  value={formaPagoSeleccionado ?? ''}
                  onChange={(e) => setFormaPagoSeleccionado(Number(e.target.value))}
                >
                  <option value="">Selecciona una forma de pago</option>
                  {API_formasPago.map((formasPago) => (
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
                  value={regimenFiscalSeleccionado ?? ''}
                  onChange={(e) => setRegimenFiscalSeleccionado(Number(e.target.value))}
                >
                  <option value="">Selecciona un tipo de regimen</option>
                  {API_regimenesFiscales.map((regimenesFiscales) => (
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
                  value={descuentoProveedorSeleccionado ?? ''}
                  onChange={(e) => setDescuentoProveedorSeleccionado(Number(e.target.value))}
                >
                  <option value="">Selecciona un tipo de descuento</option>
                  {API_tiposDescuento.map((descuentosProveedor) => (
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
                  value={tipoFacturacionSeleccionado ?? ''}
                  onChange={(e) => setTipoFacturacionSeleccionado(Number(e.target.value))}
                >
                  <option value="">Selecciona un tipo de facturación</option>
                  {API_tiposFacturacion.map((tiposFacturacion) => (
                    <option key={tiposFacturacion.id_tipofacturacion} value={tiposFacturacion.id_tipofacturacion}>
                      {tiposFacturacion.descripcion_tipofacturacion}
                    </option>
                  ))}
                </select>
              </label>


            </div>

          </div>

          <ModalButtons
            buttons={[
              {
                text: 'Guardar',
                type: 'submit',
                className: 'button_addedit'
              },
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose
              }
            ]}
          />

        </form>
      </div>
    </Modal >
  );
};

export default EditProveedor;
