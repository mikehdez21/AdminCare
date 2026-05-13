import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { AppDispatch } from '@/store/store';
import { editFormaPago, getFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoActions';
import { setListFormasPago } from '@/store/almacengeneral/FormaPago/formaPagoReducer';
import { FormasPago } from '@/@types/fiscalTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/FormaPago/modalFormaPago.css';

interface EditFormaPagoProps {
    isOpen: boolean;
    onClose: () => void;
    formaPagoToEdit: FormasPago | null;
}

Modal.setAppElement('#root');

const EditFormaPago: React.FC<EditFormaPagoProps> = ({ isOpen, onClose, formaPagoToEdit }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [descripcionFormaPago, setDescripcionFormaPago] = useState<string>('');

    useEffect(() => {
        if (formaPagoToEdit) {
            setDescripcionFormaPago(formaPagoToEdit.descripcion_formaspago);
        }
    }, [formaPagoToEdit]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const formaPagoEditada: FormasPago = {
                id_formapago: formaPagoToEdit?.id_formapago,
                descripcion_formaspago: descripcionFormaPago,
            };

            const resultAction = await dispatch(editFormaPago(formaPagoEditada)).unwrap();

            if (resultAction.success) {
                const formasActualizadas = await dispatch(getFormasPago()).unwrap();
                if (formasActualizadas.success) {
                    dispatch(setListFormasPago(formasActualizadas.formasPago ?? []));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Forma de Pago Editada',
                    text: 'La forma de pago ha sido editada exitosamente.',
                    confirmButtonText: 'OK',
                });

                onClose();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: resultAction.message || 'Hubo un problema al editar la forma de pago.',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error al editar la forma de pago:', error);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al editar la forma de pago. Por favor, inténtalo de nuevo.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Editar Forma de Pago"
            className="modalFormaPago"
            shouldCloseOnEsc={false}
            shouldCloseOnOverlayClick={false}
        >
            <div className="mainDiv_modalFormaPago">
                <h2>Editar Forma de Pago</h2>

                <form className="formFormaPago" onSubmit={handleSubmit}>
                    <div className="dataInputs_FormaPago">
                        <label>
                            *Descripción de la Forma de Pago:
                            <input
                                type="text"
                                value={descripcionFormaPago}
                                onChange={(e) => setDescripcionFormaPago(e.target.value)}
                                required
                            />
                        </label>

                        <ModalButtons
                            buttons={[
                                {
                                    text: 'Guardar',
                                    type: 'submit',
                                    className: 'button_addedit',
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
                </form>
            </div>
        </Modal>
    );
};

export default EditFormaPago;