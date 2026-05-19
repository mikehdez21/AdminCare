import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { createMetodoDepreciacion, fetchMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFActions';
import { setMetodosDepreciacion } from '@/store/almacengeneral/Activos/DepreciacionAF/depreciacionAFReducer';

import '@styles/03_Contabilidad/Configuracion/MetodosDepreciacion/modalMetodoDepreciacion.css';

Modal.setAppElement('#root');

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const AddMetodoDepreciacion: React.FC<Props> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [nombre, setNombre] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [formula, setFormula] = useState<string>('');
    const [tasa, setTasa] = useState<number | ''>('');
    const [activo, setActivo] = useState<boolean>(true);

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

            const result = await dispatch(createMetodoDepreciacion(payload)).unwrap();
            if (result && result.success) {
                // Refrescar lista y actualizar reducer
                const res = await dispatch(fetchMetodosDepreciacion()).unwrap();
                if (res && res.metodos) {
                    dispatch(setMetodosDepreciacion(res.metodos));
                    const metodosDepreciacionActualizados = res.metodos;
                    // Notificación y limpieza del formulario
                    Swal.fire({ icon: 'success', title: 'Método creado', text: `Se agregaron ${metodosDepreciacionActualizados.length} métodos.`, timer: 1200, showConfirmButton: false });
                    setNombre(''); setDescripcion(''); setFormula(''); setTasa(''); setActivo(true);
                    onClose();
                } else {
                    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Método creado pero no se pudo actualizar la lista local.' });
                    onClose();
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'No se pudo crear el método' });
            }
        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Error inesperado' });
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modalComponent_DepreciacionAF">
            <div className="modalDepreciacionAF">
                <h2>Nuevo Método de Depreciación</h2>
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
                            { text: 'Guardar', type: 'submit', className: 'button_addedit' },
                            { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose }
                        ]}
                    />
                </form>
            </div>
        </Modal>
    );
};

export default AddMetodoDepreciacion;
