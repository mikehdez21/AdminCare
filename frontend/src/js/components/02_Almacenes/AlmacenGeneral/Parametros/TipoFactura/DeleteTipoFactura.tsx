import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteTipoFactura, getTiposFacturas } from '@/store/almacengeneral/TipoFactura/tiposFacturasActions';
import { setListTiposFacturas } from '@/store/almacengeneral/TipoFactura/tiposFacturasReducer';
import { TiposFacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoFactura/modalTiposFactura.css';

interface DeleteTipoFacturaProps {
    isOpen: boolean;
    onClose: () => void;
    tipoFacturaToDelete: TiposFacturasAF | null;
}

Modal.setAppElement('#root');

const DeleteTipoFactura: React.FC<DeleteTipoFacturaProps> = ({ isOpen, onClose, tipoFacturaToDelete }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleDelete = async () => {
        try {
            const resultAction = await dispatch(deleteTipoFactura(tipoFacturaToDelete!)).unwrap();

            if (resultAction.success) {
                const tiposActualizados = await dispatch(getTiposFacturas()).unwrap();
                if (tiposActualizados.success) {
                    dispatch(setListTiposFacturas(tiposActualizados.tiposFacturas ?? []));
                }
            } else {
                console.error('Error al eliminar el tipo de factura:', resultAction.message);
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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al eliminar el tipo de factura. Por favor, inténtalo de nuevo.',
                confirmButtonText: 'OK',
            });
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
                            text: 'Eliminar',
                            type: 'button',
                            className: 'button_delete',
                            onClick: handleDelete,
                        },
                        {
                            text: 'Cancelar',
                            type: 'button',
                            className: 'button_close',
                            onClick: onClose,
                        },
                    ]}
                />
            </div>
        </Modal>
    );
};

export default DeleteTipoFactura;
