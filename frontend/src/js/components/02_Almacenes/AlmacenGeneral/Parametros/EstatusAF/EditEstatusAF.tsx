import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { AppDispatch } from '@/store/store';
import { editEstatusAF, getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { setListEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFReducer';
import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';

interface EditEstatusAFProps {
  isOpen: boolean;
  onClose: () => void;
  estatusToEdit: EstatusActivosFijos | null;
}

Modal.setAppElement('#root');

const EditEstatusAF: React.FC<EditEstatusAFProps> = ({ isOpen, onClose, estatusToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [descripcionEstatusAF, setDescripcionEstatusAF] = useState('');

  useEffect(() => {
    if (estatusToEdit) setDescripcionEstatusAF(estatusToEdit.descripcion_estatusaf || '');
  }, [estatusToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(
        editEstatusAF({
          id_estatusaf: estatusToEdit?.id_estatusaf,
          descripcion_estatusaf: descripcionEstatusAF,
        })
      ).unwrap();

      if (resultAction.success) {
        const estatusActualizados = await dispatch(getEstatusAF()).unwrap();
        if (estatusActualizados.success) {
          dispatch(setListEstatusAF(estatusActualizados.estatusAF ?? []));
        }

        Swal.fire({
          icon: 'success',
          title: 'Estatus Editado',
          text: 'El estatus de activos fijos ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el estatus.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el estatus de activos fijos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el estatus. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Estatus de Activos Fijos"
      className="modalTipoFactura"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalTipoFactura">
        <h2>Editar Estatus de Activos Fijos</h2>
        <form className="formTipoFactura" onSubmit={handleSubmit}>
          <div className="dataInputs_TipoFactura">
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
                { text: 'Guardar', type: 'submit', className: 'button_addedit' },
                { text: 'Cancelar', type: 'button', className: 'button_close', onClick: onClose },
              ]}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditEstatusAF;