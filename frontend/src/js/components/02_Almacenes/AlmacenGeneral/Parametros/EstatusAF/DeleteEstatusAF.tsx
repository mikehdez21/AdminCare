import React from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { deleteEstatusAF, getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';
import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/EstatusAF/modalEstatusAF.css';

interface DeleteEstatusAFProps {
    isOpen: boolean;
    onClose: () => void;
    estatusToDelete: EstatusActivosFijos | null;
}

Modal.setAppElement('#root');

const DeleteEstatusAF: React.FC<DeleteEstatusAFProps> = ({ isOpen, onClose, estatusToDelete }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleDelete = async () => {
        try {
            const resultAction = await dispatch(deleteEstatusAF(estatusToDelete!)).unwrap();

            if (resultAction.success) {
                const estatusActualizados = await dispatch(getEstatusAF()).unwrap();
                if (estatusActualizados.success) {
                    dispatch(setListEstatusAF(estatusActualizados.estatusAF ?? []));
                }
            } else {
                console.error('Error al eliminar el estatus AF:', resultAction.message);
            }

            Swal.fire({
                icon: 'success',
                title: 'Estatus eliminado',
                text: 'El estatus de activos fijos ha sido eliminado exitosamente.',
                confirmButtonText: 'OK',
            });

            onClose();
        } catch (error) {
            console.error('Error al eliminar el estatus AF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al eliminar el estatus de activos fijos. Por favor, inténtalo de nuevo.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Eliminar Estatus AF"
            className="modalEstatusAF"
        >
            <div className="mainDiv_modalEstatusAF">
                <h2>Eliminar Estatus de Activos Fijos</h2>

                <div className='divDeleteEstatusAF'>
                    <p>¿Quiere eliminar el estatus <br /> <strong>{estatusToDelete?.descripcion_estatusaf}</strong>?</p>
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

export default DeleteEstatusAF;
