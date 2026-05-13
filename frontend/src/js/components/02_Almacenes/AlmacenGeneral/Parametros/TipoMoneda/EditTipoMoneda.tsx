import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { editTipoMoneda, getTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaActions';
import { setListTiposMoneda } from '@/store/almacengeneral/TipoMoneda/tipoMonedaReducer';
import { TiposMoneda } from '@/@types/fiscalTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/TipoMoneda/modalTiposMoneda.css';


interface EditTipoMonedaProps {
    isOpen: boolean;
    onClose: () => void;
    tipoMonedaToEdit: TiposMoneda | null;
}

Modal.setAppElement('#root');

const EditTipoMoneda: React.FC<EditTipoMonedaProps> = ({ isOpen, onClose, tipoMonedaToEdit }) => {

    const dispatch = useDispatch<AppDispatch>();

    const [descripcionTipoMoneda, setDescripcionTipoMoneda] = useState<string>('');


    // Cuando se abra el modal, cargar los datos del tipo de moneda seleccionado
    useEffect(() => {
        if (tipoMonedaToEdit) {
            setDescripcionTipoMoneda(tipoMonedaToEdit.descripcion_tipomoneda || '');
        }
    }, [tipoMonedaToEdit]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const tipoMonedaEditado: TiposMoneda = {
                id_tipomoneda: tipoMonedaToEdit?.id_tipomoneda, // Asegúrate de incluir el ID para la edición
                descripcion_tipomoneda: descripcionTipoMoneda,
            };

            console.log('Tipo de moneda editado a enviar:', tipoMonedaEditado);
            const resultAction = await dispatch(editTipoMoneda(tipoMonedaEditado)).unwrap();
            console.log(resultAction)


            if (resultAction.success) {
                // Si el tipo de moneda fue editado con éxito, recargar la lista de tipos de moneda
                const tiposActualizados = await dispatch(getTiposMoneda()).unwrap();
                if (tiposActualizados.success) {
                    dispatch(setListTiposMoneda(tiposActualizados.tiposMoneda ?? [])); // Actualiza la lista de tipos de moneda en el estado
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Tipo de Moneda Editado',
                    text: 'El tipo de moneda ha sido editado exitosamente.',
                    confirmButtonText: 'OK',
                });

                onClose(); // Cerrar modal al completar la edición
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: resultAction.message || 'Hubo un problema al editar el tipo de moneda.',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error al editar el tipo de moneda:', error);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al editar el tipo de moneda. Por favor, inténtalo de nuevo.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Editar Tipo de Moneda"
            className="modalTipoMoneda"
            shouldCloseOnEsc={false}
            shouldCloseOnOverlayClick={false}
        >
            <div className="mainDiv_modalTipoMoneda">
                <h2>Editar Tipo de Moneda</h2>

                <form className="formTipoMoneda" onSubmit={handleSubmit}>
                    <div className="dataInputs_TipoMoneda">

                        <label>
                            *Descripción del Tipo de Moneda:
                            <input
                                type="text"
                                value={descripcionTipoMoneda}
                                onChange={(e) => setDescripcionTipoMoneda(e.target.value)}
                                required
                            />
                        </label>

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
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditTipoMoneda;
