import React from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import Swal from 'sweetalert2';
import { deleteMetodoDepreciacion, fetchMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { MetodoDepreciacion } from '@/@types/AlmacenGeneralTypes/depreciacionTypes';

import '@styles/03_Contabilidad/Configuracion/MetodosDepreciacion/modalMetodoDepreciacion.css';

Modal.setAppElement('#root');

interface Props {
    isOpen: boolean;
    onClose: () => void;
    metodo: MetodoDepreciacion | null;
}

const DeleteMetodoDepreciacion: React.FC<Props> = ({ isOpen, onClose, metodo }) => {
    const dispatch = useDispatch<AppDispatch>();

    if (!metodo) return null;

    const handleDelete = async () => {
        try {
            const confirm = await Swal.fire({
                title: '¿Eliminar método?',
                text: `Se eliminará el método "${metodo.nombre_metodo}". Esta acción no se puede deshacer.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (confirm.isConfirmed) {
                const result = await dispatch(deleteMetodoDepreciacion(metodo.id_metodo_depreciacion as number)).unwrap();
                if (result && result.success) {
                    await dispatch(fetchMetodosDepreciacion()).unwrap();
                    Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1000, showConfirmButton: false });
                    onClose();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'No se pudo eliminar' });
                }
            }
        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Error inesperado' });
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modalComponent_DepreciacionAF">
            <div className="modalDepreciacionAF">
                <h2>Eliminar Método de Depreciación</h2>

                <div className="divDeleteActivoFijo">
                    <p>¿Está seguro que desea eliminar el método <strong>{metodo.nombre_metodo}</strong>?</p>
                    <small>Esta acción no puede deshacerse y puede afectar cálculos históricos.</small>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className='button_deleteEntity' onClick={handleDelete}>Eliminar</button>
                        <button className='button_close' onClick={onClose}>Cancelar</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteMetodoDepreciacion;
