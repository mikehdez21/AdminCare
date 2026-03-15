import React, { useState } from 'react'
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { Ubicaciones } from '@/@types/mainTypes';
import { addUbicacion, getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Ubicaciones/modalUbicaciones.css';

interface AddUbicacionProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');


const AddUbicacion: React.FC<AddUbicacionProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombreUbicacion, setNombreUbicacion] = useState<string>('');
  const [descripcionUbicacion, setDescripcionUbicacion] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true); 
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const nuevaUbicacion: Ubicaciones = {
        nombre_ubicacion: nombreUbicacion,
        descripcion_ubicacion: descripcionUbicacion,
        estatus_activo: estatusActivo,
      }

      const formData = new FormData();

      formData.append('nombre_ubicacion', nuevaUbicacion.nombre_ubicacion);
      formData.append('descripcion_ubicacion', nuevaUbicacion.descripcion_ubicacion);
      formData.append('estatus_activo', nuevaUbicacion.estatus_activo.toString());

      const resultAction = await dispatch(addUbicacion(nuevaUbicacion)).unwrap();

      if (resultAction.success){
        const ubicacionesActualizadas = await dispatch(getUbicaciones()).unwrap();

        if(ubicacionesActualizadas.success){
          dispatch(setListUbicaciones(ubicacionesActualizadas.ubicaciones!));
          setNombreUbicacion('')
          setDescripcionUbicacion('')
          setEstatusActivo(true)

          console.log('Ubicación agregada y lista recargada:', ubicacionesActualizadas.ubicaciones);

        } else 
          console.log('Error al agregar la ubicación: ', resultAction.message)
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Ubicación Añadida',
        text: 'La Ubicación ha sido añadida exitosamente.',
        confirmButtonText: 'OK',
    
      });
      onClose(); // Cerrar modal al completar el envío

    } catch (error) {
      console.error('Error al agregar la ubicación: ', error);
        
      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir la ubicación. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
          
  };

  
      
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modalUbicaciones"
    >

      <div className="mainDiv_modalUbicaciones" >
        <h2>Añadir Ubicación</h2>

        
        <form onSubmit={handleSubmit} className="formUbicaciones">
                    
          <div className='dataInputs_Ubicaciones'>
                    
            <section>
        
              <label>
                      *Ubicación:
                <input 
                  type="text" 
                  value={nombreUbicacion} 
                  id='nombreUbicacion'
                  name='nombreUbicacion   '
                  onChange={(e) => setNombreUbicacion(e.target.value)} 
                  placeholder='Nombre de la Ubicación '
                  required 
                />
              </label>

              <label>
                  *Descripción
                <input 
                  type="text" 
                  value={descripcionUbicacion}
                  id='descripcionUbicacion'
                  name='descripcionUbicacion'
                  onChange={(e) => setDescripcionUbicacion(e.target.value)}
                  placeholder='Descripción de la Ubicación'
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
  )
}

export default AddUbicacion