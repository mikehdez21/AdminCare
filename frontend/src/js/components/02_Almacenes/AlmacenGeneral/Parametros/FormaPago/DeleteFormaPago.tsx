import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteFormaPago, getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { setListFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoReducer';
import { FormasPago } from '@/@types/fiscalTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/FormaPago/modalFormaPago.css';

interface DeleteFormaPagoProps {
    isOpen: boolean;
    onClose: () => void;
    formaPagoToDelete: FormasPago | null;
}

Modal.setAppElement('#root');

const DeleteFormaPago: React.FC<DeleteFormaPagoProps> = ({ isOpen, onClose, formaPagoToDelete }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleDelete = async () => {
        try {
            const resultAction = await dispatch(deleteFormaPago(formaPagoToDelete!)).unwrap();

            if (resultAction.success) {
                const formasPagoActualizadas = await dispatch(getFormasPago()).unwrap();
                if (formasPagoActualizadas.success) {
                    dispatch(setListFormasPago(formasPagoActualizadas.formasPago ?? []));
                }
            } else {
                console.error('Error al eliminar la forma de pago:', resultAction.message);
            }

            Swal.fire({
                icon: 'success',
                title: 'Forma de pago eliminada',
                text: 'La forma de pago ha sido eliminada exitosamente.',
                confirmButtonText: 'OK',
            });

            onClose();
        } catch (error) {
            console.error('Error al eliminar la forma de pago:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al eliminar la forma de pago. Por favor, inténtalo de nuevo.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Eliminar Forma de Pago"
            className="modalFormaPago"
        >
            <div className="mainDiv_modalFormaPago">
                <h2>Eliminar Forma de Pago</h2>

                <div className='divDeleteFormaPago'>
                    <p>¿Quiere eliminar la forma de pago <br /> <strong>{formaPagoToDelete?.descripcion_formaspago}</strong>?</p>
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

export default DeleteFormaPago;
