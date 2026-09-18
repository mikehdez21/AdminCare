import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { editTipoFactura, getTiposFacturas } from '@/store/almacengeneral/TipoFactura/tiposFacturasActions';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { showApiError } from '@/utils/showApiError';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoFactura/modalTiposFactura.css';


interface EditTipoFacturaProps {
    isOpen: boolean;
    onClose: () => void;
    tipoFacturaToEdit: TiposFacturasAF | null;
}

Modal.setAppElement('#root');

const EditTipoFactura: React.FC<EditTipoFacturaProps> = ({ isOpen, onClose, tipoFacturaToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();
  const mutationLoading = useSelector((state: RootState) => state.facturasaf.tiposFacturasMutationLoading);

  const [nombreTipoFactura, setNombreTipoFactura] = useState<string>('');
  const [descripcionTipoFactura, setDescripcionTipoFactura] = useState<string>('');


  // Cuando se abra el modal, cargar los datos del tipo de factura seleccionado
  useEffect(() => {
    if (tipoFacturaToEdit) {
      setNombreTipoFactura(tipoFacturaToEdit.nombre_tipofactura);
      setDescripcionTipoFactura(tipoFacturaToEdit.descripcion_tipofactura || '');
    }
  }, [tipoFacturaToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const tipoFacturaEditado: TiposFacturasAF = {
        id_tipofacturaaf: tipoFacturaToEdit?.id_tipofacturaaf, // Asegúrate de incluir el ID para la edición
        nombre_tipofactura: nombreTipoFactura,
        descripcion_tipofactura: descripcionTipoFactura,
      };

      console.log('Tipo de factura editado a enviar:', tipoFacturaEditado);
      const resultAction = await dispatch(editTipoFactura(tipoFacturaEditado)).unwrap();
      console.log(resultAction)


      if (resultAction.success) {
        // Si el tipo de factura fue editado con éxito, recargar la lista de tipos de facturas
        const refreshed = await dispatch(getTiposFacturas()).unwrap();
        if (!refreshed.success) throw new Error(refreshed.message || 'No se pudo recargar el catálogo.');

        Swal.fire({
          icon: 'success',
          title: 'Tipo de Factura Editado',
          text: 'El tipo de factura ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el tipo de factura.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el tipo de factura:', error);

      showApiError(error, 'No se pudo editar el tipo de factura.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Tipo de Factura"
      className="modalTipoFactura"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalTipoFactura">
        <h2>Editar Tipo de Factura</h2>

        <form className="formTipoFactura" onSubmit={handleSubmit}>
          <div className="dataInputs_TipoFactura">

            <label>
              *Nombre del Tipo de Factura:
              <input
                type="text"
                value={nombreTipoFactura}
                onChange={(e) => setNombreTipoFactura(e.target.value)}
                required
              />
            </label>

            <label>
              Descripción:
              <textarea
                value={descripcionTipoFactura}
                onChange={(e) => setDescripcionTipoFactura(e.target.value)}
                rows={4}
              />
            </label>

            <ModalButtons
              buttons={[
                {
                  text: mutationLoading ? 'Guardando...' : 'Guardar',
                  type: 'submit',
                  className: 'button_addedit',
                  disabled: mutationLoading
                },
                {
                  text: 'Cancelar',
                  type: 'button',
                  className: 'button_close',
                  onClick: onClose,
                  disabled: mutationLoading
                }
              ]}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditTipoFactura;
