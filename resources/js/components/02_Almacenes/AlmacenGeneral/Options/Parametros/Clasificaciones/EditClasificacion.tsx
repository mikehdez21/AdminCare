import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { editClasificacion, getClasificaciones } from '@/store/almacenGeneral/Clasificaciones/clasificacionesActions';
import { setClasificacion } from '@/store/almacenGeneral/Clasificaciones/clasificacionesReducer';
import { Clasificaciones } from '@/@types/AlmacenGeneralTypes/almacenGeneralTypes';
import Swal from 'sweetalert2'; 

import '@styles/00_Utils/addeditdelete_Entities.css'

interface EditClasificacionProps {
  isOpen: boolean;
  onClose: () => void;
  clasificacionToEdit: Clasificaciones | null;
}

Modal.setAppElement('#root');

const EditClasificacion: React.FC<EditClasificacionProps> = ({ isOpen, onClose, clasificacionToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreClasificacion, setNombreClasificacion] = useState<string>('');


  // Cuando se abra el modal, cargar los datos del proveedor seleccionado
  useEffect(() => {
    if (clasificacionToEdit) {
      setNombreClasificacion(clasificacionToEdit.descripcion_clasificacionaf);
    }
  }, [clasificacionToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const clasificacionEditado: Clasificaciones = {
        descripcion_clasificacionaf: nombreClasificacion,

      };

      const resultAction = await dispatch(editClasificacion(clasificacionEditado)).unwrap();

      console.log(resultAction.success)


      if (resultAction.success) {
        // Si el proveedor fue editado con éxito, recargar la lista de proveedores
        const clasificacionesActualizadas = await dispatch(getClasificaciones()).unwrap();
        if (clasificacionesActualizadas.success) {
          dispatch(setClasificacion(clasificacionesActualizadas.clasificacion!)); // Actualiza la lista de proveedores en el estado
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
      className="modal_CRUD_Entity"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content">
        <h2>Editar Clasificación</h2>

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
              <button type="submit" className="button_addedit">Guardar Cambios</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default EditClasificacion;
