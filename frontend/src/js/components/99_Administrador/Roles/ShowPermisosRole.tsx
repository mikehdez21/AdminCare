import React from 'react';
import Modal from 'react-modal';

import { Roles } from '@/@types/mainTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';

interface showPermisosRoleProps {
    isOpen: boolean;
    onClose: () => void;
    rolToShow: Roles | null;
}

Modal.setAppElement('#root');

const ShowPermisosRole: React.FC<showPermisosRoleProps> = ({ isOpen, onClose, rolToShow }) => {

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modalPermisosRole"
            contentLabel="Permisos del Rol"
        >

            <div className="mainDiv_modalViewPermisos">
                <h2>Permisos del Rol: <br /> {rolToShow?.name}</h2>
                <ul>
                    {rolToShow?.permissions?.map(permiso => (
                        <li key={permiso.id}>{permiso.name}</li>
                    ))}
                </ul>


                <ModalButtons
                    buttons={[
                        {
                            text: 'Cancelar',
                            type: 'button',
                            className: 'button_close',
                            onClick: onClose
                        }
                    ]}
                />
            </div>

        </Modal >
    );
};

export default ShowPermisosRole;
