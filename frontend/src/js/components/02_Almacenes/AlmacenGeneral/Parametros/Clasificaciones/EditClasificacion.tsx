import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { editClasificacion, getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacenGeneral/Clasificaciones/clasificacionesReducer';
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/Clasificaciones/modalClasificaciones.css';


interface EditClasificacionProps {
  isOpen: boolean;
  onClose: () => void;
  clasificacionToEdit: ClasificacionesAF | null;
}

Modal.setAppElement('#root');

const EditClasificacion: React.FC<EditClasificacionProps> = ({ isOpen, onClose, clasificacionToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreClasificacion, setNombreClasificacion] = useState<string>('');
  const [cuentaContable, setCuentaContable] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);


  // Cuando se abra el modal, cargar los datos de la clasificación seleccionada
  useEffect(() => {
    if (clasificacionToEdit) {
      setNombreClasificacion(clasificacionToEdit.nombre_clasificacion);
      setCuentaContable(clasificacionToEdit.cuenta_contable);
      setEstatusActivo(clasificacionToEdit.estatus_activo);
    }
  }, [clasificacionToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const clasificacionEditado: ClasificacionesAF = {
        id_clasificacion: clasificacionToEdit?.id_clasificacion, // Asegúrate de incluir el ID para la edición
        nombre_clasificacion: nombreClasificacion,
        cuenta_contable: cuentaContable,
        estatus_activo: estatusActivo,


      };

      console.log('Clasificación editada a enviar:', clasificacionEditado);
      const resultAction = await dispatch(editClasificacion(clasificacionEditado)).unwrap();
      console.log(resultAction)


      if (resultAction.success) {
        // Si la clasificación fue editada con éxito, recargar la lista de clasificaciones
        const clasificacionesActualizadas = await dispatch(getClasificaciones()).unwrap();
        if (clasificacionesActualizadas.success) {
          dispatch(setListClasificacion(clasificacionesActualizadas.clasificacion!)); // Actualiza la lista de clasificaciones en el estado
        }

        Swal.fire({
          icon: 'success',
          title: 'Clasificación Editada',
          text: 'La clasificación ha sido editada exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar la clasificación.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar la clasificación:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar la clasificación. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modalClasificaciones"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalClasificaciones">
        <h2>Editar Clasificación</h2>

        <form className="formClasificaciones" onSubmit={handleSubmit}>
          <div className="dataInputs_Clasificaciones">

            <label>
              *Nombre de la Clasificación:
              <input
                type="text"
                value={nombreClasificacion}
                onChange={(e) => setNombreClasificacion(e.target.value)}
                required
              />
            </label>

            <label>
              *Cuenta Contable:
              <input
                type="text"
                value={cuentaContable}
                onChange={(e) => setCuentaContable(e.target.value)}
                required
              />
            </label>

            <label>
              *Estatus Activo
              <input
                type="checkbox"
                checked={estatusActivo}
                id='estatusActivo'
                name='estatusActivo'
                onChange={(e) => setEstatusActivo(e.target.checked)}
                placeholder='Estatus Activo'
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

export default EditClasificacion;
