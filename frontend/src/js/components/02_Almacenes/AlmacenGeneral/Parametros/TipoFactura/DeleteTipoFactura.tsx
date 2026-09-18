import React from 'react';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTipoFactura, getTiposFacturas } from '@/store/almacengeneral/TipoFactura/tiposFacturasActions';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { showApiError } from '@/utils/showApiError';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoFactura/modalTiposFactura.css';

interface DeleteTipoFacturaProps {
    isOpen: boolean;
    onClose: () => void;
    tipoFacturaToDelete: TiposFacturasAF | null;
}

Modal.setAppElement('#root');

const DeleteTipoFactura: React.FC<DeleteTipoFacturaProps> = ({ isOpen, onClose, tipoFacturaToDelete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const mutationLoading = useSelector((state: RootState) => state.facturasaf.tiposFacturasMutationLoading);

  const handleDelete = async () => {
    try {
      const resultAction = await dispatch(deleteTipoFactura(tipoFacturaToDelete!)).unwrap();

      if (resultAction.success) {
        const refreshed = await dispatch(getTiposFacturas()).unwrap();
        if (!refreshed.success) throw new Error(refreshed.message || 'No se pudo recargar el catálogo.');
      } else {
        throw new Error(resultAction.message || 'No se pudo eliminar el tipo de factura.');
      }

      Swal.fire({
        icon: 'success',
        title: 'Tipo de factura eliminado',
        text: 'El tipo de factura ha sido eliminado exitosamente.',
        confirmButtonText: 'OK',
      });

      onClose();
    } catch (error) {
      console.error('Error al eliminar el tipo de factura:', error);
      showApiError(error, 'No se pudo eliminar el tipo de factura.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Eliminar Tipo de Factura"
      className="modalTipoFactura"
    >
      <div className="mainDiv_modalTipoFactura">
        <h2>Eliminar Tipo de Factura</h2>

        <div className='divDeleteTipoFactura'>
          <p>¿Quiere eliminar el tipo de factura <br /> <strong>{tipoFacturaToDelete?.nombre_tipofactura}</strong>?</p>
        </div>

        <ModalButtons
          buttons={[
            {
              text: mutationLoading ? 'Eliminando...' : 'Eliminar',
              type: 'button',
              className: 'button_delete',
              onClick: handleDelete,
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
    </Modal>
  );
};

export default DeleteTipoFactura;
