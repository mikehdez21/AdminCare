import React, { useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { addClasificacion, getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { setClasificacion } from '@/store/almacenGeneral/Clasificaciones/clasificacionesReducer';
import { Clasificaciones } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import Swal from 'sweetalert2'; 

import '@styles/00_Utils/addeditdelete_Entities.css'

interface AddClasificacionProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');

const AddClasificacion: React.FC<AddClasificacionProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombreClasificacion, setNombreClasificacion] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const nuevaClasificacion: Clasificaciones = {
        descripcion_clasificacionaf: nombreClasificacion,

      };

      const resultAction = await dispatch(addClasificacion(nuevaClasificacion)).unwrap();

      if (resultAction.success) {
        // Si el proveedor fue agregado con éxito, recargar la lista de proveedores
        const clasificacionesActualizados = await dispatch(getClasificaciones()).unwrap();

        if (clasificacionesActualizados.success) {
          dispatch(setClasificacion(clasificacionesActualizados.clasificacion!)); // Actualiza la lista de proveedores en el estado
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
      className="modal_CRUD_Entity"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content">
        <h2>Añadir Nueva Clasificación</h2>

        <div className='inputs_addedit_Entity'>
          <form onSubmit={handleSubmit} className="form_addedit_Entity">
            <label>
            *Nombre de la Clasificación:
              <input 
                type="text" 
                value={nombreClasificacion} 
                onChange={(e) => setNombreClasificacion(e.target.value)} 
                required 
              />
            </label>
            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Añadir</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AddClasificacion;
