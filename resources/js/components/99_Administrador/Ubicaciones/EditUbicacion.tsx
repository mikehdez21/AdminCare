import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { Ubicaciones } from '@/@types/mainTypes';
import { editUbicacion, getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Ubicaciones/modalUbicaciones.css';

interface EditUbicacionesProps {
  isOpen: boolean;
  onClose: () => void;
  ubicacionToEdit: Ubicaciones | null;
}

Modal.setAppElement('#root');

const EditUbicacion: React.FC<EditUbicacionesProps> = ({ isOpen, onClose, ubicacionToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const [nombreUbicacion, setNombreUbicacion] = useState<string>('');
  const [descripcionUbicacion, setDescripcionUbicacion] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true); 

  useEffect(() => {
    if (ubicacionToEdit) {  
      setNombreUbicacion(ubicacionToEdit.nombre_ubicacion);
      setDescripcionUbicacion(ubicacionToEdit.descripcion_ubicacion);
      setEstatusActivo(ubicacionToEdit.estatus_activo!);        
    }
  }, [ubicacionToEdit]); // Solo se ejecuta cuando ubicacionToEdit cambia

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {


      const ubicacionEditada: Ubicaciones = {
        id_ubicacion: ubicacionToEdit?.id_ubicacion, // Mantener el ID de la ubicación
        nombre_ubicacion: nombreUbicacion,
        descripcion_ubicacion: descripcionUbicacion,
        estatus_activo: estatusActivo
      };
    
      const formData = new FormData();

      formData.append('id_ubicacion', ubicacionEditada.id_ubicacion!.toString());
      formData.append('nombre_ubicacion', ubicacionEditada.nombre_ubicacion);
      formData.append('descripcion_ubicacion', ubicacionEditada.descripcion_ubicacion);
      formData.append('estatus_activo', ubicacionEditada.estatus_activo ? '1' : '0');     

  
      console.log('dataUbicacion_Enviada: ', ubicacionToEdit)
      const resultAction = await dispatch(editUbicacion(ubicacionEditada)).unwrap();
      console.log('Respuesta del servidor:', resultAction);
  
      if (resultAction.success) {   
        // Si la ubicación fue editada con éxito, recargar la lista de ubicaciones
        const ubicacionesActualizadas = await dispatch(getUbicaciones()).unwrap();
        if (ubicacionesActualizadas.success) {
          dispatch(setListUbicaciones(ubicacionesActualizadas.ubicaciones!)); // Actualiza la lista de ubicaciones en el estado
          setNombreUbicacion('')
          setDescripcionUbicacion('')     

          console.log('Ubicación editada y lista recargada:', ubicacionesActualizadas.ubicaciones);

        }

        Swal.fire({
          icon: 'success',
          title: 'Ubicación Editada',
          text: 'La ubicación ha sido editada exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar la ubicación.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar la ubicación:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar la ubicación. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modalUbicaciones"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalUbicaciones" >
        <h2>Editar Ubicación</h2>
        <form onSubmit={handleSubmit} className="formUbicaciones">

          <div className='dataInputs_Ubicaciones'>

            <section>

              <label>
                  *Nombre de Ubicación:
                <input 
                  type="text" 
                  value={nombreUbicacion} 
                  id='nombreUbicacion'
                  name='nombreUbicacion'
                  onChange={(e) => setNombreUbicacion(e.target.value)} 
                  placeholder='Nombre de la ubicación'
                  required 
                />
              </label>

              <label>
                  *Descripción:
                <input 
                  type="text" 
                  value={descripcionUbicacion} 
                  id='descripcionUbicacion'
                  name='descripcionUbicacion'
                  onChange={(e) => setDescripcionUbicacion(e.target.value)} 
                  placeholder='Descripción general de la ubicación'
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

            </section>

          </div>

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

        </form>

      </div>
    </Modal>
  );
};

export default EditUbicacion;
