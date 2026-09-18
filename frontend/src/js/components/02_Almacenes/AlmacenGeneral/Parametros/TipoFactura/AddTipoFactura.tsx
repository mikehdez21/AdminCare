import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { AppDispatch, RootState } from '@/store/store';
import { addTipoFactura, getTiposFacturas } from '@/store/almacengeneral/TipoFactura/tiposFacturasActions';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { showApiError } from '@/utils/showApiError';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoFactura/modalTiposFactura.css';

interface AddTipoFacturaProps {
    isOpen: boolean;
    onClose: () => void;
}

Modal.setAppElement('#root');

const AddTipoFactura: React.FC<AddTipoFacturaProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const mutationLoading = useSelector((state: RootState) => state.facturasaf.tiposFacturasMutationLoading);

  const [nombreTipoFactura, setNombreTipoFactura] = useState<string>('');
  const [descripcionTipoFactura, setDescripcionTipoFactura] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const nuevoTipoFactura: TiposFacturasAF = {
        nombre_tipofactura: nombreTipoFactura,
        descripcion_tipofactura: descripcionTipoFactura,
      };

      const resultAction = await dispatch(addTipoFactura(nuevoTipoFactura)).unwrap();

      if (resultAction.success) {
        const refreshed = await dispatch(getTiposFacturas()).unwrap();
        if (!refreshed.success) throw new Error(refreshed.message || 'No se pudo recargar el catálogo.');

        setNombreTipoFactura('');
        setDescripcionTipoFactura('');

        Swal.fire({
          icon: 'success',
          title: 'Tipo de factura añadido',
          text: 'El tipo de factura ha sido añadido exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'No se pudo añadir el tipo de factura.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al agregar el tipo de factura: ', error);

      showApiError(error, 'No se pudo añadir el tipo de factura.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nuevo Tipo de Factura"
      className="modalTipoFactura"
    >
      <div className="mainDiv_modalTipoFactura">
        <h2>Añadir Nuevo Tipo de Factura</h2>

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
                  disabled: mutationLoading,
                },
                {
                  text: 'Cancelar',
                  type: 'button',
                  className: 'button_close',
                  onClick: onClose,
                  disabled: mutationLoading,
                },
              ]}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTipoFactura;
