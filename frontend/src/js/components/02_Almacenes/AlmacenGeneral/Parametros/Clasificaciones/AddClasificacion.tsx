import React, { useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { addClasificacion, getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { setListClasificacion } from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer';
import { ClasificacionesAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/Parametros/Clasificaciones/modalClasificaciones.css';


interface AddClasificacionProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const AddClasificacion: React.FC<AddClasificacionProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombreClasificacion, setNombreClasificacion] = useState<string>('');
  const [cuentaContable, setCuentaContable] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const nuevaClasificacion: ClasificacionesAF = {
        nombre_clasificacion: nombreClasificacion,
        cuenta_contable: cuentaContable,
        estatus_activo: estatusActivo,

      };

      const resultAction = await dispatch(addClasificacion(nuevaClasificacion)).unwrap();

      if (resultAction.success) {
        // Si el proveedor fue agregado con éxito, recargar la lista de proveedores
        const clasificacionesActualizados = await dispatch(getClasificaciones()).unwrap();

        if (clasificacionesActualizados.success) {
          dispatch(setListClasificacion(clasificacionesActualizados.clasificacion!)); // Actualiza la lista de proveedores en el estado
          setNombreClasificacion('')

          console.log('Clasificación agregada y lista recargada:', clasificacionesActualizados.clasificacion);
        }
      } else {
        console.log('Error al agregar la clasificación: ', resultAction.message);
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Clasificación Añadida',
        text: 'La clasificación ha sido añadido exitosamente.',
        confirmButtonText: 'OK',

      });

      onClose(); // Cerrar modal al completar el envío
    } catch (error) {
      console.error('Error al agregar la clasificación: ', error);

      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el proveedor. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',

      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modalClasificaciones"
    >
      <div className="mainDiv_modalClasificaciones">
        <h2>Añadir Nueva Clasificación</h2>

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

export default AddClasificacion;
