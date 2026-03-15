import React, { useState } from 'react'
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { Roles } from '@/@types/mainTypes';
import { addRol, getRoles } from '@/store/administrador/Roles/rolesActions';
import { setListRoles } from '@/store/administrador/Roles/rolesReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Roles/modalRoles.css'


interface AddRolesProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');


const AddRolesControl: React.FC<AddRolesProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [nombreRol, setNombreRol] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const nuevoRol: Roles = {
        name: nombreRol,
        guard_name: 'web'
      }

      const formData = new FormData();

      formData.append('name', nuevoRol.name);
      formData.append('guard_name', 'web');

      console.log(formData)


      const resultAction = await dispatch(addRol(nuevoRol)).unwrap();

      if (resultAction.success){
        const rolesActualizados = await dispatch(getRoles()).unwrap();

        if(rolesActualizados.success){
          dispatch(setListRoles(rolesActualizados.roles!));
          setNombreRol('')

          console.log('Rol agregado y lista recargada:', rolesActualizados.roles);

        } else 
          console.log('Error al agregar el rol: ', resultAction.message)
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Rol Añadida',
        text: 'El Rol ha sido añadido exitosamente.',
        confirmButtonText: 'OK',
    
      });
      onClose(); // Cerrar modal al completar el envío

    } catch (error) {
      console.error('Error al agregar el Rol: ', error);
        
      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el Rol. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
          
  };

      
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modalRoles"
    >

      <div className="mainDiv_modalRoles" >
        <h2>Añadir Rol</h2>

        
        <form onSubmit={handleSubmit} className="formRoles">
                    
          <div className='dataInputs_Roles'>
                    
            <label>
                      *Nombre del Rol:
              <input 
                type="text" 
                value={nombreRol} 
                id='nombreRol'
                name='nombreRol'
                onChange={(e) => setNombreRol(e.target.value)} 
                placeholder='Nombre del Rol'
                required 
              />
            </label>

                
        
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

export default AddRolesControl