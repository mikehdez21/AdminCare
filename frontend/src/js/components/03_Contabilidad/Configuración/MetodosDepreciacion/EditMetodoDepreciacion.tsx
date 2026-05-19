import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { updateMetodoDepreciacion, fetchMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { MetodoDepreciacion } from '@/@types/AlmacenGeneralTypes/depreciacionTypes';

import '@styles/03_Contabilidad/Configuracion/MetodosDepreciacion/modalMetodoDepreciacion.css';

Modal.setAppElement('#root');

interface Props {
    isOpen: boolean;
    onClose: () => void;
    metodo: MetodoDepreciacion | null;
}

const EditMetodoDepreciacion: React.FC<Props> = ({ isOpen, onClose, metodo }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [nombre, setNombre] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [formula, setFormula] = useState<string>('');
    const [tasa, setTasa] = useState<number | ''>('');
    const [activo, setActivo] = useState<boolean>(true);

    useEffect(() => {
        if (metodo) {
            setNombre(metodo.nombre_metodo || '');
            setDescripcion(metodo.descripcion_metodo || '');
            setFormula(metodo.formula || '');
            setTasa(metodo.tasa_default ?? '');
            setActivo(typeof metodo.activo === 'boolean' ? metodo.activo : true);
        }
    }, [metodo]);

    if (!metodo) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim()) {
            Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Ingrese un nombre para el método.' });
            return;
        }

        try {
            const payload = {
                nombre_metodo: nombre.trim(),
                descripcion_metodo: descripcion.trim() || undefined,
                formula: formula.trim() || undefined,
                tasa_default: tasa === '' ? undefined : Number(tasa),
                activo,
            } as any;

            const result = await dispatch(updateMetodoDepreciacion({ id: metodo.id_metodo_depreciacion, payload })).unwrap();
            if (result && result.success) {
                await dispatch(fetchMetodosDepreciacion()).unwrap();
                Swal.fire({ icon: 'success', title: 'Método actualizado', timer: 1200, showConfirmButton: false });
                onClose();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'No se pudo actualizar el método' });
            }
        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Error inesperado' });
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modalComponent_DepreciacionAF">
            <div className="modalDepreciacionAF">
                <h2>Editar Método de Depreciación</h2>
                <form onSubmit={handleSubmit} className="divInputs_AddEdit_DepreciacionAF">
                    <label>
                        *Nombre del método
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </label>

                    <label>
                        Descripción
                        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                    </label>

                    <label>
                        Fórmula
                        <input type="text" value={formula} onChange={(e) => setFormula(e.target.value)} />
                    </label>

                    <label>
                        Tasa default (%)
                        <input type="number" step="0.01" min={0} value={tasa as any} onChange={(e) => setTasa(e.target.value === '' ? '' : Number(e.target.value))} />
                    </label>

                    <label>
                        Activo
                        <select value={activo ? '1' : '0'} onChange={(e) => setActivo(e.target.value === '1')}>
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                        </select>
                    </label>

                    <ModalButtons
                        buttons={[
                            { text: 'Guardar cambios', type: 'submit', className: 'button_addedit' },
                            { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose }
                        ]}
                    />
                </form>
            </div>
        </Modal>
    );
};

export default EditMetodoDepreciacion;
