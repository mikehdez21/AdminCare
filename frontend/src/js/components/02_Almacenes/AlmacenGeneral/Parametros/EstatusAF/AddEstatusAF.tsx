import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { AppDispatch } from '@/store/store';
import { addEstatusAF, getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';
import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/EstatusAF/modalEstatusAF.css';

interface AddEstatusAFProps {
    isOpen: boolean;
    onClose: () => void;
}

Modal.setAppElement('#root');

const AddEstatusAF: React.FC<AddEstatusAFProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [descripcionEstatusAF, setDescripcionEstatusAF] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const nuevoEstatusAF: EstatusActivosFijos = {
                descripcion_estatusaf: descripcionEstatusAF,
            };

            const resultAction = await dispatch(addEstatusAF(nuevoEstatusAF)).unwrap();

            if (resultAction.success) {
                const estatusActualizados = await dispatch(getEstatusAF()).unwrap();

                if (estatusActualizados.success) {
                    dispatch(setListEstatusAF(estatusActualizados.estatusAF ?? []));
                }

                setDescripcionEstatusAF('');

                Swal.fire({
                    icon: 'success',
                    title: 'Estatus de Activo Fijo añadido',
                    text: 'El estatus de activo fijo ha sido añadido exitosamente.',
                    confirmButtonText: 'OK',
                });

                onClose();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: resultAction.message || 'No se pudo añadir el estatus de activo fijo.',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error al agregar el estatus de activo fijo: ', error);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al añadir el estatus de activo fijo. Por favor, inténtalo de nuevo.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Añadir Nuevo Estatus de Activo Fijo"
            className="modalEstatusAF"
        >
            <div className="mainDiv_modalEstatusAF">
                <h2>Añadir Nuevo Estatus de Activo Fijo</h2>

                <form className="formEstatusAF" onSubmit={handleSubmit}>
                    <div className="dataInputs_EstatusAF">
                        <label>
                            *Descripción del Estatus:
                            <input
                                type="text"
                                value={descripcionEstatusAF}
                                onChange={(e) => setDescripcionEstatusAF(e.target.value)}
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

export default AddEstatusAF;
